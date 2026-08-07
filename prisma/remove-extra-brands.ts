import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL ?? "" });
const prisma = new PrismaClient({ adapter });

const extraBrands = ["Samsung", "Philips", "Apple", "Sharp", "Panasonic", "Oppo"];

async function main() {
  let deletedCount = 0;

  for (const name of extraBrands) {
    const result = await prisma.brand.deleteMany({
      where: { name: { equals: name, mode: "insensitive" } },
    });

    if (result.count > 0) {
      console.log(`Deleted brand: "${name}"`);
      deletedCount++;
    } else {
      console.log(`Brand not found (skipped): "${name}"`);
    }
  }

  console.log(`Done. Removed ${deletedCount} extra brand(s).`);
}

main()
  .catch((err) => {
    console.error("Error:", err);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
