import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getFormDetails } from "@/lib/google";
import { setWebhook, verifyBotToken } from "@/lib/telegram";
import { encrypt } from "@/lib/crypto";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { formId, botToken } = await req.json();

    if (!formId || !botToken) {
      return NextResponse.json({ error: "Form ID and Bot Token are required" }, { status: 400 });
    }

    // 1. Get form details from Google
    const googleForm = await getFormDetails(session.user.accessToken, formId);
    
    // 2. Verify bot token
    const botInfo = await verifyBotToken(botToken);
    if (!botInfo) {
      return NextResponse.json({ error: "Invalid bot token" }, { status: 400 });
    }

    // 3. Save Form in DB
    const dbForm = await prisma.form.upsert({
      where: { googleFormId: formId },
      update: {
        title: googleForm.info?.title || "Untitled Form",
        metadata: googleForm as any,
      },
      create: {
        googleFormId: formId,
        title: googleForm.info?.title || "Untitled Form",
        userId: session.user.id,
        metadata: googleForm as any,
      },
    });

    // 4. Save Bot in DB
    const dbBot = await prisma.bot.create({
      data: {
        name: botInfo.first_name,
        telegramToken: encrypt(botToken),
        telegramBotUsername: botInfo.username,
        formId: dbForm.id,
        userId: session.user.id,
        status: "active",
      },
    });

    // 5. Set Webhook
    const webhookUrl = `${process.env.NEXTAUTH_URL}/api/webhook/telegram/${dbBot.id}`;
    await setWebhook(botToken, webhookUrl);

    return NextResponse.json(dbBot);
  } catch (error: any) {
    console.error("Connect bot error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
