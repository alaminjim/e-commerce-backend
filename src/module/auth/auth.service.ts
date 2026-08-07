import { auth } from "../../config/auth";
import { prisma } from "../../config/prisma";
import { ApiError } from "../../utils/ApiError";
import { jwtUtils } from "../../utils/jwt";
import { tokenUtils } from "../../utils/token";
import { envConfig } from "../../config/env";
import type { LoginInput, RegisterInput } from "./auth.types";

export type HeadersMap = Record<string, string>;

const register = async (input: RegisterInput, headers?: HeadersMap) => {
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email: { equals: input.email, mode: "insensitive" } }, { phone: input.phone }],
    },
  });

  if (existingUser) {
    if (existingUser.email.toLowerCase() === input.email.toLowerCase()) {
      throw new ApiError(409, "Email is already registered");
    }
    throw new ApiError(409, "Phone number is already in use by another account");
  }

  const result = await auth.api.signUpEmail({
    body: {
      name: input.name,
      email: input.email,
      password: input.password,
      phone: input.phone,
    },
    headers,
  });

  if (!result || !result.user) {
    throw new ApiError(400, "Failed to register user");
  }

  const payload = {
    id: result.user.id,
    email: result.user.email,
    role: result.user.role ?? "USER",
  };

  const accessToken = tokenUtils.accessToken(payload);
  const refreshToken = tokenUtils.refreshToken(payload);

  return {
    user: result.user,
    token: result.token,
    accessToken,
    refreshToken,
  };
};

const login = async (input: LoginInput, headers?: HeadersMap) => {
  let result;
  try {
    result = await auth.api.signInEmail({
      body: {
        email: input.email,
        password: input.password,
      },
      headers,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : "Invalid email or password";
    throw new ApiError(401, errorMsg.includes("Invalid") ? errorMsg : "Invalid email or password");
  }

  if (!result || !result.user) {
    throw new ApiError(401, "Invalid email or password");
  }

  const payload = {
    id: result.user.id,
    email: result.user.email,
    role: result.user.role ?? "USER",
  };

  const accessToken = tokenUtils.accessToken(payload);
  const refreshToken = tokenUtils.refreshToken(payload);

  return {
    user: result.user,
    token: result.token,
    accessToken,
    refreshToken,
  };
};

const logout = async (headers: HeadersMap) => {
  await auth.api.signOut({ headers });
  return { success: true };
};

const getSession = async (headers: HeadersMap) => {
  return auth.api.getSession({ headers });
};

const refreshTokens = async (token: string) => {
  const result = jwtUtils.verifiedToken(token, envConfig.JWT_REFRESH_SECRET);

  if (!result.success || !result.verified?.id) {
    throw new ApiError(401, "Invalid or expired refresh token. Please log in again.");
  }

  const user = await prisma.user.findUnique({
    where: { id: result.verified.id },
  });

  if (!user) {
    throw new ApiError(401, "User account no longer exists. Please register again.");
  }

  if (user.status !== "ACTIVE") {
    throw new ApiError(403, "Your account has been suspended. Contact support.");
  }

  const payload = {
    id: user.id,
    email: user.email,
    role: user.role,
  };

  const accessToken = tokenUtils.accessToken(payload);
  const newRefreshToken = tokenUtils.refreshToken(payload);

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
    accessToken,
    refreshToken: newRefreshToken,
  };
};

export const authService = {
  register,
  login,
  logout,
  getSession,
  refreshTokens,
};
