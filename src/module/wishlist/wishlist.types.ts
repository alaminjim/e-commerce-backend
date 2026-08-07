import { z } from "zod";

export const addWishlistSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
});

export type AddWishlistInput = z.infer<typeof addWishlistSchema>;
