import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { VotingBotDetail } from "@/components/dashboard/voting/VotingBotDetail";

export const dynamic = "force-dynamic";

export default async function VotingBotPage({
  params,
}: {
  params: { id: string };
}) {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) return notFound();

  const bot = await prisma.votingBot.findUnique({
    where: { id: params.id },
    include: {
      candidates: {
        orderBy: [{ order: "asc" }, { createdAt: "asc" }],
        include: { _count: { select: { votes: true } } },
      },
      _count: { select: { votes: true } },
    },
  });

  if (!bot || bot.userId !== userId) {
    return notFound();
  }

  const recentVotes = await prisma.vote.findMany({
    where: { votingBotId: bot.id },
    include: { candidate: { select: { id: true, name: true } } },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  return (
    <VotingBotDetail
      bot={{
        id: bot.id,
        name: bot.name,
        title: bot.title,
        description: bot.description,
        telegramBotUsername: bot.telegramBotUsername,
        status: bot.status,
        oneVotePerUser: bot.oneVotePerUser,
        totalVotes: bot._count.votes,
        candidates: bot.candidates.map((c) => ({
          id: c.id,
          name: c.name,
          description: c.description,
          photoUrl: c.photoUrl,
          order: c.order,
          votesCount: c._count.votes,
        })),
      }}
      recentVotes={recentVotes.map((v) => ({
        id: v.id,
        candidateName: v.candidate.name,
        candidateId: v.candidateId,
        chatId: v.chatId,
        voterName: v.voterName,
        voterUsername: v.voterUsername,
        createdAt: v.createdAt.toISOString(),
      }))}
    />
  );
}
