import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Database yangilanmoqda...");
  
  try {
    // 1. Bot jadvaliga type ustunini qo'shish
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Bot" ADD COLUMN IF NOT EXISTS "type" TEXT DEFAULT 'FORM';
    `);
    console.log("✅ 'type' ustuni qo'shildi.");

    // 2. Bot jadvaliga workspaceConfig ustunini qo'shish
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Bot" ADD COLUMN IF NOT EXISTS "workspaceConfig" JSONB;
    `);
    console.log("✅ 'workspaceConfig' ustuni qo'shildi.");

    // 3. formId ustunini majburiy emas (optional) qilish
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Bot" ALTER COLUMN "formId" DROP NOT NULL;
    `);
    console.log("✅ 'formId' optional qilindi.");

    console.log("\n🚀 Ma'lumotlar bazasi muvaffaqiyatli yangilandi!");
  } catch (error) {
    console.error("❌ Xatolik yuz berdi:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
