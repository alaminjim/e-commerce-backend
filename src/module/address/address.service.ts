import { prisma } from "../../config/prisma";
import { ApiError } from "../../utils/ApiError";
import {
  addressSelect,
  type CreateAddressInput,
  type UpdateAddressInput,
} from "./address.types";

const listAddresses = async (userId: string) => {
  return prisma.userAddress.findMany({
    where: { userId },
    orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
    select: addressSelect,
  });
};

const ensureAddressOwnership = async (userId: string, id: string) => {
  const existing = await prisma.userAddress.findFirst({
    where: { id, userId },
  });

  if (!existing) {
    throw new ApiError(404, "Address not found");
  }

  return existing;
};

/** Unset the default flag on all of the user's other addresses. */
const clearDefault = async (userId: string, exceptId?: string) => {
  await prisma.userAddress.updateMany({
    where: {
      userId,
      isDefault: true,
      ...(exceptId ? { NOT: { id: exceptId } } : {}),
    },
    data: { isDefault: false },
  });
};

const createAddress = async (userId: string, input: CreateAddressInput) => {
  const shouldBeDefault =
    input.isDefault ??
    (await prisma.userAddress.count({ where: { userId } })) === 0;

  if (shouldBeDefault) {
    await clearDefault(userId);
  }

  return prisma.userAddress.create({
    data: {
      userId,
      label: input.label,
      fullName: input.fullName,
      phone: input.phone,
      address: input.address,
      city: input.city,
      state: input.state,
      postalCode: input.postalCode,
      country: input.country,
      isDefault: shouldBeDefault,
    },
    select: addressSelect,
  });
};

const updateAddress = async (
  userId: string,
  id: string,
  input: UpdateAddressInput
) => {
  const existing = await ensureAddressOwnership(userId, id);

  // Prevent leaving the user with no default address.
  if (input.isDefault === false && existing.isDefault) {
    const count = await prisma.userAddress.count({ where: { userId } });
    if (count <= 1) {
      throw new ApiError(
        400,
        "Your only address must remain the default shipping address"
      );
    }
  }

  if (input.isDefault === true) {
    await clearDefault(userId, id);
  }

  return prisma.userAddress.update({
    where: { id },
    data: input,
    select: addressSelect,
  });
};

const deleteAddress = async (userId: string, id: string) => {
  const existing = await ensureAddressOwnership(userId, id);

  await prisma.userAddress.delete({ where: { id } });

  // If the deleted address was the default, promote the most recent one.
  if (existing.isDefault) {
    const next = await prisma.userAddress.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    if (next) {
      await prisma.userAddress.update({
        where: { id: next.id },
        data: { isDefault: true },
      });
    }
  }

  return { id };
};

const setDefaultAddress = async (userId: string, id: string) => {
  await ensureAddressOwnership(userId, id);
  await clearDefault(userId, id);

  return prisma.userAddress.update({
    where: { id },
    data: { isDefault: true },
    select: addressSelect,
  });
};

export const addressService = {
  listAddresses,
  createAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
};
