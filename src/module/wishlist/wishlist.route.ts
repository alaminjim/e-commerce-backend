import { Router } from "express";
import { requireAuth } from "../../middleware/auth";
import {
  addToWishlist,
  listWishlist,
  removeFromWishlist,
} from "./wishlist.controller";

const router = Router();

router.use(requireAuth);

router.get("/", listWishlist);
router.post("/", addToWishlist);
router.delete("/:productId", removeFromWishlist);

export const wishlistRouter = router;
