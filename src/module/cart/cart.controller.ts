import { z } from "zod";
import type { Request, Response } from "express";

import { asyncHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/ApiResponse";
import { addCartSchema, updateCartQuantitySchema } from "./cart.types";
import { cartService } from "./cart.service";

const productIdParamSchema = z.object({ productId: z.string().min(1) });

export const listCart = asyncHandler(async (req: Request, res: Response) => {
  const data = await cartService.list(req.user?.id ?? null);

  res.json(new ApiResponse(200, data, "Cart fetched successfully"));
});

export const addToCart = asyncHandler(async (req: Request, res: Response) => {
  const input = addCartSchema.parse(req.body);
  const data = await cartService.add(req.user?.id ?? null, input);

  res.status(201).json(new ApiResponse(201, data, "Product added to cart"));
});

export const updateCartQuantity = asyncHandler(
  async (req: Request, res: Response) => {
    const { productId } = productIdParamSchema.parse(req.params);
    const input = updateCartQuantitySchema.parse(req.body);
    const data = await cartService.updateQuantity(
      req.user?.id ?? null,
      productId,
      input
    );

    res.json(new ApiResponse(200, data, "Cart quantity updated successfully"));
  }
);

export const removeFromCart = asyncHandler(
  async (req: Request, res: Response) => {
    const { productId } = productIdParamSchema.parse(req.params);
    const data = await cartService.remove(req.user?.id ?? null, productId);

    res.json(new ApiResponse(200, data, "Product removed from cart"));
  }
);

export const clearCart = asyncHandler(async (req: Request, res: Response) => {
  const data = await cartService.clear(req.user?.id ?? null);

  res.json(new ApiResponse(200, data, "Cart cleared successfully"));
});
