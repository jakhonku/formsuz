import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  sendMessage,
  answerCallbackQuery,
  editMessageReplyMarkup,
} from "@/lib/telegram";
import { getAccessTokenByUserId } from "@/lib/auth-utils";
import {
  appendResponseToSheet,
  createSpreadsheet,
  writeSheetHeaders,
} from "@/lib/google";
import { decrypt } from "@/lib/crypto";
import {
  parseForm,
  ParsedQuestion,
  formatAnswerForDisplay,
  isAnswerCorrect,
} from "@/lib/formQuestions";
import {
  sendQuestion,
  CB_PICK,
  CB_CHK_TOGGLE,
  CB_CHK_DONE,
  CB_SKIP,
  validateDate,
  validateTime,
  buildReplyMarkup,
} from "@/lib/botFlow";

type ResponseData = Record<string, unknown> & {
  _state?: { checkbox?: string[] };
};

export async function POST(req: Request, { params }: { params: { botId: string } }) {
  try {
    const { botId } = params;
    const body = await req.json();

    const bot = await prisma.bot.findUnique({
      where: { id: botId },
      include: { form: true },
    });
    if (!bot || bot.status !== "active") return NextResponse.json({ ok: true });

    const botToken = decrypt(bot.telegramToken);
    const parsed = parseForm(bot.form.metadata);
    const questions = parsed.questions;

    if (body.callback_query) {
      await handleCallback({
        botToken,
        botId,
        bot,
        parsed,
        questions,
        callback: body.callback_query,
      });
      return NextResponse.json({ ok: true });
    }

    if (!body.message) return NextResponse.json({ ok: true });

    // Save user message to chat history
    try {
      const msg = body.message;
      const chatId = msg.chat.id.toString();
      let type = "text";
      let content = msg.text || "";
      let fileUrl = null;

      if (msg.photo) {
        type = "image";
        fileUrl = msg.photo[msg.photo.length - 1].file_id;
        content = msg.caption || "";
      } else if (msg.voice) {
        type = "voice";
        fileUrl = msg.voice.file_id;
      } else if (msg.document) {
        type = "file";
        fileUrl = msg.document.file_id;
        content = msg.caption || msg.document.file_name || "";
      }

      // Log all user messages to history
      await prisma.chatMessage.create({
        data: {
          botId,
          chatId,
          content,
          type,
          fileUrl,
          sender: "user",
        },
      });
    } catch (e) {
      console.error("Failed to log chat message:", e);
    }

    await handleMessage({
      botToken,
      botId,
      bot,
      parsed,
      questions,
      message: body.message,
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ ok: true });
  }
}

async function getOrCreateInProgress(botId: string, chatId: string) {
  return prisma.response.findFirst({
    where: { botId, chatId, status: "in_progress" },
    orderBy: { createdAt: "desc" },
  });
}

async function handleMessage(ctx: {
  botToken: string;
  botId: string;
  bot: any;
  parsed: ReturnType<typeof parseForm>;
  questions: ParsedQuestion[];
  message: any;
}) {
  const { botToken, botId, bot, parsed, questions, message } = ctx;
  const chatId = message.chat.id.toString();
  const text: string = typeof message.text === "string" ? message.text : "";

  if (questions.length === 0) {
    await sendMessage(
      botToken,
      chatId,
      "Bu formada hali savollar yo'q. Iltimos, forma muallifi bilan bog'laning."
    );
    return;
  }

  let response = await getOrCreateInProgress(botId, chatId);

  if (text === "/start") {
    if (response) {
      await prisma.response.delete({ where: { id: response.id } });
    }
    response = await prisma.response.create({
      data: {
        botId,
        chatId,
        status: "in_progress",
        lastQuestionIndex: 0,
        data: {},
      },
    });

    const intro =
      `Salom! <b>${escapeHtml(bot.form.title)}</b> so'rovnomasini boshlaymiz.\n` +
      `Jami savollar: <b>${questions.length}</b>` +
      (parsed.isQuiz ? "\n🧪 <b>Test rejimi</b>: natijalar oxirida ko'rsatiladi." : "");
    await sendMessage(botToken, chatId, intro, { parse_mode: "HTML" });
    await sendQuestion(botToken, chatId, questions[0], 0, questions.length);
    return;
  }

  if (text === "/cancel") {
    if (response) {
      await prisma.response.delete({ where: { id: response.id } });
    }
    await sendMessage(botToken, chatId, "So'rovnoma bekor qilindi. Qayta boshlash uchun /start.");
    return;
  }

  if (text === "/help") {
    await sendMessage(
      botToken,
      chatId,
      "ℹ️ Buyruqlar:\n/start — boshlash\n/cancel — bekor qilish\n/help — yordam"
    );
    return;
  }

  if (!response) {
    // If no active form response, don't spam the "send /start" message
    // This allows for free chat with the admin
    return;
  }

  const currentIndex = response.lastQuestionIndex;
  if (currentIndex < 0 || currentIndex >= questions.length) {
    await sendMessage(botToken, chatId, "Xatolik: savol topilmadi. /start qayta boshlang.");
    return;
  }

  const question = questions[currentIndex];

  // Message-based answers only apply to certain types
  if (
    question.type === "radio" ||
    question.type === "dropdown" ||
    question.type === "checkbox" ||
    question.type === "scale"
  ) {
    await sendMessage(
      botToken,
      chatId,
      "Iltimos, yuqoridagi tugmalardan birini tanlang."
    );
    return;
  }

  // file upload
  if (question.type === "fileUpload") {
    const file = message.document || message.photo?.[message.photo.length - 1] || message.video;
    if (!file) {
      if (text && !question.required) {
        // allow skipping via text "skip"? No — force button or file
      }
      await sendMessage(
        botToken,
        chatId,
        "Iltimos, fayl (hujjat, rasm yoki video) biriktiring."
      );
      return;
    }
    const fileId = file.file_id || file.file_unique_id || "file";
    await advance(ctx, response, question, fileId);
    return;
  }

  // text-like answer
  if (!text) {
    await sendMessage(botToken, chatId, "Iltimos, matn ko'rinishida javob yuboring.");
    return;
  }

  if (question.type === "date") {
    const result = validateDate(question, text);
    if (!result.ok) {
      await sendMessage(botToken, chatId, `⚠️ ${result.error}`);
      return;
    }
    await advance(ctx, response, question, result.value);
    return;
  }

  if (question.type === "time") {
    const result = validateTime(question, text);
    if (!result.ok) {
      await sendMessage(botToken, chatId, `⚠️ ${result.error}`);
      return;
    }
    await advance(ctx, response, question, result.value);
    return;
  }

  // short / paragraph / unknown
  await advance(ctx, response, question, text.trim());
}

