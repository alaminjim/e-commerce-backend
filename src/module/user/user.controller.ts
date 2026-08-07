import { z } from "zod";
import type { Request, Response } from "express";

import { asyncHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/ApiResponse";
import { ApiError } from "../../utils/ApiError";
import {
  listUserQuerySchema,
  updateUserSchema,
  updateUserStatusSchema,
} from "./user.types";
import { userService } from "./user.service";

const idParamSchema = z.object({ id: z.string().min(1, "Invalid user id") });

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.id) {
    throw new ApiError(401, "Unauthorized access");
  }

  const data = await userService.getMe(req.user.id);
  res.json(new ApiResponse(200, data, "User profile fetched successfully"));
});

export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = idParamSchema.parse(req.params);
  const data = await userService.getById(id);

  res.json(new ApiResponse(200, data, "User fetched successfully"));
});

export const updateMe = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.id) {
    throw new ApiError(401, "Unauthorized access");
  }

  const input = updateUserSchema.parse(req.body);
  const data = await userService.updateMe(req.user.id, input);

  res.json(new ApiResponse(200, data, "User profile updated successfully"));
});

export const listUsers = asyncHandler(async (req: Request, res: Response) => {
  const query = listUserQuerySchema.parse(req.query);
  const data = await userService.list(query);

  res.json(new ApiResponse(200, data, "Users fetched successfully"));
});

export const updateUserStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = idParamSchema.parse(req.params);
    const input = updateUserStatusSchema.parse(req.body);
    const data = await userService.updateStatus(id, input);

    res.json(new ApiResponse(200, data, "User status updated successfully"));
  }
);
