import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL ?? "" });
const prisma = new PrismaClient({ adapter });

const slugify = (value: string): string =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

const demoBrands = [
  { name: "Hatil", description: "Premium wooden and modern home furniture" },
  { name: "IKEA", description: "Scandinavian ready-to-assemble modern furniture" },
  { name: "Ashley Furniture", description: "World-class home furnishings and decor" },
  { name: "Navana Furniture", description: "Elegant teak wood and dining furniture" },
  { name: "Partex Furniture", description: "Quality MDF & office ergonomic furniture" },
  { name: "Herman Miller", description: "Industry leading ergonomic office chairs & desks" },
  { name: "Regal Furniture", description: "Luxury velvet armchairs and living room sets" },
  { name: "Brothers Furniture", description: "Handcrafted wooden wardrobes and beds" },
  { name: "Samsung", description: "Smartphones, TVs & home appliances" },
  { name: "Philips", description: "Audio, lighting & home appliances" },
  { name: "Apple", description: "Smartphones, tablets & computing devices" },
  { name: "Sharp", description: "Displays & home electronics" },
  { name: "Panasonic", description: "Consumer electronics and appliances" },
  { name: "Oppo", description: "Smartphones & mobile devices" },
];

async function main() {
  let createdCount = 0;

  for (let index = 0; index < demoBrands.length; index++) {
    const brand = demoBrands[index];
    const slug = slugify(brand.name);

    const existing = await prisma.brand.findFirst({
      where: {
        OR: [
          { slug },
          { name: { equals: brand.name, mode: "insensitive" } },
        ],
      },
    });

    if (existing) {
      console.log(`Brand already exists: "${brand.name}"`);
      continue;
    }

    await prisma.brand.create({
      data: {
        name: brand.name,
        slug,
        description: brand.description,
        sortOrder: index + 1,
        status: "ACTIVE",
      },
    });

    console.log(`Created brand: "${brand.name}"`);
    createdCount++;
  }

  console.log(`Successfully seeded ${createdCount} brand(s) into database.`);
}

main()
  .catch((error) => {
    console.error("Error seeding brands:", error);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
