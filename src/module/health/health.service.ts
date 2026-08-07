import { prisma } from "../../config/prisma";

const check = async () => {
  await prisma.$queryRaw`SELECT 1`;

  return {
    status: "ok",
    uptime: process.uptime(),
  };
};

export const healthService = { check };
