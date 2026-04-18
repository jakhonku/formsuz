import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const bots = await prisma.bot.findMany({
    where: { userId: session.user.id },
    include: {
      form: { select: { id: true, title: true, googleFormId: true } },
      _count: { select: { responses: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    bots.map((b) => ({
      id: b.id,
      name: b.name,
      telegramBotUsername: b.telegramBotUsername,
      status: b.status,
      createdAt: b.createdAt,
      responsesCount: b._count.responses,
      form: b.form,
    }))
  );
}
