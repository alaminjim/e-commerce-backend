import { z } from "zod";
import type { Request, Response } from "express";

import { asyncHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/ApiResponse";
import { ApiError } from "../../utils/ApiError";
import {
  createOrderSchema,
  listOrderQuerySchema,
  updateOrderPaymentStatusSchema,
  updateOrderStatusSchema,
} from "./order.types";
import { orderService } from "./order.service";

const idParamSchema = z.object({ id: z.string().min(1) });
const orderIdParamSchema = z.object({ orderId: z.string().trim().min(1) });

const requireUser = (req: Request): { id: string; email: string; role: string | null } => {
  if (!req.user?.id) {
    throw new ApiError(401, "Unauthorized. Please log in.");
  }
  return {
    id: req.user.id,
    email: req.user.email,
    role: (req.user as { role?: string | null }).role ?? null,
  };
};

export const createOrder = asyncHandler(async (req: Request, res: Response) => {
  const { id, email } = requireUser(req);
  const input = createOrderSchema.parse(req.body);
  const data = await orderService.create(id, email, input);

  res.status(201).json(new ApiResponse(201, data, "Order placed successfully"));
});

export const getMyOrders = asyncHandler(async (req: Request, res: Response) => {
  const { id } = requireUser(req);
  const data = await orderService.listMine(id);

  res.json(new ApiResponse(200, data, "Orders fetched successfully"));
});

export const getOrderById = asyncHandler(async (req: Request, res: Response) => {
  const { id } = idParamSchema.parse(req.params);
  // Public while the dashboard is open (see order.route.ts notes)
  const data = await orderService.getById(id);

  res.json(new ApiResponse(200, data, "Order fetched successfully"));
});

export const trackOrder = asyncHandler(async (req: Request, res: Response) => {
  const { id: userId, role } = requireUser(req);
  const { orderId } = orderIdParamSchema.parse(req.params);
  const data = await orderService.track(userId, role, orderId);

  res.json(new ApiResponse(200, data, "Order tracked successfully"));
});

export const adminListOrders = asyncHandler(
  async (req: Request, res: Response) => {
    const query = listOrderQuerySchema.parse(req.query);
    const data = await orderService.adminList(query);

    res.json(new ApiResponse(200, data, "Orders fetched successfully"));
  }
);

export const updateOrderStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = idParamSchema.parse(req.params);
    const input = updateOrderStatusSchema.parse(req.body);
    const data = await orderService.updateStatus(id, input);

    res.json(new ApiResponse(200, data, "Order status updated successfully"));
  }
);

export const updateOrderPaymentStatus = asyncHandler(
  async (req: Request, res: Response) => {
    const { id } = idParamSchema.parse(req.params);
    const input = updateOrderPaymentStatusSchema.parse(req.body);
    const data = await orderService.updatePaymentStatus(id, input);

    res.json(
      new ApiResponse(200, data, "Order payment status updated successfully")
    );
  }
);
