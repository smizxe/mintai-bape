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