async function handleCallback(ctx: {
  botToken: string;
  botId: string;
  bot: any;
  parsed: ReturnType<typeof parseForm>;
  questions: ParsedQuestion[];
  callback: any;
}) {
  const { botToken, botId, questions, callback } = ctx;
  const chatId = callback.message?.chat?.id?.toString();
  const messageId = callback.message?.message_id;
  const dataStr: string = callback.data || "";

  if (!chatId) {
    await answerCallbackQuery(botToken, callback.id);
    return;
  }

  const response = await getOrCreateInProgress(botId, chatId);
  if (!response) {
    await answerCallbackQuery(botToken, callback.id, "Iltimos, /start bilan boshlang.");
    return;
  }

  const index = response.lastQuestionIndex;
  if (index < 0 || index >= questions.length) {
    await answerCallbackQuery(botToken, callback.id);
    return;
  }
  const question = questions[index];
  const respData = (response.data as ResponseData) || {};

  if (dataStr === CB_SKIP) {
    if (question.required) {
      await answerCallbackQuery(botToken, callback.id, "Bu savol majburiy.");
      return;
    }
    await answerCallbackQuery(botToken, callback.id, "O'tkazib yuborildi");
    if (messageId) await editMessageReplyMarkup(botToken, chatId, messageId, { inline_keyboard: [] });
    await advance(ctx, response, question, "");
    return;
  }

  if (dataStr.startsWith(CB_PICK)) {
    const raw = dataStr.slice(CB_PICK.length);
    if (question.type === "scale") {
      const n = parseInt(raw, 10);
      if (isNaN(n)) {
        await answerCallbackQuery(botToken, callback.id);
        return;
      }
      await answerCallbackQuery(botToken, callback.id, `✓ ${n}`);
      if (messageId) await editMessageReplyMarkup(botToken, chatId, messageId, { inline_keyboard: [] });
      await advance(ctx, response, question, String(n));
      return;
    }
    if (question.type === "radio" || question.type === "dropdown") {
      const idx = parseInt(raw, 10);
      const option = question.options?.[idx];
      if (!option) {
        await answerCallbackQuery(botToken, callback.id);
        return;
      }
      await answerCallbackQuery(botToken, callback.id, `✓ ${option.value}`);
      if (messageId) await editMessageReplyMarkup(botToken, chatId, messageId, { inline_keyboard: [] });
      await advance(ctx, response, question, option.value);
      return;
    }
  }

  if (dataStr.startsWith(CB_CHK_TOGGLE) && question.type === "checkbox") {
    const idx = parseInt(dataStr.slice(CB_CHK_TOGGLE.length), 10);
    const option = question.options?.[idx];
    if (!option) {
      await answerCallbackQuery(botToken, callback.id);
      return;
    }
    const current = Array.isArray(respData._state?.checkbox) ? [...respData._state!.checkbox!] : [];
    const pos = current.indexOf(option.value);
    if (pos >= 0) current.splice(pos, 1);
    else current.push(option.value);

    const nextData: ResponseData = {
      ...respData,
      _state: { ...(respData._state || {}), checkbox: current },
    };
    await prisma.response.update({
      where: { id: response.id },
      data: { data: nextData as any },
    });

    await answerCallbackQuery(botToken, callback.id, pos >= 0 ? "Olib tashlandi" : "Belgilandi");
    if (messageId) {
      const markup = buildReplyMarkup(question, current);
      await editMessageReplyMarkup(botToken, chatId, messageId, markup);
    }
    return;
  }

  if (dataStr === CB_CHK_DONE && question.type === "checkbox") {
    const current = Array.isArray(respData._state?.checkbox) ? respData._state!.checkbox! : [];
    if (question.required && current.length === 0) {
      await answerCallbackQuery(botToken, callback.id, "Kamida bitta variantni tanlang.");
      return;
    }
    await answerCallbackQuery(botToken, callback.id, "Qabul qilindi");
    if (messageId) await editMessageReplyMarkup(botToken, chatId, messageId, { inline_keyboard: [] });
    await advance(ctx, response, question, current);
    return;
  }

  await answerCallbackQuery(botToken, callback.id);
}

