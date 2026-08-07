import type { Request, Response, NextFunction } from "express";
import { fromNodeHeaders } from "better-auth/node";

import { auth } from "../config/auth";
import { envConfig } from "../config/env";
import { ApiError } from "../utils/ApiError";
import { cookieUtils } from "../utils/cookie";
import { jwtUtils } from "../utils/jwt";
import { prisma } from "../config/prisma";

// ─── Helper ────────────────────────────────────────────────────────────────────
/** Extract Bearer token from Authorization header safely */
const extractBearerToken = (authHeader: string | undefined): string | null => {
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7).trim();
  return token.length > 0 ? token : null;
};

// ─── requireAuth ───────────────────────────────────────────────────────────────
/**
 * Protects routes. Authentication order:
 *   1. Better Auth session (cookie: better-auth.session_token)
 *   2. Custom JWT accessToken (cookie: accessToken, or Authorization: Bearer <token>)
 * Sets req.user on success.
 */
export const requireAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    // ── Step 1: Better Auth session ──────────────────────────────────────────
    const sessionData = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (sessionData?.user) {
      const dbUser = await prisma.user.findUnique({
        where: { id: sessionData.user.id },
      });

      if (!dbUser) {
        return next(new ApiError(401, "User account no longer exists."));
      }

      if (dbUser.status !== "ACTIVE") {
        return next(new ApiError(403, "Your account has been suspended."));
      }

      req.user = dbUser;
      req.session = sessionData.session;
      return next();
    }

    // ── Step 2: Custom JWT accessToken ───────────────────────────────────────
    const rawToken =
      cookieUtils.getCookies(req, "accessToken") ??
      extractBearerToken(req.headers.authorization);

    if (!rawToken) {
      return next(new ApiError(401, "Unauthorized. Please log in."));
    }

    const result = jwtUtils.verifiedToken(rawToken, envConfig.JWT_ACCESS_SECRET);

    if (!result.success || !result.verified?.id) {
      return next(new ApiError(401, "Access token is invalid or expired. Please log in again."));
    }

    const dbUser = await prisma.user.findUnique({
      where: { id: result.verified.id },
    });

    if (!dbUser) {
      return next(new ApiError(401, "User account no longer exists."));
    }

    if (dbUser.status !== "ACTIVE") {
      return next(new ApiError(403, "Your account has been suspended. Contact support."));
    }

    req.user = dbUser;
    return next();
  } catch (error) {
    next(error);
  }
};

// ─── optionalAuth ──────────────────────────────────────────────────────────────
/**
 * Sets req.user if a valid session or token is found.
 * Does NOT throw on failure — continues silently.
 */
export const optionalAuth = async (
  req: Request,
  _res: Response,
  next: NextFunction
) => {
  try {
    const sessionData = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (sessionData?.user) {
      const dbUser = await prisma.user.findUnique({
        where: { id: sessionData.user.id },
      });
      if (dbUser && dbUser.status === "ACTIVE") {
        req.user = dbUser;
        req.session = sessionData.session;
        return next();
      }
    }

    const rawToken =
      cookieUtils.getCookies(req, "accessToken") ??
      extractBearerToken(req.headers.authorization);

    if (rawToken) {
      const result = jwtUtils.verifiedToken(rawToken, envConfig.JWT_ACCESS_SECRET);
      if (result.success && result.verified?.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: result.verified.id },
        });
        if (dbUser && dbUser.status === "ACTIVE") {
          req.user = dbUser;
        }
      }
    }

    next();
  } catch {
    // Never block on optional auth
    next();
  }
};

// ─── restrictTo ────────────────────────────────────────────────────────────────
/**
 * Role-based guard. Must come AFTER requireAuth.
 *
 * Usage:
 *   router.delete("/product/:id", requireAuth, restrictTo("ADMIN"), handler);
 *
 * @param roles - Allowed roles. Example: "ADMIN", "SELLER", "USER"
 */
export const restrictTo = (...roles: string[]) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new ApiError(401, "Unauthorized. Please log in."));
      return;
    }

    // Safely cast — Better Auth User may not expose role directly
    const userRole =
      (req.user as { role?: string | null }).role?.toUpperCase() ?? "USER";

    const normalizedAllowed = roles.map((r) => r.toUpperCase());

    if (!normalizedAllowed.includes(userRole)) {
      next(
        new ApiError(
          403,
          `Forbidden. Required role: [${roles.join(", ")}]. Your role: ${userRole}.`
        )
      );
      return;
    }

    next();
  };
};
