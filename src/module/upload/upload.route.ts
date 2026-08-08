import { Router } from "express";
import multer from "multer";

import { uploadImage } from "./upload.controller";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(Object.assign(new Error("Only image files are allowed"), { status: 400 }));
    }
  },
});

router.post("/image", upload.single("image"), uploadImage);

export const uploadRouter = router;
