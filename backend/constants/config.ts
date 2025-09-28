import "../utils/config";

export const PORT = process.env.PORT || 8000;

export const NODE_ENV = process.env.NODE_ENV || "development";

export const TIMESTAMP = new Date().toLocaleString("en-US", {
  timeZone: "Asia/Kolkata",
});

export const API_VERSION = process.env.API_VERSION || "1.0.0";

export const CORS_ORIGINS = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(",").map((origin) => origin.trim())
  : "*";

export const DATABASE_URL = process.env.DATABASE_URL || "postgresql://postgres:password@localhost:5432/chat_app";
