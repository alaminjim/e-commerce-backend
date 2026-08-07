import { Router } from "express";

import { requireAuth } from "../../middleware/auth";
import {
  getMe,
  getUserById,
  listUsers,
  updateMe,
  updateUserStatus,
} from "./user.controller";

const router = Router();

router.get("/me", requireAuth, getMe);
router.get("/:id", requireAuth, getUserById);
router.patch("/me", requireAuth, updateMe);

// ─── User management — PUBLIC for now (dashboard opens without login) ─────────
// NOTE: when protection is re-enabled, restore these guards (and re-add the
// `restrictTo` import at the top of this file):
//   router.get("/", requireAuth, restrictTo("ADMIN"), listUsers);
//   router.patch("/:id/status", requireAuth, restrictTo("ADMIN"), updateUserStatus);
router.get("/", listUsers);
router.patch("/:id/status", updateUserStatus);

export const userRouter = router;
