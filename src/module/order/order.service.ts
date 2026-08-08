import { randomBytes } from "crypto";

import { Prisma } from "../../generated/prisma/client";
import { prisma } from "../../config/prisma";
import { ApiError } from "../../utils/ApiError";
import { ORDER_STATUS_FLOW } from "./order.types";
import type {
  CreateOrderInput,
  ListOrderQuery,
  OrderStatus,
  UpdateOrderPaymentStatusInput,
  UpdateOrderStatusInput,
} from "./order.types";

/** Delivery window used for the tracking estimate (createdAt + N days). */
const DELIVERY_ESTIMATE_DAYS = 5;

const computeEstimatedDelivery = (placedAt: Date): Date =>
  new Date(placedAt.getTime() + DELIVERY_ESTIMATE_DAYS * 24 * 60 * 60 * 1000);

/**
 * Fills tracking fields for orders created before these columns existed.
 * Keeps the customer-facing timeline working even for legacy data.
 */
const applyTrackingFallbacks = <T extends {
  createdAt: Date;
  updatedAt: Date;
  status: OrderStatus;
  estimatedDeliveryDate: Date | null;
  deliveredAt: Date | null;
  statusHistory: unknown;
}>(order: T): T => {
  if (!order.estimatedDeliveryDate) {
    order.estimatedDeliveryDate = computeEstimatedDelivery(order.createdAt);
  }
  if (!order.deliveredAt && order.status === "DELIVERED") {
    order.deliveredAt = order.updatedAt;
  }
  if (!order.statusHistory) {
    order.statusHistory = [
      { status: "PENDING", at: order.createdAt.toISOString() },
    ];
  }
  return order;
};

const orderInclude = {
  items: true,
  user: { select: { id: true, name: true, email: true, phone: true } },
} satisfies Prisma.OrderInclude;

const isAdmin = (role?: string | null): boolean =>
  role?.toUpperCase() === "ADMIN";

/** Human-readable unique order id, e.g. ORD-3F2A9B1C */
const generateOrderId = (): string => {
  const suffix = randomBytes(4).toString("hex").toUpperCase();
  return `ORD-${suffix}`;
};

const create = async (
  userId: string,
  userEmail: string,
  input: CreateOrderInput
) => {
  const cartItems = await prisma.cartItem.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { product: true },
  });

  if (cartItems.length === 0) {
    throw new ApiError(
      400,
      "Your cart is empty. Add products before checking out."
    );
  }

  // Validate stock and build snapshot order items
  const orderItemsData: Prisma.OrderItemCreateManyOrderInput[] = [];
  let subtotal = 0;

  for (const item of cartItems) {
    const product = item.product;

    if (product.stockStatus === "OUT_OF_STOCK" || product.stock <= 0) {
      throw new ApiError(400, `"${product.title}" is out of stock`);
    }

    if (item.quantity > product.stock) {
      throw new ApiError(
        400,
        `Only ${product.stock} item(s) of "${product.title}" available in stock`
      );
    }

    const lineSubtotal = product.price * item.quantity;
    subtotal += lineSubtotal;

    orderItemsData.push({
      productId: product.id,
      productTitle: product.title,
      productSlug: product.slug,
      productImage: product.images[0] ?? null,
      price: product.price,
      quantity: item.quantity,
      selectedOptions: item.selectedOptions ?? undefined,
      subtotal: lineSubtotal,
    });
  }

  const shippingFee = 0;
  const total = subtotal + shippingFee;

  const placeOrder = (orderId: string) =>
    prisma.$transaction(async (tx) => {
      // Atomically decrement stock for every purchased item
      for (const item of cartItems) {
        const updated = await tx.product.updateMany({
          where: { id: item.productId, stock: { gte: item.quantity } },
          data: { stock: { decrement: item.quantity } },
        });

        if (updated.count === 0) {
          throw new ApiError(
            400,
            `Insufficient stock for "${item.product.title}". Please update your cart.`
          );
        }

        // Auto-mark the product OUT_OF_STOCK once its stock hits zero
        // so the storefront stops showing it as available.
        await tx.product.updateMany({
          where: { id: item.productId, stock: { lte: 0 } },
          data: { stockStatus: "OUT_OF_STOCK" },
        });
      }

      const placedAt = new Date();
      const created = await tx.order.create({
        data: {
          orderId,
          userId,
          firstName: input.firstName,
          lastName: input.lastName,
          email: userEmail,
          phone: input.phone || null,
          address: input.address,
          city: input.city,
          country: input.country,
          postalCode: input.postalCode || null,
          billing: {
            firstName: input.firstName,
            lastName: input.lastName,
            phone: input.phone || null,
            address: input.address,
            city: input.city,
            country: input.country,
            postalCode: input.postalCode || null,
            paymentMethod: input.paymentMethod,
          },
          paymentMethod: input.paymentMethod,
          notes: input.notes || null,
          subtotal,
          shippingFee,
          total,
          estimatedDeliveryDate: computeEstimatedDelivery(placedAt),
          statusHistory: [
            { status: "PENDING", at: placedAt.toISOString() },
          ],
          items: { createMany: { data: orderItemsData } },
        },
        include: orderInclude,
      });

      // Cart is cleared once the order is placed
      await tx.cartItem.deleteMany({ where: { userId } });

      return created;
    });

  // Retry order creation if the human-readable orderId ever collides (unlikely)
  let order: Awaited<ReturnType<typeof placeOrder>> | undefined;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const orderId = generateOrderId();

    try {
      order = await placeOrder(orderId);
      break;
    } catch (err) {
      const isOrderIdCollision =
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === "P2002" &&
        Array.isArray(err.meta?.target) &&
        (err.meta.target as string[]).includes("orderId");

      if (!isOrderIdCollision || attempt >= 2) {
        throw err;
      }
    }
  }

  return order!;
};

