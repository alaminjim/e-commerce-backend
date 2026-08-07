import { z } from "zod";

export const addCartSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  quantity: z.number().int().min(1, "Quantity must be at least 1").optional().default(1),
  selectedOptions: z.record(z.string(), z.string()).optional(),
});

export const updateCartQuantitySchema = z.object({
  quantity: z.number().int().min(1, "Quantity must be at least 1"),
});

export type AddCartInput = z.infer<typeof addCartSchema>;
export type UpdateCartQuantityInput = z.infer<typeof updateCartQuantitySchema>;
