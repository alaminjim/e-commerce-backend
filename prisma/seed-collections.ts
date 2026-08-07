import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL ?? "" });
const prisma = new PrismaClient({ adapter });

const demoCollections = [
  {
    name: "Living Room",
    slug: "living-room",
    description: "Living room furniture & decor collection",
    sortOrder: 1,
    status: "ACTIVE" as const,
  },
  {
    name: "Bedroom",
    slug: "bedroom",
    description: "Bedroom sets, beds, and almirahs collection",
    sortOrder: 2,
    status: "ACTIVE" as const,
  },
  {
    name: "Dining Room",
    slug: "dining-room",
    description: "Dining tables and seating collection",
    sortOrder: 3,
    status: "ACTIVE" as const,
  },
  {
    name: "Home Office",
    slug: "home-office",
    description: "Ergonomic desks and office chairs collection",
    sortOrder: 4,
    status: "ACTIVE" as const,
  },
  {
    name: "Outdoor",
    slug: "outdoor",
    description: "Patio and weather-resistant outdoor furniture collection",
    sortOrder: 5,
    status: "ACTIVE" as const,
  },
  {
    name: "Kids Room",
    slug: "kids-room",
    description: "Furniture for children and study spaces",
    sortOrder: 6,
    status: "ACTIVE" as const,
  },
];

async function main() {
  let createdCount = 0;

  for (const collection of demoCollections) {
    const existing = await prisma.collection.findFirst({
      where: {
        OR: [
          { slug: collection.slug },
          { name: { equals: collection.name, mode: "insensitive" } },
        ],
      },
    });

    if (existing) {
      console.log(`Collection already exists: "${collection.name}"`);
      continue;
    }

    await prisma.collection.create({ data: collection });
    console.log(`Created collection: "${collection.name}"`);
    createdCount++;
  }

  console.log(`Successfully seeded ${createdCount} collection(s) into database.`);
}

main()
  .catch((error) => {
    console.error("Error seeding collections:", error);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
