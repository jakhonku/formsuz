import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { encrypt } from "@/lib/crypto";
import { getMe, setWebhook } from "@/lib/telegram";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { type, botToken } = await req.json();

    if (!type || !botToken) {
      return NextResponse.json({ error: "Barcha maydonlar majburiy" }, { status: 400 });
    }

    const botInfo = await getMe(botToken);
    if (!botInfo || !botInfo.ok) {
      return NextResponse.json({ error: "Noto'g'ri Telegram Token" }, { status: 400 });
    }

    // Encrypt token
    const encryptedToken = encrypt(botToken);

    // Save bot to db
    const bot = await prisma.bot.create({
      data: {
        userId: session.user.id,
        name: botInfo.result.first_name,
        telegramBotUsername: botInfo.result.username,
        telegramToken: encryptedToken,
        type: type, // UNIVERSAL, DRIVE, CALENDAR, TASKS
        status: "active",
      },
    });

    // Set webhook
    const webhookUrl = `${process.env.NEXTAUTH_URL}/api/webhook/telegram/${bot.id}`;
    const webhookSet = await setWebhook(botToken, webhookUrl);
    if (!webhookSet) {
      // Rollback
      await prisma.bot.delete({ where: { id: bot.id } });
      return NextResponse.json({ error: "Webhook sozlashda xatolik" }, { status: 500 });
    }

    return NextResponse.json(bot);
  } catch (error: any) {
    console.error("Connect Workspace Bot error:", error);
    if (error?.code === "P2002") {
      return NextResponse.json({ error: "Bu bot allaqachon ulangan" }, { status: 400 });
    }
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}
