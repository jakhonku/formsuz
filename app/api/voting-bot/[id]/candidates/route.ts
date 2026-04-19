import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireVotingBot(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  const bot = await prisma.votingBot.findUnique({ where: { id } });
  if (!bot || bot.userId !== session.user.id) {
    return { error: NextResponse.json({ error: "Topilmadi" }, { status: 404 }) };
  }
  return { session, bot };
}

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const result = await requireVotingBot(params.id);
  if ("error" in result) return result.error;
  const { bot } = result;

  try {
    const body = await req.json();
    const { name, description, photoUrl } = body || {};

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "Nomzod nomini kiriting" }, { status: 400 });
    }

    const count = await prisma.candidate.count({ where: { votingBotId: bot.id } });

    const candidate = await prisma.candidate.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        photoUrl: photoUrl?.trim() || null,
        votingBotId: bot.id,
        order: count,
      },
    });

    return NextResponse.json(candidate);
  } catch (error: any) {
    console.error("Add candidate error:", error);
    return NextResponse.json(
      { error: error?.message || "Nomzod qo'shishda xatolik" },
      { status: 500 }
    );
  }
}
