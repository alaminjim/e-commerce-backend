import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL ?? "" });
const prisma = new PrismaClient({ adapter });

const categories = [
  { name: "Sofas & Seating", slug: "sofas-seating" },
  { name: "Beds & Mattresses", slug: "beds-mattresses" },
  { name: "Dining Tables & Chairs", slug: "dining-tables-chairs" },
  { name: "Wardrobes & Almirahs", slug: "wardrobes-almirahs" },
  { name: "Office Desks & Chairs", slug: "office-desks-chairs" },
];

async function main() {
  const categoryMap = new Map<string, string>();

  for (const category of categories) {
    const existing = await prisma.category.findUnique({ where: { slug: category.slug } });

    if (existing) {
      categoryMap.set(category.name, existing.id);
      continue;
    }

    const created = await prisma.category.create({ data: category });
    categoryMap.set(category.name, created.id);
  }

  const products = await prisma.product.findMany({
    select: { id: true, category: true },
  });

  let assigned = 0;
  let unassigned = 0;

  for (const product of products) {
    const categoryId = categoryMap.get(product.category ?? "");

    if (!categoryId) {
      unassigned += 1;
      console.log(`No category for "${product.category}" (product ${product.id})`);
      continue;
    }

    await prisma.product.update({
      where: { id: product.id },
      data: { categoryId },
    });
    assigned += 1;
  }

  console.log(`Created/confirmed ${categoryMap.size} categories`);
  console.log(`Assigned ${assigned} products, skipped ${unassigned}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
