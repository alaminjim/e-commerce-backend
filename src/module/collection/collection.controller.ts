import { z } from "zod";
import type { Request, Response } from "express";

import { asyncHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/ApiResponse";
import {
  createCollectionSchema,
  listCollectionQuerySchema,
  updateCollectionSchema,
} from "./collection.types";
import { collectionService } from "./collection.service";

const idParamSchema = z.object({ id: z.uuid("Invalid collection id") });
const slugParamSchema = z.object({ slug: z.string().min(1) });

export const listCollections = asyncHandler(async (req: Request, res: Response) => {
  const query = listCollectionQuerySchema.parse(req.query);
  const data = await collectionService.list(query);

  res.json(new ApiResponse(200, data, "Collections fetched successfully"));
});

export const getCollectionById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = idParamSchema.parse(req.params);
  const data = await collectionService.getById(id);

  res.json(new ApiResponse(200, data, "Collection fetched successfully"));
});

export const getCollectionBySlug = asyncHandler(async (req: Request, res: Response) => {
  const { slug } = slugParamSchema.parse(req.params);
  const data = await collectionService.getBySlug(slug);

  res.json(new ApiResponse(200, data, "Collection fetched successfully"));
});

export const createCollection = asyncHandler(async (req: Request, res: Response) => {
  const input = createCollectionSchema.parse(req.body);
  const data = await collectionService.create(input);

  res.status(201).json(new ApiResponse(201, data, "Collection created successfully"));
});

export const updateCollection = asyncHandler(async (req: Request, res: Response) => {
  const { id } = idParamSchema.parse(req.params);
  const input = updateCollectionSchema.parse(req.body);
  const data = await collectionService.update(id, input);

  res.json(new ApiResponse(200, data, "Collection updated successfully"));
});

export const deleteCollection = asyncHandler(async (req: Request, res: Response) => {
  const { id } = idParamSchema.parse(req.params);
  const data = await collectionService.remove(id);

  res.json(new ApiResponse(200, data, "Collection deleted successfully"));
});
