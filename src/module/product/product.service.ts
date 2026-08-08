import { Prisma } from "../../generated/prisma/client";
import { prisma } from "../../config/prisma";
import { ApiError } from "../../utils/ApiError";
import { slugify } from "../../utils/slugify";
import type {
  CreateProductInput,
  ListProductQuery,
  UpdateProductInput,
} from "./product.types";

const resolveCategoryId = async (categoryInput: string): Promise<string> => {
  const category = await prisma.category.findFirst({
    where: {
      OR: [
        { id: categoryInput },
        { name: { equals: categoryInput, mode: "insensitive" } },
        { slug: { equals: categoryInput, mode: "insensitive" } },
      ],
    },
  });

  if (!category) {
    throw new ApiError(404, `Category "${categoryInput}" not found`);
  }

  return category.id;
};

const formatProduct = (product: any) => {
  if (!product) return product;
  const { category, ...rest } = product;
  return {
    ...rest,
    categoryId: product.categoryId,
    category: category?.name ?? "",
    categoryObj: category ?? null,
  };
};

const buildWhere = (query: ListProductQuery): Prisma.ProductWhereInput => {
  const where: Prisma.ProductWhereInput = {};

  if (query.status) {
    where.status = query.status;
  }

  if (query.collection) {
    where.collection = query.collection;
  }

  if (query.brand) {
    where.brand = query.brand;
  }

  if (query.tag) {
    where.tags = { has: query.tag };
  }

  if (query.minPrice !== undefined || query.maxPrice !== undefined) {
    where.price = {};

    if (query.minPrice !== undefined) {
      where.price.gte = query.minPrice;
    }

    if (query.maxPrice !== undefined) {
      where.price.lte = query.maxPrice;
    }
  }

  // OR conditions from different filters are combined with AND so they
  // never overwrite each other (e.g. category + search together).
  const orConditions: Prisma.ProductWhereInput[] = [];

  if (query.category) {
    orConditions.push({
      OR: [
        { categoryId: query.category },
        { category: { is: { name: { equals: query.category, mode: "insensitive" } } } },
        { category: { is: { slug: { equals: query.category, mode: "insensitive" } } } },
      ],
    });
  }

  if (query.search) {
    orConditions.push({
      OR: [
        { title: { contains: query.search, mode: "insensitive" } },
        { description: { contains: query.search, mode: "insensitive" } },
        { brand: { contains: query.search, mode: "insensitive" } },
        { category: { is: { name: { contains: query.search, mode: "insensitive" } } } },
      ],
    });
  }

  if (orConditions.length > 0) {
    where.AND = orConditions;
  }

  return where;
};

const buildOrderBy = (
  sort?: ListProductQuery["sort"]
): Prisma.ProductOrderByWithRelationInput[] => {
  switch (sort) {
    case "price_asc":
      return [{ price: "asc" }];
    case "price_desc":
      return [{ price: "desc" }];
    case "rating":
      return [{ rating: "desc" }, { reviewCount: "desc" }];
    case "newest":
    default:
      return [{ createdAt: "desc" }];
  }
};

const toPrismaData = <T extends CreateProductInput | UpdateProductInput>(
  input: T,
  categoryId?: string
): Record<string, unknown> => {
  const { category, ...rest } = input as any;
  const data: Record<string, unknown> = { ...rest };

  if (categoryId) {
    data.categoryId = categoryId;
  }

  if (data.options === null) {
    data.options = Prisma.DbNull;
  }

  if (data.specs === null) {
    data.specs = Prisma.DbNull;
  }

  return data;
};

const list = async (query: ListProductQuery) => {
  const where = buildWhere(query);
  const orderBy = buildOrderBy(query.sort);

  const rawProducts = await prisma.product.findMany({
    where,
    orderBy,
    include: { category: true },
  });

  const total = await prisma.product.count({ where });

  return { products: rawProducts.map(formatProduct), total };
};

const getById = async (id: string) => {
  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: true },
  });

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  return formatProduct(product);
};

const getBySlug = async (slug: string) => {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { category: true },
  });

  if (!product) {
    throw new ApiError(404, "Product not found");
  }

  return formatProduct(product);
};

const create = async (input: CreateProductInput) => {
  const slug = input.slug ?? slugify(input.title);
  const data = { ...input, slug };

  const existing = await prisma.product.findFirst({
    where: { OR: [{ sku: data.sku }, { slug: data.slug }] },
  });

  if (existing) {
    throw new ApiError(409, "Product with the same SKU or slug already exists");
  }

  const categoryId = await resolveCategoryId(data.category);

  const created = await prisma.product.create({
    data: toPrismaData(data, categoryId) as Prisma.ProductCreateInput,
    include: { category: true },
  });

  return formatProduct(created);
};

const update = async (id: string, input: UpdateProductInput) => {
  await getById(id);

  if (input.sku || input.slug) {
    const existing = await prisma.product.findFirst({
      where: {
        AND: [
          { id: { not: id } },
          {
            OR: [
              ...(input.sku ? [{ sku: input.sku }] : []),
              ...(input.slug ? [{ slug: input.slug }] : []),
            ],
          },
        ],
      },
    });

    if (existing) {
      throw new ApiError(409, "Product with the same SKU or slug already exists");
    }
  }

  let categoryId: string | undefined;
  if (input.category) {
    categoryId = await resolveCategoryId(input.category);
  }

  const data = toPrismaData(input, categoryId) as Prisma.ProductUpdateInput;

  // A product with no stock left must never stay marked as IN_STOCK.
  // (Explicit admin stockStatus choices are otherwise left untouched.)
  if (typeof input.stock === "number" && input.stock <= 0) {
    data.stockStatus = "OUT_OF_STOCK";
  }

  const updated = await prisma.product.update({
    where: { id },
    data,
    include: { category: true },
  });

  return formatProduct(updated);
};

const remove = async (id: string) => {
  await getById(id);

  await prisma.product.delete({ where: { id } });

  return { id };
};

export const productService = { list, getById, getBySlug, create, update, remove };
