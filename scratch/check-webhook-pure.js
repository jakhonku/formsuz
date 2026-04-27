const { PrismaClient } = require("@prisma/client");
const axios = require("axios");
const crypto = require("crypto");
const fs = require("fs");

// Simple .env parser since dotenv is missing
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

const RAW_KEY = env.ENCRYPTION_KEY || "fallback_encryption_key_change_me";
const KEY = crypto.createHash("sha256").update(RAW_KEY).digest();

function decrypt(text) {
  try {
    const [ivPart, encryptedPart] = text.split(":");
    if (!ivPart || !encryptedPart) return null;
    const iv = Buffer.from(ivPart, "hex");
    const encryptedText = Buffer.from(encryptedPart, "hex");
    const decipher = crypto.createDecipheriv("aes-256-cbc", KEY, iv);
    const decrypted = Buffer.concat([decipher.update(encryptedText), decipher.final()]);
    return decrypted.toString("utf8");
  } catch (e) {
    return null;
  }
}

async function check() {
  try {
    const bots = await prisma.bot.findMany();
    console.log(`Found ${bots.length} bots in DB.`);
    for (const bot of bots) {
      const token = decrypt(bot.telegramToken);
      if (!token) {
        console.log(`Bot @${bot.telegramBotUsername}: Decryption FAILED (check ENCRYPTION_KEY)`);
        continue;
      }
      try {
        const res = await axios.get(`https://api.telegram.org/bot${token}/getWebhookInfo`);
        console.log(`Bot @${bot.telegramBotUsername} Webhook:`, res.data.result.url || "NONE");
        if (res.data.result.last_error_message) {
          console.log(`Last Error: ${res.data.result.last_error_message}`);
        }
      } catch (err) {
        console.log(`Bot @${bot.telegramBotUsername}: Failed to get info from Telegram`);
      }
    }
  } catch (e) {
    console.error("Prisma error:", e.message);
  } finally {
    await prisma.$disconnect();
  }
}

check();
