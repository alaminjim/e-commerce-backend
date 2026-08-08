import type { Request, Response } from "express";

import { asyncHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/ApiResponse";
import { uploadImageSchema } from "./upload.types";
import { uploadService } from "./upload.service";

export const uploadImage = asyncHandler(async (req: Request, res: Response) => {
  const input = uploadImageSchema.parse(req.body);
  const file = req.file;

  if (!file) {
    res.status(400).json(new ApiResponse(400, null, "No image file provided"));
    return;
  }

  const result = await uploadService.uploadImage(file, input);

  res.json(
    new ApiResponse(
      200,
      { url: result.secure_url, publicId: result.public_id, width: result.width, height: result.height },
      "Image uploaded successfully"
    )
  );
});