const listMine = async (userId: string) => {
  const orders = await prisma.order.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  return { orders, total: orders.length };
};

// NOTE: order details are public while the dashboard is open.
// When dashboard protection is re-enabled, restore the ownership/admin check:
//   if (order.userId !== userId && !isAdmin(role)) throw new ApiError(403, ...)
const getById = async (id: string) => {
  const order = await prisma.order.findUnique({
    where: { id },
    include: orderInclude,
  });

  if (!order) {
    throw new ApiError(404, "Order not found");
  }

  return applyTrackingFallbacks(order);
};

const track = async (userId: string, role: string | null, orderId: string) => {
  const order = await prisma.order.findUnique({
    where: { orderId },
    include: { items: true },
  });

  if (!order || (order.userId !== userId && !isAdmin(role))) {
    // Same message for missing and forbidden orders — no information leak
    throw new ApiError(404, "Order not found. Please check your Order ID.");
  }

  return applyTrackingFallbacks(order);
};

const adminList = async (query: ListOrderQuery) => {
  const where: Prisma.OrderWhereInput = {};

  if (query.status) {
    where.status = query.status;
  }

  if (query.paymentStatus) {
    where.paymentStatus = query.paymentStatus;
  }

  if (query.search) {
    where.OR = [
      { orderId: { contains: query.search, mode: "insensitive" } },
      { firstName: { contains: query.search, mode: "insensitive" } },
      { lastName: { contains: query.search, mode: "insensitive" } },
      { user: { is: { name: { contains: query.search, mode: "insensitive" } } } },
      { user: { is: { email: { contains: query.search, mode: "insensitive" } } } },
    ];
  }

  const orders = await prisma.order.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: orderInclude,
  });

  const total = await prisma.order.count({ where });

  return { orders, total };
};

const updateStatus = async (id: string, input: UpdateOrderStatusInput) => {
  const existing = await prisma.order.findUnique({
    where: { id },
    include: orderInclude,
  });

  if (!existing) {
    throw new ApiError(404, "Order not found");
  }

  if (input.status === existing.status) {
    return existing;
  }

  const allowedTransitions = ORDER_STATUS_FLOW[existing.status];

  if (!allowedTransitions.includes(input.status)) {
    throw new ApiError(
      400,
      `Cannot change order status from ${existing.status} to ${input.status}. Allowed: ${
        allowedTransitions.length > 0
          ? allowedTransitions.join(", ")
          : "none (this is a final state)"
      }`
    );
  }

  const changedAt = new Date();
  const history = Array.isArray(existing.statusHistory)
    ? [...(existing.statusHistory as { status: OrderStatus; at: string }[])]
    : [{ status: existing.status, at: existing.updatedAt.toISOString() }];
  history.push({ status: input.status, at: changedAt.toISOString() });

  return prisma.order.update({
    where: { id },
    data: {
      status: input.status,
      statusHistory: history,
      // Record the exact delivery moment for the tracking timeline
      ...(input.status === "DELIVERED" ? { deliveredAt: changedAt } : {}),
    },
    include: orderInclude,
  });
};

const updatePaymentStatus = async (
  id: string,
  input: UpdateOrderPaymentStatusInput
) => {
  const existing = await prisma.order.findUnique({ where: { id } });

  if (!existing) {
    throw new ApiError(404, "Order not found");
  }

  return prisma.order.update({
    where: { id },
    data: { paymentStatus: input.paymentStatus },
    include: orderInclude,
  });
};

export const orderService = {
  create,
  listMine,
  getById,
  track,
  adminList,
  updateStatus,
  updatePaymentStatus,
};
