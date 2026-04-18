import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendMessage, sendPhoto, sendDocument, sendVoice } from "@/lib/telegram";
import { decrypt } from "@/lib/crypto";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const { botId, chatId, content, type, fileUrl } = await req.json();

    const bot = await prisma.bot.findUnique({
      where: { id: botId, userId: session.user.id },
    });

    if (!bot) return new NextResponse("Bot not found", { status: 404 });

    const botToken = decrypt(bot.telegramToken);

    // Send to Telegram
    let tgRes;
    if (type === "text") {
      tgRes = await sendMessage(botToken, chatId, content);
    } else if (type === "image") {
      tgRes = await sendPhoto(botToken, chatId, fileUrl, content);
    } else if (type === "file") {
      tgRes = await sendDocument(botToken, chatId, fileUrl, content);
    } else if (type === "voice") {
      tgRes = await sendVoice(botToken, chatId, fileUrl);
    }

    // Save to DB
    const message = await prisma.chatMessage.create({
      data: {
        botId,
        chatId,
        content: content || null,
        type,
        fileUrl: fileUrl || null,
        sender: "admin",
      },
    });

    return NextResponse.json(message);
  } catch (error: any) {
    console.error("Chat send error:", error);
    return new NextResponse(error.message || "Internal Error", { status: 500 });
  }
}
