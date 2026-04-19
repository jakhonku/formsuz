import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { encrypt } from "@/lib/crypto";
import { setWebhook, verifyBotToken } from "@/lib/telegram";
import { getPlanLimit } from "@/lib/plans";

const ALLOWED_PLANS = ["PRO", "BUSINESS", "GWAY"];

function resolvePublicBaseUrl(req: Request) {
  const envUrl = process.env.NEXTAUTH_URL;
  if (envUrl) return envUrl.replace(/\/$/, "");
  const host = req.headers.get("host");
  const proto = req.headers.get("x-forwarded-proto") || "https";
  if (host) return `${proto}://${host}`;
  return "";
}

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const bots = await prisma.votingBot.findMany({
    where: { userId: session.user.id },
    include: {
      _count: { select: { candidates: true, votes: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    bots.map((b) => ({
      id: b.id,
      name: b.name,
      title: b.title,
      description: b.description,
      telegramBotUsername: b.telegramBotUsername,
      status: b.status,
      createdAt: b.createdAt,
      candidatesCount: b._count.candidates,
      votesCount: b._count.votes,
    }))
  );
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { plan: true, planExpiresAt: true },
    });

    const userPlan = user?.plan || "FREE";
    if (!ALLOWED_PLANS.includes(userPlan)) {
      return NextResponse.json(
        {
          error:
            "Ovoz toplash boti faqat Professional va undan yuqori tariflarda mavjud. Iltimos, tarifingizni yangilang.",
        },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { title, description, botToken } = body || {};

    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json(
        { error: "Konkurs nomini kiriting" },
        { status: 400 }
      );
    }

    if (!botToken || typeof botToken !== "string") {
      return NextResponse.json(
        { error: "Telegram Bot tokenini kiriting" },
        { status: 400 }
      );
    }

    const trimmedToken = botToken.trim();
    const botInfo = await verifyBotToken(trimmedToken);
    if (!botInfo) {
      return NextResponse.json(
        { error: "Bot token noto'g'ri. Qaytadan tekshiring." },
        { status: 400 }
      );
    }

    const existingBot = await prisma.bot.findFirst({
      where: { telegramBotUsername: botInfo.username, userId: session.user.id },
    });
    const existingVotingBot = await prisma.votingBot.findFirst({
      where: { telegramBotUsername: botInfo.username, userId: session.user.id },
    });
    if (existingBot || existingVotingBot) {
      return NextResponse.json(
        { error: `Bu bot (@${botInfo.username}) allaqachon ulangan` },
        { status: 409 }
      );
    }

    const created = await prisma.votingBot.create({
      data: {
        name: botInfo.first_name || botInfo.username,
        title: title.trim(),
        description: description?.trim() || null,
        telegramToken: encrypt(trimmedToken),
        telegramBotUsername: botInfo.username,
        status: "active",
        userId: session.user.id,
      },
    });

    const baseUrl = resolvePublicBaseUrl(req);
    if (baseUrl) {
      const webhookUrl = `${baseUrl}/api/voting-webhook/telegram/${created.id}`;
      const result = await setWebhook(trimmedToken, webhookUrl);
      if (!result?.ok) {
        console.warn("Voting webhook set failed:", result);
      }
    }

    return NextResponse.json({
      id: created.id,
      username: created.telegramBotUsername,
    });
  } catch (error: any) {
    console.error("Create voting bot error:", error);
    return NextResponse.json(
      { error: error?.message || "Botni yaratishda xatolik" },
      { status: 500 }
    );
  }
}
