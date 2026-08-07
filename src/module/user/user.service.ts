import { Prisma } from "../../generated/prisma/client";
import { prisma } from "../../config/prisma";
import { ApiError } from "../../utils/ApiError";
import {
  userSelect,
  type ListUserQuery,
  type UpdateUserInput,
  type UpdateUserStatusInput,
} from "./user.types";

const getMe = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: userSelect,
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return user;
};

const getById = async (id: string) => {
  const user = await prisma.user.findUnique({
    where: { id },
    select: userSelect,
  });

  if (!user) {
    throw new ApiError(404, "User not found");
  }

  return user;
};

const updateMe = async (userId: string, input: UpdateUserInput) => {
  await getMe(userId);

  if (input.phone) {
    const existingPhone = await prisma.user.findFirst({
      where: {
        phone: input.phone,
        NOT: { id: userId },
      },
    });

    if (existingPhone) {
      throw new ApiError(409, "Phone number is already in use by another account");
    }
  }

  return prisma.user.update({
    where: { id: userId },
    data: input,
    select: userSelect,
  });
};

const list = async (query: ListUserQuery) => {
  const where: Prisma.UserWhereInput = {};

  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: "insensitive" } },
      { email: { contains: query.search, mode: "insensitive" } },
      { phone: { contains: query.search, mode: "insensitive" } },
    ];
  }

  if (query.role) {
    where.role = { equals: query.role, mode: "insensitive" };
  }

  if (query.status) {
    where.status = query.status;
  }

  const users = await prisma.user.findMany({
    where,
    orderBy: { createdAt: "desc" },
    select: userSelect,
  });

  const total = await prisma.user.count({ where });

  return { users, total };
};

// NOTE: status updates are public while the dashboard is open.
// When protection is re-enabled, restore the actor check here
// (e.g. prevent an admin from suspending their own account).
const updateStatus = async (id: string, input: UpdateUserStatusInput) => {
  const existing = await prisma.user.findUnique({ where: { id } });

  if (!existing) {
    throw new ApiError(404, "User not found");
  }

  return prisma.user.update({
    where: { id },
    data: { status: input.status },
    select: userSelect,
  });
};

export const userService = {
  getMe,
  getById,
  updateMe,
  list,
  updateStatus,
};
