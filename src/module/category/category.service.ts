import { Prisma } from "../../generated/prisma/client";
import { prisma } from "../../config/prisma";
import { ApiError } from "../../utils/ApiError";
import { slugify } from "../../utils/slugify";
import type {
  CreateCategoryInput,
  ListCategoryQuery,
  UpdateCategoryInput,
} from "./category.types";

const buildWhere = (query: ListCategoryQuery): Prisma.CategoryWhereInput => {
  const where: Prisma.CategoryWhereInput = {};

  if (query.status) {
    where.status = query.status;
  }

  if (query.headerGroup) {
    where.headerGroup = query.headerGroup;
  }

  if (query.search) {
    where.OR = [{ name: { contains: query.search, mode: "insensitive" } }];
  }

  return where;
};

const list = async (query: ListCategoryQuery) => {
  const where = buildWhere(query);

  const categories = await prisma.category.findMany({
    where,
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    include: { _count: { select: { products: true } } },
  });

  const total = await prisma.category.count({ where });

  return { categories, total };
};

const getById = async (id: string) => {
  const category = await prisma.category.findUnique({
    where: { id },
    include: { _count: { select: { products: true } } },
  });

  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  return category;
};

const getBySlug = async (slug: string) => {
  const category = await prisma.category.findUnique({
    where: { slug },
    include: { _count: { select: { products: true } } },
  });

  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  return category;
};

const create = async (input: CreateCategoryInput) => {
  const slug = input.slug ?? slugify(input.name);
  const data = { ...input, slug };

  const existing = await prisma.category.findFirst({
    where: {
      OR: [
        { name: { equals: data.name, mode: "insensitive" as const } },
        { slug: { equals: data.slug, mode: "insensitive" as const } },
      ],
    },
  });

  if (existing) {
    throw new ApiError(409, "Category with the same name or slug already exists");
  }

  return prisma.category.create({ data });
};

const update = async (id: string, input: UpdateCategoryInput) => {
  await getById(id);

  if (input.name || input.slug) {
    const existing = await prisma.category.findFirst({
      where: {
        AND: [
          { id: { not: id } },
          {
            OR: [
              ...(input.name
                ? [{ name: { equals: input.name, mode: "insensitive" as const } }]
                : []),
              ...(input.slug
                ? [{ slug: { equals: input.slug, mode: "insensitive" as const } }]
                : []),
            ],
          },
        ],
      },
    });

    if (existing) {
      throw new ApiError(409, "Category with the same name or slug already exists");
    }
  }

  return prisma.category.update({
    where: { id },
    data: input,
    include: { _count: { select: { products: true } } },
  });
};

const remove = async (id: string) => {
  const category = await getById(id);

  if (category._count && category._count.products > 0) {
    throw new ApiError(
      400,
      `Cannot delete category "${category.name}" because it has ${category._count.products} associated product(s). Please reassign or delete the products first.`
    );
  }

  await prisma.category.delete({ where: { id } });

  return { id };
};

export const categoryService = {
  list,
  getById,
  getBySlug,
  create,
  update,
  remove,
};
