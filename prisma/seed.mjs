import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const demoUsers = [
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
  ];

  for (const user of demoUsers) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        displayName: user.displayName,
        role: user.role,
      },
      create: user,
    });
  }

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
