import { Prisma } from "../../generated/prisma/client";
import { prisma } from "../../config/prisma";
import { ApiError } from "../../utils/ApiError";
import { slugify } from "../../utils/slugify";
import type {
  CreateBrandInput,
  ListBrandQuery,
  UpdateBrandInput,
} from "./brand.types";

const buildWhere = (query: ListBrandQuery): Prisma.BrandWhereInput => {
  const where: Prisma.BrandWhereInput = {};

  if (query.status) {
    where.status = query.status;
  }

  if (query.search) {
    where.OR = [
      { name: { contains: query.search, mode: "insensitive" } },
      { description: { contains: query.search, mode: "insensitive" } },
    ];
  }

  return where;
};

const list = async (query: ListBrandQuery) => {
  const where = buildWhere(query);

  const brands = await prisma.brand.findMany({
    where,
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

  const total = await prisma.brand.count({ where });

  return { brands, total };
};

const getById = async (id: string) => {
  const brand = await prisma.brand.findUnique({ where: { id } });

  if (!brand) {
    throw new ApiError(404, "Brand not found");
  }

  return brand;
};

const getBySlug = async (slug: string) => {
  const brand = await prisma.brand.findUnique({ where: { slug } });

  if (!brand) {
    throw new ApiError(404, "Brand not found");
  }

  return brand;
};

const create = async (input: CreateBrandInput) => {
  const slug = input.slug ?? slugify(input.name);
  const data = { ...input, slug };

  const existing = await prisma.brand.findFirst({
    where: {
      OR: [
        { name: { equals: data.name, mode: "insensitive" as const } },
        { slug: { equals: data.slug, mode: "insensitive" as const } },
      ],
    },
  });

  if (existing) {
    throw new ApiError(409, "Brand with the same name or slug already exists");
  }

  return prisma.brand.create({ data });
};

const update = async (id: string, input: UpdateBrandInput) => {
  await getById(id);

  if (input.name || input.slug) {
    const existing = await prisma.brand.findFirst({
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
      throw new ApiError(409, "Brand with the same name or slug already exists");
    }
  }

  return prisma.brand.update({
    where: { id },
    data: input,
  });
};

const remove = async (id: string) => {
  await getById(id);

  await prisma.brand.delete({ where: { id } });

  return { id };
};

export const brandService = {
  list,
  getById,
  getBySlug,
  create,
  update,
  remove,
};
