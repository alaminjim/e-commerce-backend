import { prisma } from "../../config/prisma";
import { ApiError } from "../../utils/ApiError";
import type {
  AddCartInput,
  UpdateCartQuantityInput,
} from "./cart.types";

type StockCheckable = {
  stock: number;
  stockStatus: string;
};

const validateStock = (
  product: StockCheckable,
  quantity: number
): void => {
  if (product.stockStatus === "OUT_OF_STOCK" || product.stock <= 0) {
    throw new ApiError(400, "Product is out of stock");
  }

  if (quantity > product.stock) {
    throw new ApiError(400, `Only ${product.stock} item(s) available in stock`);
  }
};

const list = async (userId: string | null = null) => {
  const items = await prisma.cartItem.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: { product: true },
  });

  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);

  return { items, total: items.length, subtotal, totalQuantity };
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

const areOptionsEqual = (a: unknown, b: unknown): boolean => {
  if (!a && !b) return true;
  if (!a || !b) return false;
  if (typeof a !== "object" || typeof b !== "object") return false;
  const objA = a as Record<string, string>;
  const objB = b as Record<string, string>;
  const keysA = Object.keys(objA);
  const keysB = Object.keys(objB);
  if (keysA.length !== keysB.length) return false;
  return keysA.every((key) => objA[key] === objB[key]);
};

const add = async (userId: string | null, input: AddCartInput) => {
  const product = await resolveProduct(input.productId);

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  const existingItems = await prisma.cartItem.findMany({
    where: { userId, productId: product.id },
  });

  const inputOptions = input.selectedOptions ?? null;
  const existing = existingItems.find((item) =>
    areOptionsEqual(item.selectedOptions, inputOptions)
  );

  const nextQuantity = existing
    ? existing.quantity + input.quantity
    : input.quantity;

  validateStock(product, nextQuantity);

  if (existing) {
    return prisma.cartItem.update({
      where: { id: existing.id },
      data: { quantity: nextQuantity },
      include: { product: true },
    });
  }

  return prisma.cartItem.create({
    data: {
      userId,
      productId: product.id,
      quantity: input.quantity,
      selectedOptions: inputOptions ?? undefined,
    },
    include: { product: true },
  });
};

const updateQuantity = async (
  userId: string | null,
  idOrProductId: string,
  input: UpdateCartQuantityInput
) => {
  const existing = await prisma.cartItem.findFirst({
    where: {
      userId,
      OR: [{ id: idOrProductId }, { productId: idOrProductId }],
    },
  });

  if (!existing) {
    throw new ApiError(404, "Product not found in cart");
  }

  const product = await prisma.product.findUnique({
    where: { id: existing.productId },
  });

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  validateStock(product, input.quantity);

  return prisma.cartItem.update({
    where: { id: existing.id },
    data: { quantity: input.quantity },
    include: { product: true },
  });
};

const remove = async (userId: string | null, idOrProductId: string) => {
  const existing = await prisma.cartItem.findFirst({
    where: {
      userId,
      OR: [{ id: idOrProductId }, { productId: idOrProductId }],
    },
  });

  if (!existing) {
    throw new ApiError(404, "Product not found in cart");
  }

  await prisma.cartItem.delete({
    where: { id: existing.id },
  });

  return { productId: idOrProductId };
};

const clear = async (userId: string | null = null) => {
  await prisma.cartItem.deleteMany({ where: { userId } });

  return { success: true };
};

export const cartService = { list, add, updateQuantity, remove, clear };
