import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Bot jadvali tekshirilmoqda...");
  
  try {
    const columns: any = await prisma.$queryRaw`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'Bot';
    `;
    console.log("Mavjud ustunlar:");
    console.table(columns);
  } catch (error) {
    console.error("❌ Xatolik:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
