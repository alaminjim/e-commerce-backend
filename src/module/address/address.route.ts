import { Router } from "express";

import { requireAuth } from "../../middleware/auth";
import {
  createMyAddress,
  deleteMyAddress,
  listMyAddresses,
  setDefaultMyAddress,
  updateMyAddress,
} from "./address.controller";

const router = Router();

// All address routes are user-scoped — the userId comes from the auth session.
router.get("/", requireAuth, listMyAddresses);
router.post("/", requireAuth, createMyAddress);
router.patch("/:id", requireAuth, updateMyAddress);
router.patch("/:id/default", requireAuth, setDefaultMyAddress);
router.delete("/:id", requireAuth, deleteMyAddress);

export const addressRouter = router;
