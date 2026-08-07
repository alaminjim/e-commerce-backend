import type { Request, Response } from "express";

import { asyncHandler } from "../../utils/asyncHandler";
import { ApiResponse } from "../../utils/ApiResponse";
import { healthService } from "./health.service";

export const getHealth = asyncHandler(async (_req: Request, res: Response) => {
  const data = await healthService.check();

  res.json(new ApiResponse(200, data, "Server is healthy"));
});
