import { z } from "zod";
import type { Request, Response } from "express";

import { asyncHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/ApiResponse";
import {
  createProductSchema,
  listProductQuerySchema,
  updateProductSchema,
} from "./product.types";
import { productService } from "./product.service";

const idParamSchema = z.object({ id: z.string().min(1) });
const slugParamSchema = z.object({ slug: z.string().min(1) });

export const listProducts = asyncHandler(async (req: Request, res: Response) => {
  const query = listProductQuerySchema.parse(req.query);
  const data = await productService.list(query);

  res.json(new ApiResponse(200, data, "Products fetched successfully"));
});

export const getProductById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = idParamSchema.parse(req.params);
  const data = await productService.getById(id);

  res.json(new ApiResponse(200, data, "Product fetched successfully"));
});

export const getProductBySlug = asyncHandler(async (req: Request, res: Response) => {
  const { slug } = slugParamSchema.parse(req.params);
  const data = await productService.getBySlug(slug);

  res.json(new ApiResponse(200, data, "Product fetched successfully"));
});

export const createProduct = asyncHandler(async (req: Request, res: Response) => {
  const input = createProductSchema.parse(req.body);
  const data = await productService.create(input);

  res.status(201).json(new ApiResponse(201, data, "Product created successfully"));
});

export const updateProduct = asyncHandler(async (req: Request, res: Response) => {
  const { id } = idParamSchema.parse(req.params);
  const input = updateProductSchema.parse(req.body);
  const data = await productService.update(id, input);

  res.json(new ApiResponse(200, data, "Product updated successfully"));
});

export const deleteProduct = asyncHandler(async (req: Request, res: Response) => {
  const { id } = idParamSchema.parse(req.params);
  const data = await productService.remove(id);

  res.json(new ApiResponse(200, data, "Product deleted successfully"));
});
