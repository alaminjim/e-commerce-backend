import { Prisma } from "../../generated/prisma/client";
import { prisma } from "../../config/prisma";
import { ApiError } from "../../utils/ApiError";
import { slugify } from "../../utils/slugify";
import type {
  CreateCollectionInput,
  ListCollectionQuery,
  UpdateCollectionInput,
} from "./collection.types";

const buildWhere = (query: ListCollectionQuery): Prisma.CollectionWhereInput => {
  const where: Prisma.CollectionWhereInput = {};

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

const list = async (query: ListCollectionQuery) => {
  const where = buildWhere(query);

  const collections = await prisma.collection.findMany({
    where,
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
  });

  const total = await prisma.collection.count({ where });

  return { collections, total };
};

const getById = async (id: string) => {
  const collection = await prisma.collection.findUnique({ where: { id } });

  if (!collection) {
    throw new ApiError(404, "Collection not found");
  }

  return collection;
};

const getBySlug = async (slug: string) => {
  const collection = await prisma.collection.findUnique({ where: { slug } });

  if (!collection) {
    throw new ApiError(404, "Collection not found");
  }

  return collection;
};

const create = async (input: CreateCollectionInput) => {
  const slug = input.slug ?? slugify(input.name);
  const data = { ...input, slug };

  const existing = await prisma.collection.findFirst({
    where: {
      OR: [
        { name: { equals: data.name, mode: "insensitive" as const } },
        { slug: { equals: data.slug, mode: "insensitive" as const } },
      ],
    },
  });

  if (existing) {
    throw new ApiError(409, "Collection with the same name or slug already exists");
  }

  return prisma.collection.create({ data });
};

const update = async (id: string, input: UpdateCollectionInput) => {
  await getById(id);

  if (input.name || input.slug) {
    const existing = await prisma.collection.findFirst({
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
      throw new ApiError(409, "Collection with the same name or slug already exists");
    }
  }

  return prisma.collection.update({
    where: { id },
    data: input,
  });
};

const remove = async (id: string) => {
  await getById(id);

  await prisma.collection.delete({ where: { id } });

  return { id };
};

export const collectionService = {
  list,
  getById,
  getBySlug,
  create,
  update,
  remove,
};
