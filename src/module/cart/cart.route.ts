import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import {
  addToCart,
  clearCart,
  listCart,
  removeFromCart,
  updateCartQuantity,
} from "./cart.controller";

const router = Router();

router.use(requireAuth);

router.get("/", listCart);
router.post("/", addToCart);
router.patch("/:productId", updateCartQuantity);
router.delete("/:productId", removeFromCart);
router.delete("/", clearCart);

export const cartRouter = router;
