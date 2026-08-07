import { Router } from "express";

import { requireAuth } from "../../middleware/auth";
import {
  adminListOrders,
  createOrder,
  getMyOrders,
  getOrderById,
  trackOrder,
  updateOrderPaymentStatus,
  updateOrderStatus,
} from "./order.controller";

const router = Router();

// ─── Customer routes (authenticated) ──────────────────────────────────────────
router.post("/", requireAuth, createOrder);
router.get("/me", requireAuth, getMyOrders);
router.get("/track/:orderId", requireAuth, trackOrder);

// ─── Dashboard/management routes — PUBLIC for now ─────────────────────────────
// NOTE: the admin dashboard is intentionally open (login page button opens it
// without login). When protection is re-enabled, restore these guards:
//   router.get("/", requireAuth, restrictTo("ADMIN"), adminListOrders);
//   router.get("/:id", requireAuth, getOrderById);
//   router.patch("/:id/status", requireAuth, restrictTo("ADMIN"), updateOrderStatus);
//   router.patch("/:id/payment-status", requireAuth, restrictTo("ADMIN"), updateOrderPaymentStatus);
router.get("/:id", getOrderById);
router.get("/", adminListOrders);
router.patch("/:id/status", updateOrderStatus);
router.patch("/:id/payment-status", updateOrderPaymentStatus);

export const orderRouter = router;
