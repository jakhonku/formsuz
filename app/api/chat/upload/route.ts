import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendPhoto, sendDocument } from "@/lib/telegram";
import { decrypt } from "@/lib/crypto";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

  try {
    const formData = await req.formData();
    const botId = formData.get("botId") as string;
    const chatId = formData.get("chatId") as string;
    const type = formData.get("type") as string;
    const file = formData.get("file") as File;

    if (!botId || !chatId || !file) {
      return new NextResponse("Missing fields", { status: 400 });
    }

    const bot = await prisma.bot.findUnique({
      where: { id: botId, userId: session.user.id },
    });
    if (!bot) return new NextResponse("Bot not found", { status: 404 });

    const botToken = decrypt(bot.telegramToken);
    
    // Convert File to Blob/Buffer for Telegram API
    const blob = new Blob([await file.arrayBuffer()], { type: file.type });

    let tgRes;
    if (type === "image") {
      tgRes = await sendPhoto(botToken, chatId, blob, file.name);
    } else {
      tgRes = await sendDocument(botToken, chatId, blob, file.name);
    }

    // Save to DB
    const message = await prisma.chatMessage.create({
      data: {
        botId,
        chatId,
        content: file.name,
        type,
        fileUrl: null, // We don't store it on our server yet, but it's sent to TG
        sender: "admin",
      },
    });

    return NextResponse.json(message);
  } catch (error: any) {
    console.error("Chat upload error:", error);
    return new NextResponse(error.message || "Internal Error", { status: 500 });
  }
}
