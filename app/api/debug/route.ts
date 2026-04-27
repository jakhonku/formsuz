import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import axios from "axios";
import { decrypt } from "@/lib/crypto";

export async function GET() {
  try {
    const userCount = await prisma.user.count();
    const botCount = await prisma.bot.count();
    
    // Check webhooks for all active bots
    const bots = await prisma.bot.findMany({
      include: { form: { select: { title: true } } }
    });

    const botDetails = await Promise.all(bots.slice(0, 5).map(async (bot) => {
      let webhookInfo: any = "No token info";
      try {
        const token = decrypt(bot.telegramToken);
        if (token) {
          const res = await axios.get(`https://api.telegram.org/bot${token}/getWebhookInfo`);
          webhookInfo = res.data.result;
        } else {
          webhookInfo = "Decryption failed";
        }
      } catch (e: any) {
        webhookInfo = "Telegram API error: " + (e.message || "Unknown");
      }

      return {
        id: bot.id,
        username: bot.telegramBotUsername,
        form: bot.form?.title || "Unknown",
        status: bot.status,
        webhook: webhookInfo
      };
    }));

    return NextResponse.json({
      status: "ok",
      env: {
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,
        DATABASE_URL_SET: !!process.env.DATABASE_URL,
        DIRECT_URL_SET: !!process.env.DIRECT_URL,
        ENCRYPTION_KEY_SET: !!process.env.ENCRYPTION_KEY,
        ENCRYPTION_KEY_LENGTH: process.env.ENCRYPTION_KEY?.length || 0
      },
      stats: {
        users: userCount,
        bots: botCount
      },
      bots: botDetails
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}