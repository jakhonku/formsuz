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

    // Try to find responder info from existing responses
    const responseInfo = await prisma.response.findFirst({
      where: { botId, chatId },
      select: { metadata: true }
    });

    const meta = responseInfo?.metadata as any;
    const responderName = meta?.message?.from ? `${meta.message?.from?.first_name || ""} ${meta.message?.from?.last_name || ""}`.trim() : null;
    const responderUsername = meta?.message?.from?.username || null;

    return NextResponse.json({
      messages,
      user: {
        name: responderName,
        username: responderUsername,
      }
    });
  } catch (error) {
    return new NextResponse("Internal Error", { status: 500 });
  }
}
