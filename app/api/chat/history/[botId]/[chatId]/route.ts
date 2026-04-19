import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { botId: string; chatId: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 });

  const { botId, chatId } = params;

  try {
    const bot = await prisma.bot.findUnique({
      where: { id: botId, userId: session.user.id },
    });

    if (!bot) return new NextResponse("Bot not found", { status: 404 });

    const messages = await prisma.chatMessage.findMany({
      where: { botId, chatId },
      orderBy: { createdAt: "asc" },
    });

    const firstIncoming = messages.find((m) => m.sender === "user");
    const responderName = firstIncoming?.senderName || null;
    const responderUsername = firstIncoming?.senderUsername || null;

    return NextResponse.json({
      messages,
      debugCount: messages.length,
      user: {
        name: responderName,
        username: responderUsername,
      }
    });
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}
