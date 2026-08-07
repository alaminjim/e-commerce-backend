/* eslint-disable @typescript-eslint/no-unused-vars */
import crypto from "crypto";
import type { Response } from "express";

import { cookieUtils } from "./cookie";
import { envConfig } from "../config/env";

const isProduction = process.env.NODE_ENV === "production";

/**
 * Sign a value the same way Better Auth does when setting its session cookie
 * (value.signature where signature = HMAC-SHA256(value, secret), base64 with
 * padding). Better Auth's getSession reads the cookie via getSignedCookie, so
 * an unsigned cookie is silently rejected (getSession returns null).
 */
const signBetterAuthValue = (value: string, secret: string): string => {
  const signature = crypto.createHmac("sha256", secret).update(value).digest("base64");
  return `${value}.${signature}`;
};

/**
 * Cross-origin cookies between Vercel (client) and Render (server) over HTTPS
 * REQUIRE `sameSite: "none"` AND `secure: true`.
 * If `secure` is false when `sameSite` is "none", modern browsers (Chrome/Safari)
 * will immediately reject and drop the cookie.
 */
const cookieOptions = {
  httpOnly: true,
  sameSite: "none" as const,
  secure: true,
  path: "/",
};

const setAccessToken = (res: Response, token: string) => {
  cookieUtils.setCookies(res, "accessToken", token, {
    ...cookieOptions,
    maxAge: 24 * 60 * 60 * 1000,
  });
};

const setRefreshToken = (res: Response, token: string) => {
  cookieUtils.setCookies(res, "refreshToken", token, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};

const setBetterAuthToken = (res: Response, token: string) => {
  cookieUtils.setCookies(
    res,
    "better-auth.session_token",
    signBetterAuthValue(token, envConfig.BETTER_AUTH_SECRET),
    {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000,
    },
  );
};

const clearAuthCookies = (res: Response) => {
  cookieUtils.clearCookies(res, "accessToken", cookieOptions);
  cookieUtils.clearCookies(res, "refreshToken", cookieOptions);
  cookieUtils.clearCookies(res, "better-auth.session_token", cookieOptions);
};

export const setCookieUtils = {
  setAccessToken,
  setRefreshToken,
  setBetterAuthToken,
  clearAuthCookies,
};
