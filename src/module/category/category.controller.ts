import { z } from "zod";
import type { Request, Response } from "express";

import { asyncHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/ApiResponse";
import {
  createCategorySchema,
  listCategoryQuerySchema,
  updateCategorySchema,
} from "./category.types";
import { categoryService } from "./category.service";

const idParamSchema = z.object({ id: z.uuid("Invalid category id") });
const slugParamSchema = z.object({ slug: z.string().min(1) });

export const listCategories = asyncHandler(async (req: Request, res: Response) => {
  const query = listCategoryQuerySchema.parse(req.query);
  const data = await categoryService.list(query);

  res.json(new ApiResponse(200, data, "Categories fetched successfully"));
});

export const getCategoryById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = idParamSchema.parse(req.params);
  const data = await categoryService.getById(id);

  res.json(new ApiResponse(200, data, "Category fetched successfully"));
});

export const getCategoryBySlug = asyncHandler(async (req: Request, res: Response) => {
  const { slug } = slugParamSchema.parse(req.params);
  const data = await categoryService.getBySlug(slug);

  res.json(new ApiResponse(200, data, "Category fetched successfully"));
});

export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  const input = createCategorySchema.parse(req.body);
  const data = await categoryService.create(input);

  res.status(201).json(new ApiResponse(201, data, "Category created successfully"));
});

export const updateCategory = asyncHandler(async (req: Request, res: Response) => {
  const { id } = idParamSchema.parse(req.params);
  const input = updateCategorySchema.parse(req.body);
  const data = await categoryService.update(id, input);

  res.json(new ApiResponse(200, data, "Category updated successfully"));
});

export const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
  const { id } = idParamSchema.parse(req.params);
  const data = await categoryService.remove(id);

  res.json(new ApiResponse(200, data, "Category deleted successfully"));
});
