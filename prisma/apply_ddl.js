const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Applying DDL for ChatMessage table...");
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "ChatMessage" (
        "id" TEXT NOT NULL,
        "botId" TEXT NOT NULL,
        "chatId" TEXT NOT NULL,
        "content" TEXT,
        "type" TEXT NOT NULL DEFAULT 'text',
        "fileUrl" TEXT,
        "sender" TEXT NOT NULL DEFAULT 'admin',
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
      );
    `);
    
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_botId_fkey" 
      FOREIGN KEY ("botId") REFERENCES "Bot"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    `);

    console.log("DDL applied successfully!");
  } catch (error) {
    if (error.message.includes("already exists")) {
      console.log("Table or constraint already exists.");
    } else {
      console.error("Error applying DDL:", error);
    }
  } finally {
    await prisma.$disconnect();
  }
}

main();
