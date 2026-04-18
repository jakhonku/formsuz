const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const botId = "cmo4wuu2r000bvuaru5haq7p1";
  const chatId = "7591385385";
  
  console.log(`Diagnostic: Fetching history for bot ${botId} and chat ${chatId}`);
  
  const messages = await prisma.$queryRawUnsafe(`
    SELECT "id", "sender", "content", "type", "createdAt" 
    FROM "ChatMessage" 
    WHERE "botId" = '${botId}' AND "chatId" = '${chatId}'
    ORDER BY "createdAt" ASC
  `);
  
  console.log("Messages found:", messages.length);
  messages.forEach(m => {
    console.log(`[${m.sender}] ${m.content} (${m.createdAt})`);
  });
}

main();
