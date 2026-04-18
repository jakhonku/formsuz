const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Applying Plan fields to User table...");
  try {
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "User" 
      ADD COLUMN IF NOT EXISTS "plan" TEXT DEFAULT 'FREE',
      ADD COLUMN IF NOT EXISTS "planExpiresAt" TIMESTAMP WITH TIME ZONE;
    `);
    console.log("Success: Plan fields added.");
  } catch (e) {
    console.error("Error adding plan fields:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
