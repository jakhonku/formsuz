import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  sendMessage,
  answerCallbackQuery,
  editMessageReplyMarkup,
} from "@/lib/telegram";
import { decrypt } from "@/lib/crypto";

const CB_VOTE = "v:";
const CB_CANDIDATE = "c:";

function escapeHtml(s: string) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function buildCandidatesKeyboard(candidates: { id: string; name: string }[]) {
  return {
    inline_keyboard: candidates.map((c) => [
      { text: c.name, callback_data: `${CB_CANDIDATE}${c.id}` },
    ]),
  };
}

function buildConfirmKeyboard(candidateId: string) {
  return {
    inline_keyboard: [
      [{ text: "✅ Ha, ovoz beraman", callback_data: `${CB_VOTE}${candidateId}` }],
      [{ text: "🔙 Orqaga", callback_data: "back" }],
    ],
  };
}

export async function POST(req: Request, { params }: { params: { botId: string } }) {
  try {
    const body = await req.json();
    const botId = params.botId;

    const bot = await prisma.votingBot.findUnique({
      where: { id: botId },
      include: {
        candidates: {
          orderBy: [{ order: "asc" }, { createdAt: "asc" }],
        },
      },
    });

    if (!bot || bot.status !== "active") {
      return NextResponse.json({ ok: true });
    }

    const token = decrypt(bot.telegramToken);

    if (body.callback_query) {
      await handleCallback({ bot, token, callback: body.callback_query });
      return NextResponse.json({ ok: true });
    }

    if (body.message) {
      await handleMessage({ bot, token, message: body.message });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Voting webhook error:", error);
    return NextResponse.json({ ok: true });
  }
}

async function handleMessage({
  bot,
  token,
  message,
}: {
  bot: any;
  token: string;
  message: any;
}) {
  const chatId = message.chat.id.toString();
  const text: string = typeof message.text === "string" ? message.text : "";

  if (text === "/start" || text === "/vote" || text === "/help") {
    await sendWelcome(bot, token, chatId);
    return;
  }

  if (text === "/results") {
    await sendResults(bot, token, chatId);
    return;
  }

  await sendMessage(
    token,
    chatId,
    "Ovoz berish uchun /start buyrug'ini yuboring.\nNatijalarni ko'rish uchun /results."
  );
}

async function sendWelcome(bot: any, token: string, chatId: string) {
  if (!bot.candidates || bot.candidates.length === 0) {
    await sendMessage(
      token,
      chatId,
      "Hozircha bu konkursda nomzodlar qo'shilmagan. Iltimos, keyinroq urinib ko'ring."
    );
    return;
  }

  const header =
    `🗳 <b>${escapeHtml(bot.title)}</b>` +
    (bot.description ? `\n\n${escapeHtml(bot.description)}` : "") +
    `\n\n<b>Nomzodni tanlang:</b>`;

  await sendMessage(token, chatId, header, {
    parse_mode: "HTML",
    reply_markup: buildCandidatesKeyboard(bot.candidates),
  });
}

async function sendResults(bot: any, token: string, chatId: string) {
  const candidates = await prisma.candidate.findMany({
    where: { votingBotId: bot.id },
    include: { _count: { select: { votes: true } } },
    orderBy: [{ order: "asc" }, { createdAt: "asc" }],
  });

  if (candidates.length === 0) {
    await sendMessage(token, chatId, "Nomzodlar hali yo'q.");
    return;
  }

  const total = candidates.reduce((sum, c) => sum + c._count.votes, 0);
  const sorted = [...candidates].sort((a, b) => b._count.votes - a._count.votes);

  const lines = sorted.map((c, idx) => {
    const pct = total > 0 ? ((c._count.votes / total) * 100).toFixed(1) : "0.0";
    const medal = idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : "•";
    return `${medal} <b>${escapeHtml(c.name)}</b> — ${c._count.votes} ta ovoz (${pct}%)`;
  });

  const text =
    `📊 <b>${escapeHtml(bot.title)} — Natijalar</b>\n\n` +
    lines.join("\n") +
    `\n\nJami ovozlar: <b>${total}</b>`;

  await sendMessage(token, chatId, text, { parse_mode: "HTML" });
}

async function handleCallback({
  bot,
  token,
  callback,
}: {
  bot: any;
  token: string;
  callback: any;
}) {
  const chatId = callback.message?.chat?.id?.toString();
  const messageId = callback.message?.message_id;
  const data: string = callback.data || "";
  const from = callback.from || {};

  if (!chatId) {
    await answerCallbackQuery(token, callback.id);
    return;
  }

  if (data === "back") {
    await answerCallbackQuery(token, callback.id);
    if (messageId) {
      await editMessageReplyMarkup(token, chatId, messageId, {
        inline_keyboard: bot.candidates.map((c: any) => [
          { text: c.name, callback_data: `${CB_CANDIDATE}${c.id}` },
        ]),
      });
    }
    return;
  }

  if (data.startsWith(CB_CANDIDATE)) {
    const candidateId = data.slice(CB_CANDIDATE.length);
    const candidate = bot.candidates.find((c: any) => c.id === candidateId);
    if (!candidate) {
      await answerCallbackQuery(token, callback.id, "Nomzod topilmadi");
      return;
    }

    const existing = bot.oneVotePerUser
      ? await prisma.vote.findUnique({
          where: { votingBotId_chatId: { votingBotId: bot.id, chatId } },
        })
      : null;

    if (existing) {
      const alreadyVoted = bot.candidates.find((c: any) => c.id === existing.candidateId);
      await answerCallbackQuery(
        token,
        callback.id,
        `Siz allaqachon ovoz berdingiz: ${alreadyVoted?.name || ""}`
      );
      return;
    }

    const preview =
      `🗳 <b>Ovoz berish tasdiqi</b>\n\n` +
      `Nomzod: <b>${escapeHtml(candidate.name)}</b>` +
      (candidate.description ? `\n\n${escapeHtml(candidate.description)}` : "") +
      `\n\nIltimos, tanlovingizni tasdiqlang. Bir marta ovoz berilgandan so'ng o'zgartirib bo'lmaydi.`;

    await answerCallbackQuery(token, callback.id);
    if (messageId) {
      try {
        await fetch(`https://api.telegram.org/bot${token}/editMessageText`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            chat_id: chatId,
            message_id: messageId,
            text: preview,
            parse_mode: "HTML",
            reply_markup: buildConfirmKeyboard(candidate.id),
          }),
        });
      } catch (e) {
        await sendMessage(token, chatId, preview, {
          parse_mode: "HTML",
          reply_markup: buildConfirmKeyboard(candidate.id),
        });
      }
    } else {
      await sendMessage(token, chatId, preview, {
        parse_mode: "HTML",
        reply_markup: buildConfirmKeyboard(candidate.id),
      });
    }
    return;
  }

  if (data.startsWith(CB_VOTE)) {
    const candidateId = data.slice(CB_VOTE.length);
    const candidate = bot.candidates.find((c: any) => c.id === candidateId);
    if (!candidate) {
      await answerCallbackQuery(token, callback.id, "Nomzod topilmadi");
      return;
    }

    if (bot.oneVotePerUser) {
      const existing = await prisma.vote.findUnique({
        where: { votingBotId_chatId: { votingBotId: bot.id, chatId } },
      });
      if (existing) {
        const alreadyVoted = bot.candidates.find((c: any) => c.id === existing.candidateId);
        await answerCallbackQuery(
          token,
          callback.id,
          `Siz allaqachon ovoz berdingiz: ${alreadyVoted?.name || ""}`
        );
        if (messageId) {
          await editMessageReplyMarkup(token, chatId, messageId, { inline_keyboard: [] });
        }
        return;
      }
    }

    try {
      await prisma.vote.create({
        data: {
          votingBotId: bot.id,
          candidateId: candidate.id,
          chatId,
          voterName:
            [from.first_name, from.last_name].filter(Boolean).join(" ") || null,
          voterUsername: from.username || null,
        },
      });
    } catch (e: any) {
      if (e?.code === "P2002") {
        await answerCallbackQuery(token, callback.id, "Siz allaqachon ovoz berdingiz");
        return;
      }
      throw e;
    }

    await answerCallbackQuery(token, callback.id, "✅ Ovozingiz qabul qilindi!");
    if (messageId) {
      await editMessageReplyMarkup(token, chatId, messageId, { inline_keyboard: [] });
    }

    const successText =
      `🎉 <b>Rahmat!</b>\n\n` +
      `Siz <b>${escapeHtml(candidate.name)}</b> uchun ovoz berdingiz.\n\n` +
      `Joriy natijalarni ko'rish uchun /results.`;
    await sendMessage(token, chatId, successText, { parse_mode: "HTML" });
    return;
  }

  await answerCallbackQuery(token, callback.id);
}
