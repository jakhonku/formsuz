import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const bot = await prisma.votingBot.findUnique({ where: { id: params.id } });
  if (!bot || bot.userId !== session.user.id) {
    return NextResponse.json({ error: "Topilmadi" }, { status: 404 });
  }

  const votes = await prisma.vote.findMany({
    where: { votingBotId: bot.id },
    include: { candidate: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  return NextResponse.json(
    votes.map((v) => ({
      id: v.id,
      candidateId: v.candidateId,
      candidateName: v.candidate.name,
      chatId: v.chatId,
      voterName: v.voterName,
      voterUsername: v.voterUsername,
      createdAt: v.createdAt,
    }))
  );
}
