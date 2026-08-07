import { z } from "zod";

export const updateUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").optional(),
  avatar: z.string().nullable().optional(),
  phone: z
    .string()
    .min(7, "Phone number must be at least 7 characters")
    .regex(/^[+0-9][0-9\s\-()]*$/, "Enter a valid phone number")
    .optional(),
});

export const USER_STATUSES = ["ACTIVE", "SUSPENDED"] as const;

export type UserStatus = (typeof USER_STATUSES)[number];

export const listUserQuerySchema = z.object({
  search: z.string().optional(),
  role: z.string().optional(),
  status: z.enum(USER_STATUSES).optional(),
});

export const updateUserStatusSchema = z.object({
  status: z.enum(USER_STATUSES, { message: "Invalid user status" }),
});

export type ListUserQuery = z.infer<typeof listUserQuerySchema>;
export type UpdateUserStatusInput = z.infer<typeof updateUserStatusSchema>;

export type UpdateUserInput = z.infer<typeof updateUserSchema>;

export const userSelect = {
  id: true,
  name: true,
  email: true,
  emailVerified: true,
  avatar: true,
  phone: true,
  role: true,
  status: true,
  createdAt: true,
  updatedAt: true,
} as const;
