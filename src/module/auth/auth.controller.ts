import type { Request, Response } from "express";
import type { IncomingHttpHeaders } from "http";

// Lightweight headers converter to avoid importing the ESM-only `better-auth/node`.
const fromNodeHeaders = (
  headers: IncomingHttpHeaders | Record<string, unknown>,
): Record<string, string> => {
  const out: Record<string, string> = {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  for (const [k, v] of Object.entries(headers as Record<string, any>)) {
    if (v === undefined || v === null) continue;
    out[k] = Array.isArray(v) ? v.join(",") : String(v);
  }
  return out;
};

import { asyncHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/ApiResponse";
import { ApiError } from "../../utils/ApiError";
import { setCookieUtils } from "../../utils/cookieSet";
import { cookieUtils } from "../../utils/cookie";
import { tokenUtils } from "../../utils/token";
import { prisma } from "../../config/prisma";
import { envConfig } from "../../config/env";
import { loginSchema, registerSchema } from "./auth.types";
import { authService } from "./auth.service";

export const registerUser = asyncHandler(async (req: Request, res: Response) => {
  const input = registerSchema.parse(req.body);
  const data = await authService.register(input);

  setCookieUtils.setAccessToken(res, data.accessToken);
  setCookieUtils.setRefreshToken(res, data.refreshToken);
  if (data.token) {
    setCookieUtils.setBetterAuthToken(res, data.token);
  }

  res.status(201).json(new ApiResponse(201, data, "User registered successfully"));
});

export const loginUser = asyncHandler(async (req: Request, res: Response) => {
  const input = loginSchema.parse(req.body);
  const data = await authService.login(input);

  setCookieUtils.setAccessToken(res, data.accessToken);
  setCookieUtils.setRefreshToken(res, data.refreshToken);
  if (data.token) {
    setCookieUtils.setBetterAuthToken(res, data.token);
  }

  res.json(new ApiResponse(200, data, "Logged in successfully"));
});

export const logoutUser = asyncHandler(async (req: Request, res: Response) => {
  const headers = fromNodeHeaders(req.headers);
  try {
    await authService.logout(headers);
  } catch {
    // Session may already be invalid/expired — auth cookies are still
    // cleared below so the client never stays stuck in a stale state.
  }

  setCookieUtils.clearAuthCookies(res);

  res.json(new ApiResponse(200, { success: true }, "Logged out successfully"));
});

/**
 * Unconditionally clears the auth cookies (accessToken, refreshToken,
 * better-auth.session_token). Used by the client when a token refresh fails,
 * so stale httpOnly cookies from a deleted account cannot cause a 401 loop.
 */
export const clearAuthCookiesController = asyncHandler(async (req: Request, res: Response) => {
  // Cheap logout-CSRF hardening: only honor browser requests from our own
  // origins. Non-browser clients (no Origin header) are still allowed.
  const origin = req.headers.origin;
  if (origin && !envConfig.CLIENT_ORIGINS.includes(origin)) {
    throw new ApiError(403, "Forbidden origin");
  }

  setCookieUtils.clearAuthCookies(res);
  res.json(new ApiResponse(200, { success: true }, "Auth cookies cleared"));
});

export const getSessionUser = asyncHandler(async (req: Request, res: Response) => {
  const headers = fromNodeHeaders(req.headers);
  const data = await authService.getSession(headers);

  // Social (Google/Facebook) login only sets the Better Auth session cookie.
  // Whenever a valid session exists, (re)mint the custom JWT cookies so they
  // always match the session's user. This also heals stale tokens left over
  // from a previously deleted account — without this, those old tokens would
  // keep failing with "User account no longer exists" forever.
  if (data?.session && data?.user?.id) {
    const dbUser = await prisma.user.findUnique({
      where: { id: data.user.id },
    });

    if (dbUser) {
      const payload = {
        id: dbUser.id,
        email: dbUser.email,
        role: dbUser.role ?? "USER",
      };

      setCookieUtils.setAccessToken(res, tokenUtils.accessToken(payload));
      setCookieUtils.setRefreshToken(res, tokenUtils.refreshToken(payload));
    }
  }

  res.json(new ApiResponse(200, data, "Session fetched successfully"));
});

export const refreshTokenController = asyncHandler(async (req: Request, res: Response) => {
  const token =
    cookieUtils.getCookies(req, "refreshToken") ?? (req.body?.refreshToken as string | undefined);

  if (!token) {
    throw new ApiError(401, "Refresh token is missing. Please log in again.");
  }

  const data = await authService.refreshTokens(token);

  setCookieUtils.setAccessToken(res, data.accessToken);
  setCookieUtils.setRefreshToken(res, data.refreshToken);

  res.json(new ApiResponse(200, data, "Token refreshed successfully"));
});
