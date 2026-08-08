import { Router } from "express";

import { optionalAuth, requireAuth, restrictTo } from "../../middleware/auth";
import {
  createReview,
  deleteReview,
  listProductReviews,
  listReviews,
} from "./review.controller";

const router = Router();

router.get("/product/:productId", listProductReviews);
router.get("/", listReviews);
router.post("/", optionalAuth, createReview);
router.delete("/:id", optionalAuth, deleteReview);

export const reviewRouter = router;
