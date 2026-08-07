import { z } from "zod";

/**
 * Optional string field that stores NULL when empty/omitted.
 * Uses preprocess so null, undefined and "" all resolve to null safely.
 */
const addressOptionalString = (max: number, label: string) =>
  z.preprocess(
    (v) => (v === undefined || v === null || v === "" ? null : v),
    z.string().trim().max(max, label).nullable()
  );

export const createAddressSchema = z.object({
  label: z.string().trim().min(1, "Label is required").max(50),
  fullName: z.string().trim().min(1, "Full name is required").max(100),
  phone: addressOptionalString(30, "Phone number is too long"),
  address: z.string().trim().min(1, "Street address is required").max(255),
  city: z.string().trim().min(1, "City is required").max(100),
  state: addressOptionalString(100, "State is too long"),
  postalCode: addressOptionalString(20, "Postal code is too long"),
  country: z.string().trim().min(1, "Country is required").max(100),
  isDefault: z.boolean().optional(),
});

export const updateAddressSchema = createAddressSchema.partial();

export const idParamSchema = z.object({ id: z.string().min(1, "Invalid address id") });

export type CreateAddressInput = z.infer<typeof createAddressSchema>;
export type UpdateAddressInput = z.infer<typeof updateAddressSchema>;

export const addressSelect = {
  id: true,
  userId: true,
  label: true,
  fullName: true,
  phone: true,
  address: true,
  city: true,
  state: true,
  postalCode: true,
  country: true,
  isDefault: true,
  createdAt: true,
  updatedAt: true,
} as const;
