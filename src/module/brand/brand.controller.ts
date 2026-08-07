import { z } from "zod";
import type { Request, Response } from "express";

import { asyncHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/ApiResponse";
import {
  createBrandSchema,
  listBrandQuerySchema,
  updateBrandSchema,
} from "./brand.types";
import { brandService } from "./brand.service";

const idParamSchema = z.object({ id: z.uuid("Invalid brand id") });
const slugParamSchema = z.object({ slug: z.string().min(1) });

export const listBrands = asyncHandler(async (req: Request, res: Response) => {
  const query = listBrandQuerySchema.parse(req.query);
  const data = await brandService.list(query);

  res.json(new ApiResponse(200, data, "Brands fetched successfully"));
});

export const getBrandById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = idParamSchema.parse(req.params);
  const data = await brandService.getById(id);

  res.json(new ApiResponse(200, data, "Brand fetched successfully"));
});

export const getBrandBySlug = asyncHandler(async (req: Request, res: Response) => {
  const { slug } = slugParamSchema.parse(req.params);
  const data = await brandService.getBySlug(slug);

  res.json(new ApiResponse(200, data, "Brand fetched successfully"));
});

export const createBrand = asyncHandler(async (req: Request, res: Response) => {
  const input = createBrandSchema.parse(req.body);
  const data = await brandService.create(input);

  res.status(201).json(new ApiResponse(201, data, "Brand created successfully"));
});

export const updateBrand = asyncHandler(async (req: Request, res: Response) => {
  const { id } = idParamSchema.parse(req.params);
  const input = updateBrandSchema.parse(req.body);
  const data = await brandService.update(id, input);

  res.json(new ApiResponse(200, data, "Brand updated successfully"));
});

export const deleteBrand = asyncHandler(async (req: Request, res: Response) => {
  const { id } = idParamSchema.parse(req.params);
  const data = await brandService.remove(id);

  res.json(new ApiResponse(200, data, "Brand deleted successfully"));
});
