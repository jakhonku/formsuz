const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Diagnostic: Testing ChatMessage creation...");
  
  try {
    const testMsg = await prisma.$executeRawUnsafe(`
      INSERT INTO "ChatMessage" ("id", "botId", "chatId", "content", "type", "sender", "createdAt")
      VALUES ('test-' || gen_random_uuid(), 'cmo4sq2u80003id9o4w54eftm', '7591385385', 'Test message from server', 'text', 'user', NOW())
      RETURNING *
    `);
    console.log("Creation success:", testMsg);
  } catch (e) {
    console.error("Creation Error:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
