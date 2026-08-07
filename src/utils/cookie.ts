import type { CookieOptions, Request, Response } from "express";

const setCookies = (res: Response, key: string, value: string, options: CookieOptions) => {
  res.cookie(key, value, options);
};

const getCookies = (req: Request, key: string): string | undefined => {
  if (req.cookies && req.cookies[key]) {
    return req.cookies[key];
  }
  const rawCookie = req.headers.cookie;
  if (!rawCookie) return undefined;
  const match = rawCookie.match(new RegExp("(?:^|; )" + key + "=([^;]*)"));
  return match ? decodeURIComponent(match[1] ?? "") : undefined;
};

const clearCookies = (res: Response, key: string, options: CookieOptions) => {
  res.clearCookie(key, options);
};

export const cookieUtils = {
  setCookies,
  getCookies,
  clearCookies,
};
