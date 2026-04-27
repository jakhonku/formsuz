const { PrismaClient } = require("@prisma/client");
const fs = require("fs");

const env = {};
try {
  const content = fs.readFileSync(".env", "utf8");
  content.split("\n").forEach(line => {
    const [key, ...val] = line.split("=");
    if (key && val) env[key.trim()] = val.join("=").trim().replace(/^["']|["']$/g, "");
  });
} catch (e) {}

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: env.DATABASE_URL
    }
  }
});

async function check() {
  try {
    const messages = await prisma.chatMessage.findMany({
      orderBy: { createdAt: "desc" },
      take: 10
    });
    console.log(`Found ${messages.length} recent messages in logs.`);
    for (const m of messages) {
      console.log(`[${m.createdAt.toISOString()}] ${m.sender}: ${m.content}`);
    }
  } catch (e) {
    console.error(e.message);
  } finally {
    await prisma.$disconnect();
  }
}

check();
