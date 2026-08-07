import { z } from "zod";

export const HEADER_GROUP_VALUES = [
  "shop-by-room",
  "tables-desks",
  "chairs-stools",
] as const;

export type HeaderGroupValue = (typeof HEADER_GROUP_VALUES)[number];

export const createCategorySchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  slug: z
    .string()
    .trim()
    .min(1, "Slug is required")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase and hyphenated")
    .optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional().default("ACTIVE"),
  headerGroup: z.enum(HEADER_GROUP_VALUES).nullable().optional(),
  sortOrder: z.coerce.number().int().min(0).optional().default(0),
});

export const updateCategorySchema = createCategorySchema.partial();

export const listCategoryQuerySchema = z.object({
  search: z.string().optional(),
  status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
  headerGroup: z.enum(HEADER_GROUP_VALUES).optional(),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type ListCategoryQuery = z.infer<typeof listCategoryQuerySchema>;
