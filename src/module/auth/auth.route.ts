import { Router } from "express";

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
    // Dynamically import the node integration (ESM) at request time so the function
    // doesn't require() an ES module during startup.
    const mod = await import("better-auth/node");
    const authHandler = mod.toNodeHandler(auth);
    await authHandler(req, res);
  } catch (error) {
    next(error);
  }
});

export const authRouter = router;
