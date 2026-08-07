import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient, StockStatus, ProductStatus } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL ?? "" });
const prisma = new PrismaClient({ adapter });

const trendingCategories = [
  { name: "Sofas & Seating", slug: "sofas-seating" },
  { name: "Beds & Mattresses", slug: "beds-mattresses" },
  { name: "Dining Tables & Chairs", slug: "dining-tables-chairs" },
];

const trendingProducts = [
  {
    title: "Armchairs",
    sku: "TRD-ARM-001",
    slug: "trending-armchairs",
    category: "Sofas & Seating",
    collection: "Living Room",
    brand: "Omers Furniture",
    tags: ["Armchair", "Modern"],
    price: 120,
    compareAtPrice: 150,
    badge: "Sale",
    description: "Premium armchairs designed for modern comfort and style.",
    longDescription: "Crafted with durable materials and ergonomic contours, these armchairs enhance any modern living space.",
    features: [
      "Ergonomic seating contour.",
      "Sturdy teak wood support legs.",
      "Soft, breathable fabric upholstery.",
      "Easy maintenance and scratch resistance.",
    ],
    images: ["/images/products/trending-products1-1.png"],
    colors: ["#8B5A2B", "#5C3A21"],
    options: [{ label: "Finish", values: ["Teak Natural", "Walnut"] }],
    stock: 20,
    stockStatus: StockStatus.IN_STOCK,
    status: ProductStatus.PUBLISHED,
    rating: 4.9,
    reviewCount: 45,
    specs: { Material: "Wood & Fabric", Warranty: "1 Year" },
    flags: { isNew: false, isFeatured: false, isTrending: true, isHotDeal: false },
  },
  {
    title: "DreamRest King Bed",
    sku: "TRD-BED-002",
    slug: "trending-dreamrest-king-bed",
    category: "Beds & Mattresses",
    collection: "Bedroom",
    brand: "DreamRest",
    tags: ["Bed", "King"],
    price: 220,
    compareAtPrice: 260,
    badge: "Sale",
    description: "Luxury King Size Bed for ultimate sleeping comfort.",
    longDescription: "The DreamRest King Bed combines premium wood craftsmanship with contemporary aesthetic features.",
    features: [
      "Solid wooden headboard.",
      "Heavy-duty mattress support slats.",
      "Premium dark grey fabric accent.",
      "Includes delivery and free setup.",
    ],
    images: ["/images/products/trending-products1-2.png"],
    colors: ["#333333", "#777777"],
    options: [{ label: "Size", values: ["King", "Queen"] }],
    stock: 15,
    stockStatus: StockStatus.IN_STOCK,
    status: ProductStatus.PUBLISHED,
    rating: 4.9,
    reviewCount: 72,
    specs: { Size: "King", Material: "Teak Wood & Upholstery", Warranty: "3 Years" },
    flags: { isNew: false, isFeatured: true, isTrending: true, isHotDeal: false },
  },
  {
    title: "Dining Chairs",
    sku: "TRD-DNC-003",
    slug: "trending-dining-chairs",
    category: "Dining Tables & Chairs",
    collection: "Dining Room",
    brand: "Omers Furniture",
    tags: ["Dining", "Modern"],
    price: 99,
    compareAtPrice: 130,
    badge: "Sale",
    description: "Sleek dining chair set designed for modern dining experiences.",
    longDescription: "Engineered for sturdy support and elegant dining room styling.",
    features: [
      "Sturdy metal legs.",
      "Comfortable cushioned seat.",
      "Modern minimalist outline.",
    ],
    images: ["/images/products/trending-products1-3.png"],
    colors: ["#555555", "#999999"],
    options: [{ label: "Color", values: ["Grey", "Black"] }],
    stock: 30,
    stockStatus: StockStatus.IN_STOCK,
    status: ProductStatus.PUBLISHED,
    rating: 4.8,
    reviewCount: 38,
    specs: { Material: "Metal & Fabric", Warranty: "1 Year" },
    flags: { isNew: false, isFeatured: false, isTrending: true, isHotDeal: false },
  },
  {
    title: "Lounge Chairs",
    sku: "TRD-LNG-004",
    slug: "trending-lounge-chairs",
    category: "Sofas & Seating",
    collection: "Living Room",
    brand: "Omers Furniture",
    tags: ["Lounge", "Comfort"],
    price: 89,
    compareAtPrice: 110,
    badge: "Sale",
    description: "Relaxing lounge chair ideal for living rooms and reading nooks.",
    longDescription: "Offers deep-cushioned seating for total relaxation during leisure hours.",
    features: [
      "Deep plush seating cushion.",
      "Reclined backrest posture.",
      "Durable upholstery fabric.",
    ],
    images: ["/images/products/trending-products1-4.png"],
    colors: ["#444444"],
    options: [{ label: "Style", values: ["Standard"] }],
    stock: 25,
    stockStatus: StockStatus.IN_STOCK,
    status: ProductStatus.PUBLISHED,
    rating: 4.7,
    reviewCount: 29,
    specs: { Material: "Plush Fabric", Warranty: "1 Year" },
    flags: { isNew: false, isFeatured: false, isTrending: true, isHotDeal: false },
  },
  {
    title: "2 Seater Sofa",
    sku: "TRD-SOF-005",
    slug: "trending-2-seater-sofa",
    category: "Sofas & Seating",
    collection: "Living Room",
    brand: "Omers Furniture",
    tags: ["Sofa", "Two Seater"],
    price: 220,
    compareAtPrice: 270,
    badge: "Sale",
    description: "Compact 2-seater sofa perfect for modern apartments.",
    longDescription: "Vibrant cyan tone sofa built with premium foam cushioning and high-grade wooden frame.",
    features: [
      "Compact footprint.",
      "Vibrant high-grade fabric.",
      "Soft supportive armrests.",
    ],
    images: ["/images/products/trending-products1-5.png"],
    colors: ["#008080"],
    options: [{ label: "Capacity", values: ["2 Seater"] }],
    stock: 18,
    stockStatus: StockStatus.IN_STOCK,
    status: ProductStatus.PUBLISHED,
    rating: 4.9,
    reviewCount: 54,
    specs: { Material: "Teak & Cyan Fabric", Warranty: "2 Years" },
    flags: { isNew: false, isFeatured: true, isTrending: true, isHotDeal: false },
  },
  {
    title: "Patio Chairs",
    sku: "TRD-PAT-006",
    slug: "trending-patio-chairs",
    category: "Sofas & Seating",
    collection: "Outdoor",
    brand: "Omers Furniture",
    tags: ["Outdoor", "Patio"],
    price: 120,
    compareAtPrice: 145,
    badge: "Sale",
    description: "Weather-resistant outdoor patio chair for gardens and balconies.",
    longDescription: "Durable patio seating engineered to withstand outdoor weather elements.",
    features: [
      "Weather-proof coating.",
      "Lightweight for easy moving.",
      "Sturdy outdoor frame.",
    ],
    images: ["/images/products/trending-products1-6.png"],
    colors: ["#A52A2A"],
    options: [{ label: "Type", values: ["Outdoor"] }],
    stock: 40,
    stockStatus: StockStatus.IN_STOCK,
    status: ProductStatus.PUBLISHED,
    rating: 4.8,
    reviewCount: 31,
    specs: { Material: "Weatherproof Metal & Wood", Warranty: "1 Year" },
    flags: { isNew: false, isFeatured: false, isTrending: true, isHotDeal: false },
  },
];

async function main() {
  console.log("Seeding trending products into database...");
  const categoryMap = new Map<string, string>();

  for (const cat of trendingCategories) {
    const existing = await prisma.category.findUnique({ where: { slug: cat.slug } });
    const category = existing ?? (await prisma.category.create({ data: cat }));
    categoryMap.set(cat.name, category.id);
  }

  for (const item of trendingProducts) {
    const { category, ...productData } = item;
    const categoryId = categoryMap.get(category);
    if (!categoryId) continue;

    await prisma.product.upsert({
      where: { slug: productData.slug },
      update: {
        ...productData,
        categoryId,
      },
      create: {
        ...productData,
        categoryId,
      },
    });
    console.log(`Upserted product: ${productData.title} (${productData.slug})`);
  }

  console.log("Successfully pushed 6 trending products to Database!");
}

main()
  .catch((e) => {
    console.error("Error seeding trending products:", e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
