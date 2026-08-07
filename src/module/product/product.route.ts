import { Router } from "express";

import {
  createProduct,
  deleteProduct,
  getProductById,
  getProductBySlug,
  listProducts,
  updateProduct,
} from "./product.controller";

const router = Router();

router.get("/", listProducts);
router.get("/slug/:slug", getProductBySlug);
router.get("/:id", getProductById);
router.post("/", createProduct);
router.patch("/:id", updateProduct);
router.delete("/:id", deleteProduct);

export const productRouter = router;
