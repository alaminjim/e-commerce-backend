import { z } from "zod";

export const createReviewSchema = z.object({
  productId: z.string().min(1, "Product ID is required"),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  rating: z.coerce.number().int().min(1).max(5).default(5),
  comment: z.string().min(1, "Review comment is required"),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
