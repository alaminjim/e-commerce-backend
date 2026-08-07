import { prisma } from "../../config/prisma";
import { ApiError } from "../../utils/ApiError";

const list = async (userId: string | null = null) => {
  const items = await prisma.wishlistItem.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { product: true },
  });

  return { items, total: items.length };
};

const demoSlugMap: Record<string, string> = {
  "demo-trending-1": "trending-armchairs",
  "demo-trending-2": "trending-dreamrest-king-bed",
  "demo-trending-3": "trending-dining-chairs",
  "demo-trending-4": "trending-lounge-chairs",
  "demo-trending-5": "trending-2-seater-sofa",
  "demo-trending-6": "trending-patio-chairs",
};

const resolveProduct = async (productIdOrSlug: string) => {
  const targetSlug = demoSlugMap[productIdOrSlug] ?? productIdOrSlug;

  return prisma.product.findFirst({
    where: {
      OR: [
        { id: productIdOrSlug },
        { slug: productIdOrSlug },
        { slug: targetSlug },
      ],
    },
  });
};

const add = async (userId: string | null, productIdInput: string) => {
  const product = await resolveProduct(productIdInput);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  const existing = await prisma.wishlistItem.findFirst({
    where: { userId, productId: product.id },
  });

  if (existing) {
    return existing;
  }

  return prisma.wishlistItem.create({
    data: { userId, productId: product.id },
    include: { product: true },
  });
};

const remove = async (userId: string | null, productIdInput: string) => {
  const product = await resolveProduct(productIdInput);
  const targetProductId = product ? product.id : productIdInput;

  const result = await prisma.wishlistItem.deleteMany({
    where: {
      userId,
      OR: [
        { productId: targetProductId },
        { productId: productIdInput },
      ],
    },
  });

  if (result.count === 0) {
    throw new ApiError(404, "Product not found in wishlist");
  }

  return { productId: targetProductId };
};

export const wishlistService = { list, add, remove };
