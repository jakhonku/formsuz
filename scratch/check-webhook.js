const { PrismaClient } = require("@prisma/client");
const axios = require("axios");
const crypto = require("crypto");
require("dotenv").config();

const prisma = new PrismaClient();

const RAW_KEY = process.env.ENCRYPTION_KEY || "fallback_encryption_key_change_me";
const KEY = crypto.createHash("sha256").update(RAW_KEY).digest();
const IV_LENGTH = 16;

function decrypt(text) {
  const [ivPart, encryptedPart] = text.split(":");
  if (!ivPart || !encryptedPart) return null;
  const iv = Buffer.from(ivPart, "hex");
  const encryptedText = Buffer.from(encryptedPart, "hex");
  const decipher = crypto.createDecipheriv("aes-256-cbc", KEY, iv);
  const decrypted = Buffer.concat([decipher.update(encryptedText), decipher.final()]);
  return decrypted.toString("utf8");
}

async function check() {
  try {
    const bots = await prisma.bot.findMany();
    console.log(`Found ${bots.length} bots.`);
    for (const bot of bots) {
      const token = decrypt(bot.telegramToken);
      if (!token) continue;
      const res = await axios.get(`https://api.telegram.org/bot${token}/getWebhookInfo`);
      console.log(`Bot @${bot.telegramBotUsername}:`, res.data.result);
    }
  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}

check();
