import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/crypto";
import { deleteBotWebhook, setWebhook } from "@/lib/telegram";

function resolvePublicBaseUrl(req: Request) {
  const envUrl = process.env.NEXTAUTH_URL;
  if (envUrl) return envUrl.replace(/\/$/, "");
  const host = req.headers.get("host");
  const proto = req.headers.get("x-forwarded-proto") || "https";
  if (host) return `${proto}://${host}`;
  return "";
}

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

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const result = await requireVotingBot(params.id);
  if ("error" in result) return result.error;

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

  if (!bot) {
    return NextResponse.json({ error: "Topilmadi" }, { status: 404 });
  }

  return NextResponse.json({
    id: bot.id,
    name: bot.name,
    title: bot.title,
    description: bot.description,
    telegramBotUsername: bot.telegramBotUsername,
    status: bot.status,
    oneVotePerUser: bot.oneVotePerUser,
    createdAt: bot.createdAt,
    totalVotes: bot._count.votes,
    candidates: bot.candidates.map((c) => ({
      id: c.id,
      name: c.name,
      description: c.description,
      photoUrl: c.photoUrl,
      order: c.order,
      votesCount: c._count.votes,
    })),
  });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const result = await requireVotingBot(params.id);
  if ("error" in result) return result.error;
  const { bot } = result;

  try {
    const body = await req.json();
    const data: Record<string, unknown> = {};

    if (typeof body.title === "string" && body.title.trim().length > 0) {
      data.title = body.title.trim();
    }
    if (typeof body.description === "string") {
      data.description = body.description.trim() || null;
    }
    if (typeof body.status === "string" && ["active", "inactive"].includes(body.status)) {
      data.status = body.status;
    }
    if (typeof body.oneVotePerUser === "boolean") {
      data.oneVotePerUser = body.oneVotePerUser;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "O'zgartirish uchun ma'lumot yo'q" }, { status: 400 });
    }

    const updated = await prisma.votingBot.update({
      where: { id: bot.id },
      data,
    });

    if (data.status === "inactive") {
      try {
        const token = decrypt(bot.telegramToken);
        await deleteBotWebhook(token);
      } catch (e) {
        console.error("deleteWebhook on voting bot inactive failed:", e);
      }
    }
    if (data.status === "active") {
      try {
        const token = decrypt(bot.telegramToken);
        const baseUrl = resolvePublicBaseUrl(req);
        if (baseUrl) {
          await setWebhook(token, `${baseUrl}/api/voting-webhook/telegram/${bot.id}`);
        }
      } catch (e) {
        console.error("setWebhook on voting bot active failed:", e);
      }
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Voting bot PATCH error:", error);
    return NextResponse.json(
      { error: error?.message || "Yangilashda xatolik" },
      { status: 500 }
    );
  }
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const result = await requireVotingBot(params.id);
  if ("error" in result) return result.error;
  const { bot } = result;

  try {
    try {
      const token = decrypt(bot.telegramToken);
      await deleteBotWebhook(token);
    } catch (e) {
      console.error("deleteWebhook on voting bot delete failed:", e);
    }

    await prisma.votingBot.delete({ where: { id: bot.id } });
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("Voting bot DELETE error:", error);
    return NextResponse.json(
      { error: error?.message || "O'chirishda xatolik" },
      { status: 500 }
    );
  }
}
