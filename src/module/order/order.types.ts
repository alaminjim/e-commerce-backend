import { z } from "zod";

export const ORDER_STATUSES = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "PACKED",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

/**
 * Allowed status transitions per current status.
 * Kept as a whitelist so the flow is easily extendable and admin updates
 * can never jump to an invalid state (e.g. DELIVERED -> PENDING).
 */
export const ORDER_STATUS_FLOW: Record<
  OrderStatus,
  readonly OrderStatus[]
> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["PROCESSING", "CANCELLED"],
  PROCESSING: ["PACKED", "CANCELLED"],
  PACKED: ["SHIPPED", "CANCELLED"],
  SHIPPED: ["OUT_FOR_DELIVERY", "CANCELLED"],
  OUT_FOR_DELIVERY: ["DELIVERED", "CANCELLED"],
  DELIVERED: ["REFUNDED"],
  CANCELLED: [],
  REFUNDED: [],
};

export const PAYMENT_STATUSES = [
  "PENDING",
  "PAID",
  "FAILED",
  "REFUNDED",
] as const;

export const PAYMENT_METHODS = [
  "BANK_TRANSFER",
  "CASH_ON_DELIVERY",
  "PAYPAL",
  "CARD",
] as const;

export const createOrderSchema = z.object({
  firstName: z.string().trim().min(1, "First name is required").max(80),
  lastName: z.string().trim().min(1, "Last name is required").max(80),
  phone: z.string().trim().max(30).nullish().or(z.literal("")),
  address: z.string().trim().min(1, "Street address is required").max(255),
  city: z.string().trim().min(1, "City is required").max(120),
  country: z.string().trim().min(1, "Country is required").max(120),
  postalCode: z.string().trim().max(30).nullish().or(z.literal("")),
  paymentMethod: z
    .enum(PAYMENT_METHODS)
    .optional()
    .default("CASH_ON_DELIVERY"),
  notes: z.string().trim().max(2000).nullish().or(z.literal("")),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(ORDER_STATUSES, { message: "Invalid order status" }),
});

export const updateOrderPaymentStatusSchema = z.object({
  paymentStatus: z.enum(PAYMENT_STATUSES, { message: "Invalid payment status" }),
});

export const listOrderQuerySchema = z.object({
  search: z.string().optional(),
  status: z.enum(ORDER_STATUSES).optional(),
  paymentStatus: z.enum(PAYMENT_STATUSES).optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
export type UpdateOrderPaymentStatusInput = z.infer<
  typeof updateOrderPaymentStatusSchema
>;
export type ListOrderQuery = z.infer<typeof listOrderQuerySchema>;