async function advance(
  ctx: {
    botToken: string;
    botId: string;
    bot: any;
    parsed: ReturnType<typeof parseForm>;
    questions: ParsedQuestion[];
  },
  response: any,
  question: ParsedQuestion,
  answer: string | string[]
) {
  const { botToken, bot, parsed, questions } = ctx;
  const chatId: string = response.chatId;

  const prev = (response.data as ResponseData) || {};
  const { _state, ...restPrev } = prev;

  const nextData: ResponseData = {
    ...restPrev,
    [question.questionId]: answer,
  };

  // Quiz feedback for this question
  if (parsed.isQuiz && question.correctAnswers && question.correctAnswers.length > 0) {
    const correct = isAnswerCorrect(question, answer);
    const note = correct
      ? `✅ To'g'ri${question.whenRight ? `\n${escapeHtml(question.whenRight)}` : ""}`
      : `❌ Noto'g'ri${
          question.whenWrong ? `\n${escapeHtml(question.whenWrong)}` : ""
        }\nTo'g'ri javob: <b>${escapeHtml(question.correctAnswers.join(", "))}</b>`;
    const feedback = question.generalFeedback ? `\n${escapeHtml(question.generalFeedback)}` : "";
    await sendMessage(botToken, chatId, `${note}${feedback}`, { parse_mode: "HTML" });
  }

  const nextIndex = response.lastQuestionIndex + 1;

  if (nextIndex >= questions.length) {
    await prisma.response.update({
      where: { id: response.id },
      data: {
        data: nextData as any,
        status: "completed",
        lastQuestionIndex: nextIndex,
      },
    });

    let finalMsg = "🎉 Rahmat! Javoblaringiz qabul qilindi.";

    if (parsed.isQuiz) {
      const scored = questions.filter(
        (q) => q.correctAnswers && q.correctAnswers.length > 0
      );
      let total = 0;
      let gained = 0;
      for (const q of scored) {
        const pts = q.points ?? 1;
        total += pts;
        if (isAnswerCorrect(q, nextData[q.questionId])) gained += pts;
      }
      finalMsg += `\n\n🧪 <b>Test natijasi:</b> ${gained} / ${total}`;
    }

    await sendMessage(botToken, chatId, finalMsg, { parse_mode: "HTML" });

    // Write to Google Sheets
    try {
      const accessToken = await getAccessTokenByUserId(bot.userId);
      if (accessToken) {
        let spreadsheetId = bot.form.linkedSheetId;
        if (!spreadsheetId) {
          const newSheetId = await createSpreadsheet(accessToken, bot.form.title);
          if (newSheetId) {
            spreadsheetId = newSheetId;
            await prisma.form.update({
              where: { id: bot.form.id },
              data: { linkedSheetId: newSheetId },
            });
            await writeSheetHeaders(accessToken, newSheetId, [
              "Sana",
              "User ID",
              ...questions.map((q) => q.title),
            ]);
          }
        }

        if (spreadsheetId) {
          const row = [
            new Date().toLocaleString("uz-UZ"),
            chatId,
            ...questions.map((q) => formatAnswerForDisplay(nextData[q.questionId])),
          ];
          await appendResponseToSheet(accessToken, spreadsheetId, row);
        }
      }
    } catch (sheetError: any) {
      console.error("Google Sheets writing error:", sheetError?.message || sheetError);
    }
    return;
  }

  await prisma.response.update({
    where: { id: response.id },
    data: {
      data: nextData as any,
      lastQuestionIndex: nextIndex,
    },
  });

  await sendQuestion(botToken, chatId, questions[nextIndex], nextIndex, questions.length);
}

function escapeHtml(s: string) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
