import type { ErrorRequestHandler } from "express";
import { z } from "zod";

import { env } from "../config/env";
import { ApiError } from "../utils/ApiError";

const toApiError = (err: unknown): ApiError => {
  if (err instanceof ApiError) {
    return err;
  }

  if (err instanceof z.ZodError) {
    return new ApiError(400, err.issues[0]?.message ?? "Validation failed");
  }

  if (typeof err === "object" && err !== null && "status" in err) {
    const statusErr = err as { status: number; message?: string };
    return new ApiError(statusErr.status, statusErr.message ?? "Something went wrong");
  }

  return new ApiError(500, err instanceof Error ? err.message : "Something went wrong");
};

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  const error = toApiError(err);

  if (env.NODE_ENV === "development") {
    console.error(err);
  }

  res.status(error.statusCode).json({
    success: error.success,
    statusCode: error.statusCode,
    message: error.message,
    data: error.data,
    stack: env.NODE_ENV === "development" ? error.stack : undefined,
  });
};
