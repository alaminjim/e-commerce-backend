import { z } from "zod";
import type { Request, Response } from "express";

import { asyncHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/ApiResponse";
import { addWishlistSchema } from "./wishlist.types";
import { wishlistService } from "./wishlist.service";

const idParamSchema = z.object({ productId: z.string().min(1) });

export const listWishlist = asyncHandler(async (req: Request, res: Response) => {
  const data = await wishlistService.list(req.user?.id ?? null);

  res.json(new ApiResponse(200, data, "Wishlist fetched successfully"));
});

export const addToWishlist = asyncHandler(async (req: Request, res: Response) => {
  const { productId } = addWishlistSchema.parse(req.body);
  const data = await wishlistService.add(req.user?.id ?? null, productId);

  res.status(201).json(new ApiResponse(201, data, "Product added to wishlist"));
});

export const removeFromWishlist = asyncHandler(
  async (req: Request, res: Response) => {
    const { productId } = idParamSchema.parse(req.params);
    const data = await wishlistService.remove(req.user?.id ?? null, productId);

    res.json(new ApiResponse(200, data, "Product removed from wishlist"));
  }
);
