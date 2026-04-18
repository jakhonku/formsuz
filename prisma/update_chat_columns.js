const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Updating ChatMessage table columns...");
  try {
    await prisma.$executeRawUnsafe(`ALTER TABLE "ChatMessage" ADD COLUMN IF NOT EXISTS "senderName" TEXT;`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "ChatMessage" ADD COLUMN IF NOT EXISTS "senderUsername" TEXT;`);
    await prisma.$executeRawUnsafe(`ALTER TABLE "ChatMessage" ADD COLUMN IF NOT EXISTS "senderPhoto" TEXT;`);
    console.log("Columns added successfully!");
  } catch (error) {
    console.error("Error updating columns:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
