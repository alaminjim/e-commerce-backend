import { z } from "zod";

const optionSchema = z.object({
  label: z.string().min(1),
  values: z.array(z.string().min(1)),
});

const specsSchema = z.record(z.string(), z.string());

const flagsSchema = z.object({
  isNew: z.boolean().optional().default(false),
  isFeatured: z.boolean().optional().default(false),
  isTrending: z.boolean().optional().default(false),
  isHotDeal: z.boolean().optional().default(false),
});

export const createProductSchema = z.object({
  title: z.string().trim().min(1, "Title is required"),
  sku: z.string().trim().min(1, "SKU is required"),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase and hyphenated")
    .optional(),
  category: z.string().trim().min(1, "Category is required"),
  collection: z.string().trim().min(1, "Collection is required"),
  brand: z.string().trim().min(1, "Brand is required"),
  tags: z.array(z.string()).optional().default([]),
  price: z.number().positive("Price must be greater than 0"),
  compareAtPrice: z.number().positive().nullable().optional(),
  badge: z.string().nullable().optional(),
  description: z.string().trim().min(1, "Description is required"),
  longDescription: z.string().nullable().optional(),
  features: z.array(z.string()).optional().default([]),
  images: z.array(z.string()).optional().default([]),
  colors: z.array(z.string()).optional().default([]),
  options: z.array(optionSchema).nullable().optional(),
  stock: z.number().int().min(0).optional().default(0),
  stockStatus: z.enum(["IN_STOCK", "OUT_OF_STOCK"]).optional().default("IN_STOCK"),
  status: z.enum(["PUBLISHED", "DRAFT"]).optional().default("DRAFT"),
  rating: z.number().min(0).max(5).optional().default(0),
  reviewCount: z.number().int().min(0).optional().default(0),
  specs: specsSchema.nullable().optional(),
  flags: flagsSchema.optional(),
  dealEndsAt: z.coerce.date().nullable().optional(),
});

export const updateProductSchema = createProductSchema.partial();

export const listProductQuerySchema = z.object({
  category: z.string().optional(),
  collection: z.string().optional(),
  brand: z.string().optional(),
  tag: z.string().optional(),
  minPrice: z.coerce.number().optional(),
  maxPrice: z.coerce.number().optional(),
  search: z.string().optional(),
  sort: z.enum(["newest", "price_asc", "price_desc", "rating"]).optional(),
  status: z.enum(["PUBLISHED", "DRAFT"]).optional(),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;
export type UpdateProductInput = z.infer<typeof updateProductSchema>;
export type ListProductQuery = z.infer<typeof listProductQuerySchema>;
