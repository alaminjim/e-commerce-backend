import { prisma } from "../../config/prisma";
import { ApiError } from "../../utils/ApiError";
import type { CreateReviewInput } from "./review.types";

const updateProductRating = async (productId: string) => {
  const aggregate = await prisma.review.aggregate({
    where: { productId },
    _avg: { rating: true },
    _count: { _all: true },
  });

  await prisma.product.update({
    where: { id: productId },
    data: {
      rating: aggregate._avg.rating ?? 0,
      reviewCount: aggregate._count._all,
    },
  });
};

const resolveProduct = async (productIdOrSlug: string) => {
  return prisma.product.findFirst({
    where: {
      OR: [{ id: productIdOrSlug }, { slug: productIdOrSlug }],
    },
  });
};

const list = async () => {
  const items = await prisma.review.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      product: { select: { id: true, title: true, slug: true, images: true } },
      user: { select: { id: true, name: true, email: true, avatar: true } },
    },
  });

  return { items, total: items.length };
};

const listByProduct = async (productIdOrSlug: string) => {
  const product = await resolveProduct(productIdOrSlug);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  const items = await prisma.review.findMany({
    where: { productId: product.id },
    orderBy: { createdAt: "desc" },
  });

  const aggregate = await prisma.review.aggregate({
    where: { productId: product.id },
    _avg: { rating: true },
    _count: { _all: true },
  });

  return {
    productId: product.id,
    productSlug: product.slug,
    rating: aggregate._avg.rating ?? 0,
    reviewCount: aggregate._count._all,
    items,
  };
};

const create = async (input: CreateReviewInput, userId?: string | null) => {
  const product = await resolveProduct(input.productId);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  const review = await prisma.review.create({
    data: {
      productId: product.id,
      userId: userId ?? null,
      name: input.name,
      email: input.email || null,
      rating: input.rating,
      comment: input.comment,
    },
  });

  await updateProductRating(product.id);

  return review;
};

const remove = async (id: string) => {
  const review = await prisma.review.findUnique({ where: { id } });

  if (!review) {
    throw new ApiError(404, "Review not found");
  }

  await prisma.review.delete({ where: { id } });

  await updateProductRating(review.productId);

  return { id };
};

export const reviewService = { list, listByProduct, create, remove };
