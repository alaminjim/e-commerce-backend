import { Router } from "express";
import type { Request, Response, NextFunction } from "express";

import { auth, getRealAuth } from "../../config/auth";
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

/**
 * Better Auth fallback for all other endpoints (OAuth callback, magic-link, etc.)
 * We build a Web API Request manually and send back the Web API Response ourselves,
 * using headers.forEach() instead of for...of to avoid "headers is not iterable"
 * errors that occur with the toNodeHandler helper in some Node.js environments.
 */
router.use(async (req: Request, res: Response, next: NextFunction) => {
  try {
    const realAuth = await getRealAuth();

    // Build the full URL from the Express request
    const protocol =
      (req.headers["x-forwarded-proto"] as string) ?? req.protocol ?? "https";
    const host =
      (req.headers["x-forwarded-host"] as string) ??
      req.headers.host ??
      "localhost";
    const url = `${protocol}://${host}${req.originalUrl}`;

    // Convert Node.js/Express headers → Web API Headers
    const webHeaders = new Headers();
    for (const [key, val] of Object.entries(req.headers)) {
      if (!val) continue;
      webHeaders.set(key, Array.isArray(val) ? val.join(", ") : val);
    }

    // Build the Web API Request body
    let body: string | undefined;
    if (req.method !== "GET" && req.method !== "HEAD") {
      body =
        req.body && Object.keys(req.body).length > 0
          ? JSON.stringify(req.body)
          : undefined;
    }

    const webRequest = new Request(url, {
      method: req.method,
      headers: webHeaders,
      body,
    });

    // Call the real Better Auth handler
    const webResponse: Response_API = await realAuth.handler(webRequest);

    // Set status
    res.statusCode = webResponse.status;

    // Copy response headers using .forEach() — avoids the "not iterable" crash
    webResponse.headers.forEach((value: string, key: string) => {
      res.setHeader(key, value);
    });

    // Stream body
    const text = await webResponse.text();
    res.end(text);
  } catch (error) {
    next(error);
  }
});

// Alias type so there's no naming collision with Express's Response
type Response_API = globalThis.Response;

export const authRouter = router;
