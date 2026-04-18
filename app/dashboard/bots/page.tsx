import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BotsListClient } from "@/components/dashboard/BotsListClient";

export default async function BotsPage() {
  const session = await getServerSession(authOptions);

  const bots = await prisma.bot.findMany({
    where: { userId: session?.user?.id },
    include: {
      form: { select: { title: true } },
      _count: { select: { responses: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const data = bots.map((b) => ({
    id: b.id,
    telegramBotUsername: b.telegramBotUsername,
    name: b.name,
    status: b.status,
    responsesCount: b._count.responses,
    formTitle: b.form.title,
  }));

  return <BotsListClient bots={data} />;
}
