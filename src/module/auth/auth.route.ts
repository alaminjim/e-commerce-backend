import { Router } from "express";
import { toNodeHandler } from "better-auth/node";

import { auth } from "../../config/auth";
import {
  clearAuthCookiesController,
  getSessionUser,
  loginUser,
  logoutUser,
  refreshTokenController,
  registerUser,
} from "./auth.controller";

const router = Router();
const authHandler = toNodeHandler(auth);

import { optionalAuth } from "../../middleware/auth";

// Custom routes — register/login/logout/session/refresh
router.post("/register", registerUser);
router.post("/sign-up/email", registerUser);

router.post("/login", loginUser);
router.post("/sign-in/email", loginUser);

router.post("/logout", logoutUser);
router.post("/sign-out", logoutUser);

router.get("/get-session", optionalAuth, getSessionUser);
router.get("/session", optionalAuth, getSessionUser);

router.post("/refresh-token", refreshTokenController);
router.post("/clear-cookies", clearAuthCookiesController);

// Better Auth fallback for all other endpoints (OAuth, magic-link, etc.)
router.use(async (req, res, next) => {
  try {
    await authHandler(req, res);
  } catch (error) {
    next(error);
  }
});

export const authRouter = router;
