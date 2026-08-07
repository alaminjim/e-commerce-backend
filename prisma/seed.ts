import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL ?? "" });
const prisma = new PrismaClient({ adapter });

const demoCategories = [
  { name: "Sofas & Seating", slug: "sofas-seating" },
  { name: "Beds & Mattresses", slug: "beds-mattresses" },
  { name: "Dining Tables & Chairs", slug: "dining-tables-chairs" },
  { name: "Wardrobes & Almirahs", slug: "wardrobes-almirahs" },
  { name: "Office Desks & Chairs", slug: "office-desks-chairs" },
];

const demoProducts = [
  {
    title: "Modern Hatil Sofa",
    sku: "HAT-SOFA-001",
    slug: "modern-hatil-sofa",
    category: "Sofas & Seating",
    collection: "Living Room",
    brand: "Hatil",
    tags: ["Wooden", "Modern"],
    price: 250,
    compareAtPrice: 320,
    badge: "-25%",
    description:
      "Contemporary wingback chair crafted for ergonomic support and superior softness.",
    longDescription:
      "Experience the perfect balance of innovation and aesthetics with our modern furniture range. Sleek lines, minimalist forms, and premium finishes define this sofa.",
    features: [
      "Premium wood frame for utmost durability.",
      "Ergonomic finishing for maximum comfort.",
      "Scratch-resistant and long-lasting varnish coat.",
      "Free delivery and expert assembly.",
    ],
    images: [
      "/images/shop-products/shop-products-1.1.png",
      "/images/shop-products/shop-products-1.2.png",
      "/images/shop-products/shop-products-1.3.png",
    ],
    colors: ["#8B5A2B", "#5C3A21", "#3a2318"],
    options: [
      { label: "Seating Capacity", values: ["4 Seats", "6 Seats", "8 Seats"] },
      { label: "Wood Finish", values: ["Teak Natural", "Dark Walnut", "Ebony"] },
    ],
    stock: 25,
    stockStatus: "IN_STOCK",
    status: "PUBLISHED",
    rating: 4.9,
    reviewCount: 72,
    specs: {
      Material: "Solid Teak Wood",
      Finish: "Natural with Scratch-Resistant Varnish",
      Color: "Teak Natural / Dark Walnut / Ebony",
      "Dimensions (L x W x H)": "72 x 36 x 30 inches",
      SeatingCapacity: "6 Persons",
      Weight: "55 lbs (25 kg)",
      AssemblyRequired: "No - Delivered Fully Assembled",
      IndoorOutdoor: "Indoor Use Only",
      CareInstructions: "Wipe with dry or slightly damp cloth",
      Warranty: "2 Years Manufacturer Warranty",
      CountryOfOrigin: "Bangladesh",
    },
    flags: { isNew: false, isFeatured: true, isTrending: true, isHotDeal: true },
  },
  {
    title: "Ashley Leather Recliner",
    sku: "ASH-RECL-002",
    slug: "ashley-leather-recliner",
    category: "Sofas & Seating",
    collection: "Living Room",
    brand: "Ashley Furniture",
    tags: ["Leather", "Ergonomic"],
    price: 450,
    compareAtPrice: 520,
    badge: null,
    description:
      "Premium leather recliner built for relaxation with adjustable recline positions.",
    longDescription:
      "Handcrafted with full-grain leather and a solid wood base, this recliner offers unmatched comfort and timeless style for your living room.",
    features: [
      "Full-grain leather upholstery.",
      "Adjustable recline positions.",
      "Solid wood base for stability.",
      "Easy to clean and maintain.",
    ],
    images: [
      "/images/shop-products/shop-products-1.2.png",
      "/images/shop-products/shop-products-1.1.png",
    ],
    colors: ["#5C3A21", "#2C2C2C"],
    options: [{ label: "Color", values: ["Brown", "Black"] }],
    stock: 12,
    stockStatus: "IN_STOCK",
    status: "PUBLISHED",
    rating: 4.8,
    reviewCount: 54,
    specs: {
      Material: "Full-Grain Leather",
      Dimensions: "38 x 34 x 40 inches",
      Weight: "65 lbs (29 kg)",
      Warranty: "1 Year Manufacturer Warranty",
    },
    flags: { isNew: false, isFeatured: true, isTrending: false, isHotDeal: false },
  },
  {
    title: "IKEA Minimalist Bed",
    sku: "IKE-BED-003",
    slug: "ikea-minimalist-bed",
    category: "Beds & Mattresses",
    collection: "Bedroom",
    brand: "IKEA",
    tags: ["Minimalist", "Modern"],
    price: 320,
    compareAtPrice: null,
    badge: null,
    description:
      "Scandinavian minimalist bed frame with clean lines and durable construction.",
    longDescription:
      "A sleek, minimalist bed frame designed for modern bedrooms. Built from engineered wood with a matte finish for a clean, contemporary look.",
    features: [
      "Clean Scandinavian design.",
      "Durable engineered wood frame.",
      "Easy to assemble.",
      "Under-bed storage space.",
    ],
    images: [
      "/images/shop-products/shop-products-1.3.png",
      "/images/shop-products/shop-products-1.4.png",
    ],
    colors: ["#E8E4D8", "#4A4A4A"],
    options: [{ label: "Size", values: ["Queen", "King", "Single"] }],
    stock: 40,
    stockStatus: "IN_STOCK",
    status: "PUBLISHED",
    rating: 4.7,
    reviewCount: 32,
    specs: {
      Material: "Engineered Wood",
      Dimensions: "80 x 60 x 14 inches",
      Weight: "48 lbs (22 kg)",
      Warranty: "1 Year Warranty",
    },
    flags: { isNew: false, isFeatured: false, isTrending: true, isHotDeal: false },
  },
  {
    title: "Navana Teak Wood Dining Table",
    sku: "NV-DT-TEAK6544",
    slug: "navana-teak-wood-dining-table",
    category: "Dining Tables & Chairs",
    collection: "Dining Room",
    brand: "Navana Furniture",
    tags: ["Teak Wood", "Wooden"],
    price: 580,
    compareAtPrice: 650,
    badge: "-15%",
    description:
      "Authentic teak wood dining table with scratch-resistant finishes, seating six comfortably.",
    longDescription:
      "Elevate your dining space with our exclusive luxury furniture collection. Crafted meticulously to enrich your home, this Navana Teak Wood Dining Table brings together elegant design and unmatched durability.",
    features: [
      "Authentic Teak Wood - 100% genuine and sustainably sourced.",
      "Scratch Resistant Finish - smooth varnish that withstands daily use.",
      "Comfortable Seating - premium upholstery for maximum dining comfort.",
      "Free Expert Assembly - delivered and installed by in-house experts.",
    ],
    images: [
      "/images/shop-products/shop-products-1.4.png",
      "/images/shop-products/shop-products-1.5.png",
      "/images/shop-products/shop-products-1.6.png",
    ],
    colors: ["#8B5A2B", "#5C3A21", "#3a2318"],
    options: [
      { label: "Seating Capacity", values: ["4 Seats", "6 Seats", "8 Seats"] },
      { label: "Wood Finish", values: ["Teak Natural", "Dark Walnut", "Ebony"] },
    ],
    stock: 8,
    stockStatus: "IN_STOCK",
    status: "PUBLISHED",
    rating: 4.9,
    reviewCount: 72,
    specs: {
      Material: "Solid Teak Wood",
      Finish: "Natural Teak with Scratch-Resistant Varnish",
      Color: "Teak Natural / Dark Walnut / Ebony",
      "Dimensions (L x W x H)": "72 x 36 x 30 inches",
      SeatingCapacity: "6 Persons",
      Weight: "55 lbs (25 kg)",
      LegType: "Tapered Solid Wood Legs",
      AssemblyRequired: "No - Delivered Fully Assembled",
      IndoorOutdoor: "Indoor Use Only",
      CareInstructions: "Wipe with dry or slightly damp cloth",
      Warranty: "2 Years Manufacturer Warranty",
      CountryOfOrigin: "Bangladesh",
    },
    flags: { isNew: false, isFeatured: true, isTrending: true, isHotDeal: true },
  },
  {
    title: "Partex Office Desk",
    sku: "PART-DSK-005",
    slug: "partex-office-desk",
    category: "Office Desks & Chairs",
    collection: "Home Office",
    brand: "Partex Furniture",
    tags: ["MDF", "Modern"],
    price: 199,
    compareAtPrice: null,
    badge: "Hot",
    description:
      "Modern office desk with cable management and a spacious work surface.",
    longDescription:
      "Work comfortably with this modern MDF office desk, designed with cable management, sturdy legs, and a spacious work surface for maximum productivity.",
    features: [
      "Spacious work surface.",
      "Built-in cable management.",
      "Sturdy MDF construction.",
      "Quick and easy assembly.",
    ],
    images: [
      "/images/shop-products/shop-products-1.5.png",
      "/images/shop-products/shop-products-1.6.png",
    ],
    colors: ["#C8B89A", "#5A4A3A"],
    options: [{ label: "Size", values: ["120cm", "150cm"] }],
    stock: 30,
    stockStatus: "IN_STOCK",
    status: "PUBLISHED",
    rating: 4.6,
    reviewCount: 19,
    specs: {
      Material: "MDF",
      Dimensions: "120 x 60 x 75 cm",
      Weight: "28 kg",
      Warranty: "1 Year Warranty",
    },
    flags: { isNew: false, isFeatured: false, isTrending: true, isHotDeal: false },
  },
  {
    title: "Herman Miller Ergonomic Chair",
    sku: "HM-ERG-006",
    slug: "herman-miller-ergonomic-chair",
    category: "Office Desks & Chairs",
    collection: "Home Office",
    brand: "Herman Miller",
    tags: ["Ergonomic", "Modern"],
    price: 999,
    compareAtPrice: 1150,
    badge: null,
    description:
      "World-class ergonomic chair with adjustable lumbar support and breathable mesh.",
    longDescription:
      "Designed for all-day comfort, this ergonomic chair features adjustable lumbar support, breathable mesh, and a synchronized recline mechanism.",
    features: [
      "Adjustable lumbar support.",
      "Breathable mesh backrest.",
      "Synchronized tilt mechanism.",
      "Height and armrest adjustments.",
    ],
    images: [
      "/images/shop-products/shop-products-1.6.png",
      "/images/shop-products/shop-products-1.7.png",
    ],
    colors: ["#2C2C2C", "#4A4A4A"],
    options: [{ label: "Color", values: ["Black", "Graphite"] }],
    stock: 5,
    stockStatus: "IN_STOCK",
    status: "PUBLISHED",
    rating: 4.9,
    reviewCount: 88,
    specs: {
      Material: "Mesh and Aluminum",
      Dimensions: "42 x 28 x 42 inches",
      Weight: "42 lbs (19 kg)",
      Warranty: "12 Year Warranty",
    },
    flags: { isNew: false, isFeatured: true, isTrending: false, isHotDeal: false },
  },
  {
    title: "Regal Velvet Armchair",
    sku: "REG-ARM-007",
    slug: "regal-velvet-armchair",
    category: "Sofas & Seating",
    collection: "Living Room",
    brand: "Regal Furniture",
    tags: ["Velvet", "Modern"],
    price: 249,
    compareAtPrice: 280,
    badge: "-10%",
    description:
      "Elegant velvet armchair with a bold silhouette and plush cushioning.",
    longDescription:
      "Make a statement with this plush velvet armchair, featuring a bold silhouette, sturdy wooden legs, and luxurious cushioning.",
    features: [
      "Luxurious velvet upholstery.",
      "Plush high-density foam cushioning.",
      "Solid wooden legs.",
      "Stain-resistant fabric.",
    ],
    images: [
      "/images/shop-products/shop-products-1.7.png",
      "/images/shop-products/shop-products-1.8.png",
    ],
    colors: ["#7A2E4D", "#2E5C7A", "#7A2E2E"],
    options: [{ label: "Color", values: ["Burgundy", "Blue", "Red"] }],
    stock: 18,
    stockStatus: "IN_STOCK",
    status: "PUBLISHED",
    rating: 4.8,
    reviewCount: 41,
    specs: {
      Material: "Velvet",
      Dimensions: "30 x 33 x 32 inches",
      Weight: "35 lbs (16 kg)",
      Warranty: "1 Year Warranty",
    },
    flags: { isNew: true, isFeatured: false, isTrending: false, isHotDeal: false },
  },
  {
    title: "Brothers Wooden Wardrobe",
    sku: "BRO-WRD-008",
    slug: "brothers-wooden-wardrobe",
    category: "Wardrobes & Almirahs",
    collection: "Bedroom",
    brand: "Brothers Furniture",
    tags: ["Wooden", "Teak Wood"],
    price: 420,
    compareAtPrice: null,
    badge: "New",
    description:
      "Spacious teak wood wardrobe with multiple shelves, drawers, and hanging space.",
    longDescription:
      "Keep your wardrobe organized with this spacious teak wood wardrobe, offering multiple shelves, drawers, and a full-length hanging compartment.",
    features: [
      "Spacious storage compartments.",
      "Full-length hanging space.",
      "Durable teak wood construction.",
      "Soft-close doors.",
    ],
    images: [
      "/images/shop-products/shop-products-1.8.png",
      "/images/shop-products/shop-products-1.9.png",
    ],
    colors: ["#8B5A2B", "#5C3A21"],
    options: [{ label: "Size", values: ["3 Door", "4 Door"] }],
    stock: 15,
    stockStatus: "IN_STOCK",
    status: "PUBLISHED",
    rating: 4.7,
    reviewCount: 27,
    specs: {
      Material: "Teak Wood",
      Dimensions: "60 x 24 x 72 inches",
      Weight: "110 lbs (50 kg)",
      Warranty: "2 Year Warranty",
    },
    flags: { isNew: true, isFeatured: false, isTrending: false, isHotDeal: false },
  },
  {
    title: "Hatil Outdoor Seating",
    sku: "HAT-OUT-009",
    slug: "hatil-outdoor-seating",
    category: "Sofas & Seating",
    collection: "Living Room",
    brand: "Hatil",
    tags: ["Outdoor", "Wooden"],
    price: 350,
    compareAtPrice: 390,
    badge: "-10%",
    description:
      "Weather-resistant outdoor seating set with a natural wood finish.",
    longDescription:
      "Relax outdoors in style with this weather-resistant seating set, built with treated wood and quick-drying cushions for year-round use.",
    features: [
      "Weather-resistant treated wood.",
      "Quick-drying outdoor cushions.",
      "Rust-proof hardware.",
      "UV-protected finish.",
    ],
    images: [
      "/images/shop-products/shop-products-1.9.png",
      "/images/shop-products/shop-products-1.10.png",
    ],
    colors: ["#8B6F47", "#4A3A2A"],
    options: [{ label: "Set Size", values: ["2 Seater", "3 Seater"] }],
    stock: 20,
    stockStatus: "IN_STOCK",
    status: "PUBLISHED",
    rating: 4.6,
    reviewCount: 23,
    specs: {
      Material: "Treated Wood",
      Dimensions: "56 x 30 x 32 inches",
      Weight: "60 lbs (27 kg)",
      Warranty: "1 Year Warranty",
    },
    flags: { isNew: false, isFeatured: false, isTrending: false, isHotDeal: true },
  },
  {
    title: "IKEA MDF Wardrobe",
    sku: "IKE-WRD-010",
    slug: "ikea-mdf-wardrobe",
    category: "Wardrobes & Almirahs",
    collection: "Bedroom",
    brand: "IKEA",
    tags: ["MDF", "Minimalist"],
    price: 150,
    compareAtPrice: null,
    badge: "New",
    description:
      "Minimalist MDF wardrobe with sliding doors and internal shelves.",
    longDescription:
      "A compact minimalist wardrobe made from MDF, featuring sliding doors and adjustable internal shelves for flexible storage.",
    features: [
      "Sliding doors save space.",
      "Adjustable internal shelves.",
      "Minimalist design.",
      "Easy assembly.",
    ],
    images: [
      "/images/shop-products/shop-products-1.10.png",
      "/images/shop-products/shop-products-1.1.png",
    ],
    colors: ["#E8E4D8", "#FFFFFF"],
    options: [{ label: "Size", values: ["2 Door", "3 Door"] }],
    stock: 35,
    stockStatus: "IN_STOCK",
    status: "PUBLISHED",
    rating: 4.5,
    reviewCount: 16,
    specs: {
      Material: "MDF",
      Dimensions: "48 x 20 x 70 inches",
      Weight: "80 lbs (36 kg)",
      Warranty: "1 Year Warranty",
    },
    flags: { isNew: true, isFeatured: false, isTrending: false, isHotDeal: false },
  },
];

async function main() {
  const count = await prisma.product.count();

  if (count > 0) {
    console.log(`Seed skipped: ${count} products already exist`);
    return;
  }

  const categoryMap = new Map<string, string>();

  for (const category of demoCategories) {
    const existing = await prisma.category.findUnique({ where: { slug: category.slug } });
    const created = existing ?? (await prisma.category.create({ data: category }));
    categoryMap.set(category.name, created.id);
  }

  const data = demoProducts.map(({ category, ...product }) => {
    const categoryId = categoryMap.get(category);

    if (!categoryId) {
      throw new Error(`Unknown category "${category}"`);
    }

    return { ...product, categoryId };
  });

  const result = await prisma.product.createMany({ data });

  console.log(`Seeded ${result.count} demo products`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
