const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  console.log("Diagnostic: Checking database records using raw SQL...");
  
  try {
    const msgCount = await prisma.$queryRawUnsafe(`SELECT COUNT(*) FROM "ChatMessage"`);
    console.log("Messages Count:", msgCount);
    
    const recentMsgs = await prisma.$queryRawUnsafe(`SELECT * FROM "ChatMessage" ORDER BY "createdAt" DESC LIMIT 5`);
    console.log("Recent Messages:", JSON.stringify(recentMsgs, null, 2));

    const resCount = await prisma.$queryRawUnsafe(`SELECT COUNT(*) FROM "Response"`);
    console.log("Responses Count:", resCount);

  } catch (e) {
    console.error("Query Error:", e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
