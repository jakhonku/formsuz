import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getFormDetails, createSpreadsheet } from "@/lib/google";
import { setWebhook, verifyBotToken } from "@/lib/telegram";
import { encrypt } from "@/lib/crypto";

function resolvePublicBaseUrl(req: Request) {
  const envUrl = process.env.NEXTAUTH_URL;
  if (envUrl) return envUrl.replace(/\/$/, "");
  const host = req.headers.get("host");
  const proto = req.headers.get("x-forwarded-proto") || "https";
  if (host) return `${proto}://${host}`;
  return "";
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.accessToken || !session.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { formId, botToken } = await req.json();

    if (!formId || !botToken) {
      return NextResponse.json({ error: "Forma va Bot token talab qilinadi" }, { status: 400 });
    }

    const trimmedToken = String(botToken).trim();

    const botInfo = await verifyBotToken(trimmedToken);
    if (!botInfo) {
      return NextResponse.json({ error: "Bot token noto'g'ri" }, { status: 400 });
    }

    const existingBot = await prisma.bot.findFirst({
      where: {
        userId: session.user.id,
        telegramBotUsername: botInfo.username,
      },
    });
    if (existingBot) {
      return NextResponse.json(
        { error: `Bu bot (@${botInfo.username}) allaqachon ulangan` },
        { status: 409 }
      );
    }

    let googleForm;
    try {
      googleForm = await getFormDetails(session.user.accessToken, formId);
    } catch (err: any) {
      console.error("Google Form details error:", err?.message || err);
      return NextResponse.json(
        { error: "Google Forma ma'lumotlarini olib bo'lmadi. Tizimga qayta kiring." },
        { status: 400 }
      );
    }

    const dbForm = await prisma.form.upsert({
      where: { googleFormId: formId },
      update: {
        title: googleForm.info?.title || "Nomsiz forma",
        metadata: googleForm as any,
      },
      create: {
        googleFormId: formId,
        title: googleForm.info?.title || "Nomsiz forma",
        userId: session.user.id,
        metadata: googleForm as any,
      },
    });

    // Create a Google Sheet for this form if not already linked
    if (!dbForm.linkedSheetId) {
      try {
        const sheetId = await createSpreadsheet(
          session.user.accessToken!,
          googleForm.info?.title || "Nomsiz forma"
        );
        if (sheetId) {
          await prisma.form.update({
            where: { id: dbForm.id },
            data: { linkedSheetId: sheetId }
          });
        }
      } catch (sheetErr) {
        console.error("Failed to create spreadsheet:", sheetErr);
      }
    }

    const dbBot = await prisma.bot.create({
      data: {
        name: botInfo.first_name,
        telegramToken: encrypt(trimmedToken),
        telegramBotUsername: botInfo.username,
        formId: dbForm.id,
        userId: session.user.id,
        status: "active",
      },
    });

    const baseUrl = resolvePublicBaseUrl(req);
    if (baseUrl) {
      const webhookUrl = `${baseUrl}/api/webhook/telegram/${dbBot.id}`;
      const webhookResult = await setWebhook(trimmedToken, webhookUrl);
      if (!webhookResult?.ok) {
        console.warn("Webhook set failed:", webhookResult);
      }
    } else {
      console.warn("Cannot resolve public base URL for webhook");
    }

    return NextResponse.json({ id: dbBot.id, username: dbBot.telegramBotUsername });
  } catch (error: any) {
    console.error("Connect bot error:", error);
    return NextResponse.json(
      { error: error?.message || "Botni ulashda xatolik yuz berdi" },
      { status: 500 }
    );
  }
}
