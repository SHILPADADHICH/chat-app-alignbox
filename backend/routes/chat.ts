import { Router } from "express";
import { 
  createGroup, 
  getGroups, 
  joinGroup, 
  sendMessage, 
  getMessages, 
  toggleAnonymousMode 
} from "../controllers/chat";
import { authenticateToken } from "../middleware/auth";

const chatRoutes = Router();

// All chat routes require authentication
chatRoutes.use(authenticateToken);

// Group routes
chatRoutes.post("/groups", createGroup);
chatRoutes.get("/groups", getGroups);
chatRoutes.post("/groups/:groupId/join", joinGroup);

// Message routes
chatRoutes.post("/messages", sendMessage);
chatRoutes.get("/groups/:groupId/messages", getMessages);

// User settings
chatRoutes.put("/anonymous-mode", toggleAnonymousMode);

export default chatRoutes;
