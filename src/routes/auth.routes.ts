import { Router } from "express";
import { AuthController } from "../controllers/auth.controller";
import { confirmLimiter } from "../middleware/rate-limit.middleware";

const router = Router();

// POST /admin/login - Autenticar admin
router.post("/login", confirmLimiter, AuthController.login);

export default router;
