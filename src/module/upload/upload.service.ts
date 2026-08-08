import type { UploadApiResponse } from "cloudinary";

import { cloudinary } from "../../config/cloudinary";
import { ApiError } from "../../utils/ApiError";
import type { UploadImageInput } from "./upload.types";

const uploadImage = async (
  file: Express.Multer.File,
  input: UploadImageInput
): Promise<UploadApiResponse> => {
  if (!file) {
    throw new ApiError(400, "No image file provided");
  }

  const base64 = file.buffer.toString("base64");
  const dataUri = `data:${file.mimetype};base64,${base64}`;

  try {
    const result = await cloudinary.uploader.upload(dataUri, {
      folder: input.folder,
      resource_type: "image",
      transformation: [{ width: 1600, crop: "limit", quality: "auto" }],
    });

    return result;
  } catch (err) {
    console.error("Cloudinary error detail:", err);
    const message =
      err instanceof Error
        ? err.message
        : typeof err === "object" &&
            err !== null &&
            "message" in err &&
            typeof (err as { message?: unknown }).message === "string"
          ? (err as { message: string }).message
          : "Unknown Cloudinary error";
    throw new ApiError(502, `Failed to upload image to Cloudinary: ${message}`);
  }
};

export const uploadService = { uploadImage };
