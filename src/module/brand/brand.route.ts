import { Router } from "express";

import {
  createBrand,
  deleteBrand,
  getBrandById,
  getBrandBySlug,
  listBrands,
  updateBrand,
} from "./brand.controller";

const router = Router();

router.get("/", listBrands);
router.get("/slug/:slug", getBrandBySlug);
router.get("/:id", getBrandById);
router.post("/", createBrand);
router.patch("/:id", updateBrand);
router.delete("/:id", deleteBrand);

export const brandRouter = router;
