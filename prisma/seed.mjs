import { randomBytes, scryptSync } from "node:crypto";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function hashPassword(password) {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derived}`;
}

async function main() {
  const adminPassword = "Admin@123456";

  await prisma.user.upsert({
    where: { email: "admin@mintaibape.vn" },
    update: {
      displayName: "MinTai Admin",
      role: "ADMIN",
      passwordHash: hashPassword(adminPassword),
    },
    create: {
      email: "admin@mintaibape.vn",
      displayName: "MinTai Admin",
      role: "ADMIN",
      passwordHash: hashPassword(adminPassword),
    },
  });

  const accountTypes = [
    { name: "Acc gà", slug: "acc-ga", className: "tier-starter", sortOrder: 1 },
    { name: "Acc ngon", slug: "acc-ngon", className: "tier-elite", sortOrder: 2 },
    { name: "Acc hiếm", slug: "acc-hiem", className: "tier-rare", sortOrder: 3 },
    { name: "Acc xịn", slug: "acc-xin", className: "tier-mythic", sortOrder: 4 },
  ];

  for (const type of accountTypes) {
    await prisma.accountType.upsert({
      where: { slug: type.slug },
      update: {
        name: type.name,
        className: type.className,
        sortOrder: type.sortOrder,
      },
      create: type,
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
