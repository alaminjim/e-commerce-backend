import { Router } from "express";

import {
  createCollection,
  deleteCollection,
  getCollectionById,
  getCollectionBySlug,
  listCollections,
  updateCollection,
} from "./collection.controller";

const router = Router();

router.get("/", listCollections);
router.get("/slug/:slug", getCollectionBySlug);
router.get("/:id", getCollectionById);
router.post("/", createCollection);
router.patch("/:id", updateCollection);
router.delete("/:id", deleteCollection);

export const collectionRouter = router;
