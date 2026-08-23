import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "agniomega@gmail.com";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "agniomege";

  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existing) {
    await prisma.user.create({
      data: {
        name: "Nexus Bazaar Admin",
        email: adminEmail,
        passwordHash: await bcrypt.hash(adminPassword, 12),
        role: "ADMIN",
      },
    });
    console.log(`Created admin account: ${adminEmail} / ${adminPassword}`);
  } else {
    console.log(`Admin account ${adminEmail} already exists — skipping.`);
  }

  await prisma.platformSettings.upsert({
    where: { id: "singleton" },
    update: {},
    create: { id: "singleton", defaultCommissionRate: 10, taxRate: 18 },
  });

  // 1. General / Others (వెండర్‌కి కేటగిరీ తెలియకపోతే ఎంచుకోవడానికి)
  await prisma.category.upsert({
    where: { slug: "general-others" },
    update: {},
    create: { name: "General / Other Products", slug: "general-others" },
  });

  // 2. Art, Sculptures & Collectibles (3D Statues, Paintings, Handicrafts)
  const artCollectibles = await prisma.category.upsert({
    where: { slug: "art-sculptures-collectibles" },
    update: {},
    create: { name: "Art, Sculptures & Collectibles", slug: "art-sculptures-collectibles" },
  });

  const artAttrCount = await prisma.categoryAttribute.count({
    where: { categoryId: artCollectibles.id },
  });
  if (artAttrCount === 0) {
    await prisma.categoryAttribute.createMany({
      data: [
        {
          categoryId: artCollectibles.id,
          name: "Material",
          type: "SELECT",
          options: ["Resin / PLA", "Glass", "Canvas / Paint", "Metal", "Wood", "Other"],
          required: false,
        },
        {
          categoryId: artCollectibles.id,
          name: "Finish Type",
          type: "SELECT",
          options: ["Hand Painted", "Matte", "Glossy", "Metallic"],
          required: false,
        },
      ],
    });
  }

  // 3. Home Decor & Living
  await prisma.category.upsert({
    where: { slug: "home-decor-living" },
    update: {},
    create: { name: "Home Decor & Living", slug: "home-decor-living" },
  });

  // 4. Fashion & Accessories
  await prisma.category.upsert({
    where: { slug: "fashion-apparel" },
    update: {},
    create: { name: "Fashion & Accessories", slug: "fashion-apparel" },
  });

  // 5. Electronics & Gadgets
  await prisma.category.upsert({
    where: { slug: "electronics-gadgets" },
    update: {},
    create: { name: "Electronics & Gadgets", slug: "electronics-gadgets" },
  });

  console.log("Seed complete with General & Flexible categories.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });