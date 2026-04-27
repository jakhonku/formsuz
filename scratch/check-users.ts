import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  try {
    const lastUsers = await prisma.user.findMany({
      orderBy: { id: 'desc' },
      take: 5
    });
    console.log("Recent users:", lastUsers);
  } catch (error) {
    console.error("Query failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
