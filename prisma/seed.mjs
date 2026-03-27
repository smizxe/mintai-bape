import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const jsonPath = resolve(process.cwd(), "data", "products.json");
  const raw = await readFile(jsonPath, "utf8");
  const products = JSON.parse(raw);

  await prisma.productImage.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.product.deleteMany();
  await prisma.user.deleteMany();

  await prisma.user.createMany({
    data: [
      {
        email: "admin@mintaibape.vn",
        displayName: "MinTai Admin",
        role: "ADMIN",
      },
      {
        email: "user@mintaibape.vn",
        displayName: "MinTai User",
        role: "USER",
      },
    ],
  });

  for (const product of products) {
    await prisma.product.create({
      data: {
        code: product.code,
        slug: product.slug,
        title: product.title,
        shortDescription: product.shortDescription,
        descriptionHtml: product.descriptionHtml,
        tag: product.tag,
        tier: product.tier,
        priceLabel: product.price,
        priceValue: product.priceValue,
        levelLabel: product.stats[0] ?? null,
        thumbnailUrl: product.images[0],
        storageBucket: "product-images",
        storageFolder: product.slug,
        images: {
          create: product.images.map((imageUrl, index) => ({
            imageUrl,
            alt: `${product.title} image ${index + 1}`,
            position: index,
          })),
        },
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
