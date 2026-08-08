import { z } from "zod";
import type { Request, Response } from "express";

import { asyncHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/ApiResponse";
import { createReviewSchema } from "./review.types";
import { reviewService } from "./review.service";

const idParamSchema = z.object({ id: z.string().min(1) });
const productIdParamSchema = z.object({ productId: z.string().min(1) });

export const listReviews = asyncHandler(async (_req: Request, res: Response) => {
  const data = await reviewService.list();

  res.json(new ApiResponse(200, data, "Reviews fetched successfully"));
});

export const listProductReviews = asyncHandler(async (req: Request, res: Response) => {
  const { productId } = productIdParamSchema.parse(req.params);
  const data = await reviewService.listByProduct(productId);

  res.json(new ApiResponse(200, data, "Product reviews fetched successfully"));
});

export const createReview = asyncHandler(async (req: Request, res: Response) => {
  const input = createReviewSchema.parse(req.body);
  const data = await reviewService.create(input, req.user?.id ?? null);

  res.status(201).json(new ApiResponse(201, data, "Review submitted successfully"));
});

export const deleteReview = asyncHandler(async (req: Request, res: Response) => {
  const { id } = idParamSchema.parse(req.params);
  const data = await reviewService.remove(id);

  res.json(new ApiResponse(200, data, "Review deleted successfully"));
});
