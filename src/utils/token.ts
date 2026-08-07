import type { JwtPayload, SignOptions } from "jsonwebtoken";
import { jwtUtils } from "./jwt";
import { envConfig } from "../config/env";

const accessToken = (data: JwtPayload) => {
  const token = jwtUtils.createToken(data, envConfig.JWT_ACCESS_SECRET, {
    expiresIn: envConfig.JWT_ACCESS_EXPIRES_IN,
  } as SignOptions);
  return token;
};

const refreshToken = (data: JwtPayload) => {
  const token = jwtUtils.createToken(data, envConfig.JWT_REFRESH_SECRET, {
    expiresIn: envConfig.JWT_REFRESH_EXPIRES_IN,
  } as SignOptions);
  return token;
};

export const tokenUtils = {
  accessToken,
  refreshToken,
};
