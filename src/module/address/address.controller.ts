import type { Request, Response } from "express";

import { asyncHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/ApiResponse";
import { ApiError } from "../../utils/ApiError";
import {
  createAddressSchema,
  idParamSchema,
  updateAddressSchema,
} from "./address.types";
import { addressService } from "./address.service";

export const listMyAddresses = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.id) {
    throw new ApiError(401, "Unauthorized access");
  }

  const data = await addressService.listAddresses(req.user.id);
  res.json(new ApiResponse(200, data, "Addresses fetched successfully"));
});

export const createMyAddress = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.id) {
    throw new ApiError(401, "Unauthorized access");
  }

  const input = createAddressSchema.parse(req.body);
  const data = await addressService.createAddress(req.user.id, input);

  res.json(new ApiResponse(201, data, "Address added successfully"));
});

export const updateMyAddress = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.id) {
    throw new ApiError(401, "Unauthorized access");
  }

  const { id } = idParamSchema.parse(req.params);
  const input = updateAddressSchema.parse(req.body);
  const data = await addressService.updateAddress(req.user.id, id, input);

  res.json(new ApiResponse(200, data, "Address updated successfully"));
});

export const setDefaultMyAddress = asyncHandler(
  async (req: Request, res: Response) => {
    if (!req.user?.id) {
      throw new ApiError(401, "Unauthorized access");
    }

    const { id } = idParamSchema.parse(req.params);
    const data = await addressService.setDefaultAddress(req.user.id, id);

    res.json(new ApiResponse(200, data, "Default address updated successfully"));
  }
);

export const deleteMyAddress = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user?.id) {
    throw new ApiError(401, "Unauthorized access");
  }

  const { id } = idParamSchema.parse(req.params);
  const data = await addressService.deleteAddress(req.user.id, id);

  res.json(new ApiResponse(200, data, "Address deleted successfully"));
});
