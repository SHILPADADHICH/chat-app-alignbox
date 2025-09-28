import { Router } from "express";
import { register, login, getProfile } from "../controllers/auth";
import { authenticateToken } from "../middleware/auth";

const authRoutes = Router();

authRoutes.post("/register", register);
authRoutes.post("/login", login);
authRoutes.get("/profile", authenticateToken, getProfile);

export default authRoutes;
