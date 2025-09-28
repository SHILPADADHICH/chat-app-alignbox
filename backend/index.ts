import bodyParser from "body-parser";
import cors from "cors";
import dotenv from "dotenv";
import express from "express";
import { createServer } from "http";
import { Server, Socket } from "socket.io";

// locals and configs
import { CORS_ORIGINS, PORT } from "./constants/config";
import { getLocalIpAddress } from "./utils/config";
import { configureLogger } from "./utils/logger";
import prisma from "./database/connection/prisma";

// Routes
import { baseRoutes, authRoutes, chatRoutes } from "./routes";

dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      // Allow localhost and 127.0.0.1 on any port
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        return callback(null, true);
      }
      
      // Allow origins from CORS_ORIGINS environment variable
      if (CORS_ORIGINS.includes('*') || CORS_ORIGINS.includes(origin)) {
        return callback(null, true);
      }
      
      callback(new Error('Not allowed by CORS'));
    },
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Setup request logging with custom Morgan configuration
const logger = configureLogger();
if (Array.isArray(logger)) {
  logger.forEach((middleware) => app.use(middleware));
} else {
  app.use(logger);
}

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (!origin) return callback(null, true);
      
      // Allow localhost and 127.0.0.1 on any port
      if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
        return callback(null, true);
      }
      
      // Allow origins from CORS_ORIGINS environment variable
      if (CORS_ORIGINS.includes('*') || CORS_ORIGINS.includes(origin)) {
        return callback(null, true);
      }
      
      callback(new Error('Not allowed by CORS'));
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Session-ID"],
    exposedHeaders: ["X-Session-ID"],
    credentials: true,
  })
);

// Parse JSON requests
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// API routes
app.use("/", baseRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/chat", chatRoutes);

// Socket.IO connection handling
io.on("connection", (socket: Socket) => {
  console.log("User connected:", socket.id);

  socket.on("join-group", (groupId: number) => {
    socket.join(`group-${groupId}`);
    console.log(`User ${socket.id} joined group ${groupId}`);
  });

  socket.on("leave-group", (groupId: number) => {
    socket.leave(`group-${groupId}`);
    console.log(`User ${socket.id} left group ${groupId}`);
  });

  socket.on("send-message", (data: { groupId: number; message: any }) => {
    console.log(`Broadcasting message to group ${data.groupId}:`, data.message);
    // Broadcast message to all users in the group (including sender)
    io.to(`group-${data.groupId}`).emit("new-message", data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// start the server
const startServer = async () => {
  try {
    // Connect to database
    await prisma.$connect();
    console.log("Database connected successfully");

    let currentPort = parseInt(PORT.toString());
    let maxRetries = 10;
    let retryCount = 0;

    const attemptListen = () => {
      return new Promise<void>((resolve, reject) => {
        server
          .listen(currentPort)
          .on("error", (err: NodeJS.ErrnoException) => {
            if (err.code === "EADDRINUSE" && retryCount < maxRetries) {
              retryCount++;
              currentPort++;
              console.log(
                `Port ${currentPort - 1} is in use, trying port ${currentPort}...`
              );
              server.close();
              attemptListen().then(resolve).catch(reject);
            } else {
              reject(err);
            }
          })
          .on("listening", () => {
            const ipAddress = getLocalIpAddress();
            console.log(`Server is up and running on port ${currentPort}`);
            console.log(`Local: http://localhost:${currentPort}`);
            if (ipAddress) {
              console.log(`Network: http://${ipAddress}:${currentPort}`);
            }
            resolve();
          });
      });
    };

    await attemptListen();
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
