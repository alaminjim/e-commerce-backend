import { z } from "zod";

export const uploadImageSchema = z.object({
  folder: z.string().optional().default("products"),
});

export type UploadImageInput = z.infer<typeof uploadImageSchema>;
