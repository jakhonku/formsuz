import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  sendMessage,
  answerCallbackQuery,
  editMessageReplyMarkup,
  getFile,
} from "@/lib/telegram";
import { getAccessTokenByUserId } from "@/lib/auth-utils";
import {
  appendResponseToSheet,
  writeSheetHeaders,
} from "@/lib/google";
import {
  createGoogleTask,
  listGoogleTasks,
  listDriveFiles,
  uploadFileToDrive,
  sendGmail,
  createCalendarEvent,
  listUpcomingEvents,
  createSpreadsheet,
  createDocFromText,
} from "@/lib/googleServices";
import { decrypt } from "@/lib/crypto";
import {
  parseForm,
  ParsedQuestion,
  formatAnswerForDisplay,
  isAnswerCorrect,
} from "@/lib/formQuestions";
import { runIntegrationsForResponse } from "@/lib/runIntegrations";
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
    const botId = params.botId;
    const body = await req.json();

    const bot = await prisma.bot.findUnique({
      where: { id: botId },
      include: { form: true },
    });
    if (!bot || bot.status !== "active") return NextResponse.json({ ok: true });

    const botToken = decrypt(bot.telegramToken);

    // Workspace botlari uchun alohida logika (FORM emas)
    if (bot.type !== "FORM") {
      await handleWorkspaceBotMessage(body, bot, botToken);
      return NextResponse.json({ ok: true });
    }

    if (!bot.form) return NextResponse.json({ ok: true });

    const parsed = parseForm(bot.form.metadata);
    const questions = parsed.questions;

    // Foydalanuvchi faolligini chat tarixiga yozish (xato bo'lsa ham botni to'xtatmaydi)
    try {
      const chatId = (body.message?.chat?.id || body.callback_query?.message?.chat?.id)?.toString();

      if (chatId) {
        let type = "text";
        let content = body.message?.text || "";
        let fileUrl: string | null = null;

        if (body.callback_query) {
          content = `🔘 Tanladi: ${body.callback_query.data}`;
        } else if (body.message?.photo) {
          type = "image";
          fileUrl = body.message.photo[body.message.photo.length - 1].file_id;
          content = body.message.caption || "";
        } else if (body.message?.voice) {
          type = "voice";
          fileUrl = body.message.voice.file_id;
        } else if (body.message?.document) {
          type = "file";
          fileUrl = body.message.document.file_id;
          content = body.message.caption || body.message.document.file_name || "";
        }

        if (content || type !== "text") {
          await prisma.chatMessage.create({
            data: { botId, chatId, content, type, fileUrl, sender: "user" },
          });
        }
      }
    } catch (e) {
      console.error("Failed to log activity:", e);
    }

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

// =====================================================================
//  WORKSPACE BOT — Telegram orqali Google xizmatlarini boshqarish
// =====================================================================
async function handleWorkspaceBotMessage(body: any, bot: any, botToken: string) {
  const message = body.message || body.callback_query?.message;
  if (!message) return;
  const chatId = message.chat.id.toString();
  const text: string = body.message?.text || "";

  // Bot egasining Google access tokenini olish
  const accessToken = await getAccessTokenByUserId(bot.userId);
  if (!accessToken) {
    await sendMessage(
      botToken,
      chatId,
      "❌ Google akkauntingizga ulanib bo'lmadi.\n\nIltimos, gway.uz dashboard'iga kiring va Google bilan qayta tizimga kiring."
    );
    return;
  }

  // Asosiy menyu (reply keyboard)
  const mainKb = {
    keyboard: [
      [{ text: "📅 Calendar" }, { text: "✅ Tasks" }],
      [{ text: "📁 Drive" }, { text: "❓ Yordam" }],
    ],
    resize_keyboard: true,
  };

  const helpText =
    `🌟 <b>Gway Workspace Bot</b>\n\n` +
    `Quyidagi buyruqlar orqali Google xizmatlarini boshqarishingiz mumkin:\n\n` +
    `📅 <b>Calendar</b>: yaqin oradagi rejalarni ko'rish\n` +
    `   • <code>/event Yig'ilish 14:30</code> — yangi reja qo'shish\n\n` +
    `✅ <b>Tasks</b>: vazifalar ro'yxati\n` +
    `   • Buyruqsiz matn yuborilsa — vazifa qo'shiladi\n\n` +
    `📁 <b>Drive</b>: oxirgi fayllarni ko'rish\n` +
    `   • Fayl/rasm yuborilsa — Drive'ga yuklanadi\n\n` +
    `📊 <b>Sheets</b>: <code>/sheet Nomi</code> — yangi jadval\n` +
    `📝 <b>Docs</b>: <code>/doc Nomi</code> — yangi hujjat\n` +
    `📧 <b>Gmail</b>: <code>/gmail email mavzu matn</code>`;

  // ---- /start va /help ----
  if (text === "/start") {
    const welcome =
      `👋 Salom, ${escapeHtml(message.from?.first_name || "do'st")}!\n\n` +
      `Men sizning shaxsiy Google Workspace yordamchingizman. ` +
      `Bot turi: <b>${escapeHtml(bot.type)}</b>\n\n` +
      `Pastdagi menyudan foydalaning yoki <b>❓ Yordam</b> tugmasini bosing.`;
    await sendMessage(botToken, chatId, welcome, {
      parse_mode: "HTML",
      reply_markup: mainKb,
    });
    return;
  }

  if (text === "/help" || text === "❓ Yordam") {
    await sendMessage(botToken, chatId, helpText, {
      parse_mode: "HTML",
      reply_markup: mainKb,
    });
    return;
  }

  // ---- CALENDAR: ro'yxat ----
  if (text === "📅 Calendar" || text === "/calendar") {
    try {
      const events = await listUpcomingEvents(accessToken, 10);
      if (events.length === 0) {
        await sendMessage(botToken, chatId, "📅 Yaqin orada rejalar yo'q.");
        return;
      }
      let msg = "📅 <b>Yaqin oradagi rejalar:</b>\n\n";
      events.forEach((ev: any, i: number) => {
        const start = ev.start
          ? new Date(ev.start).toLocaleString("uz-UZ", {
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })
          : "—";
        msg += `${i + 1}. <b>${escapeHtml(ev.summary || "Nomsiz")}</b>\n   🕒 ${start}`;
        if (ev.meetLink) msg += `\n   🎥 <a href="${ev.meetLink}">Meet</a>`;
        msg += "\n\n";
      });
      await sendMessage(botToken, chatId, msg, {
        parse_mode: "HTML",
        disable_web_page_preview: true,
      });
    } catch (e: any) {
      console.error("Calendar list error:", e?.message || e);
      await sendMessage(botToken, chatId, "❌ Kalendarni o'qishda xatolik yuz berdi.");
    }
    return;
  }

  // ---- CALENDAR: yangi voqea ----
  if (text.startsWith("/event")) {
    const rest = text.replace("/event", "").trim();
    const parts = rest.split(/\s+/);
    if (parts.length < 2) {
      await sendMessage(
        botToken,
        chatId,
        "📅 Foydalanish: <code>/event Nomi 14:30</code> (1 soat davom etadi)",
        { parse_mode: "HTML" }
      );
      return;
    }
    const timeStr = parts[parts.length - 1];
    const summary = parts.slice(0, -1).join(" ");
    const timeMatch = /^(\d{1,2}):(\d{2})$/.exec(timeStr);
    if (!timeMatch) {
      await sendMessage(botToken, chatId, "❌ Vaqt SS:DD formatida bo'lishi kerak. Misol: 14:30");
      return;
    }
    try {
      const now = new Date();
      const [, hh, mm] = timeMatch;
      const start = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate(),
        Number(hh),
        Number(mm)
      );
      // Agar belgilangan vaqt allaqachon o'tgan bo'lsa — ertaga qo'yamiz
      if (start.getTime() < now.getTime()) start.setDate(start.getDate() + 1);
      const end = new Date(start.getTime() + 60 * 60 * 1000);

      const ev = await createCalendarEvent(accessToken, {
        summary,
        startISO: start.toISOString(),
        endISO: end.toISOString(),
      });
      await sendMessage(
        botToken,
        chatId,
        `✅ Reja qo'shildi!\n\n<b>${escapeHtml(summary)}</b>\n🕒 ${start.toLocaleString("uz-UZ")}` +
          (ev.htmlLink ? `\n🔗 <a href="${ev.htmlLink}">Ochish</a>` : ""),
        { parse_mode: "HTML", disable_web_page_preview: true }
      );
    } catch (e: any) {
      console.error("Calendar create error:", e?.message || e);
      await sendMessage(botToken, chatId, "❌ Rejani qo'shishda xatolik.");
    }
    return;
  }

  // ---- TASKS: ro'yxat ----
  if (text === "✅ Tasks" || text === "/tasks") {
    try {
      const tasks = await listGoogleTasks(accessToken, 20);
      if (tasks.length === 0) {
        await sendMessage(
          botToken,
          chatId,
          "✅ Vazifalar ro'yxati bo'sh.\n\nYangi vazifa qo'shish uchun shunchaki matn yuboring."
        );
        return;
      }
      let msg = "✅ <b>Vazifalar:</b>\n\n";
      tasks.forEach((t: any, i: number) => {
        const done = t.status === "completed";
        const title = escapeHtml(t.title || "Nomsiz");
        msg += done ? `${i + 1}. <s>${title}</s>\n` : `${i + 1}. ${title}\n`;
      });
      await sendMessage(botToken, chatId, msg, { parse_mode: "HTML" });
    } catch (e: any) {
      console.error("Tasks list error:", e?.message || e);
      await sendMessage(botToken, chatId, "❌ Vazifalarni o'qishda xatolik.");
    }
    return;
  }

  // ---- DRIVE: ro'yxat ----
  if (text === "📁 Drive" || text === "/drive") {
    try {
      const files = await listDriveFiles(accessToken, 15);
      if (!files || files.length === 0) {
        await sendMessage(botToken, chatId, "📁 Drive'da fayllar topilmadi.");
        return;
      }
      let msg = "📁 <b>Oxirgi fayllar:</b>\n\n";
      files.forEach((f: any, i: number) => {
        msg += `${i + 1}. <a href="${f.webViewLink}">${escapeHtml(f.name)}</a>\n`;
      });
      await sendMessage(botToken, chatId, msg, {
        parse_mode: "HTML",
        disable_web_page_preview: true,
      });
    } catch (e: any) {
      console.error("Drive list error:", e?.message || e);
      await sendMessage(botToken, chatId, "❌ Drive'ni o'qishda xatolik.");
    }
    return;
  }

  // ---- SHEETS ----
  if (text.startsWith("/sheet")) {
    const title =
      text.replace("/sheet", "").trim() ||
      `Yangi jadval (${new Date().toLocaleDateString("uz-UZ")})`;
    try {
      const res = await createSpreadsheet(accessToken, title);
      await sendMessage(
        botToken,
        chatId,
        `✅ Jadval yaratildi!\n\n📊 <b>${escapeHtml(title)}</b>\n🔗 <a href="${res.url}">Ochish</a>`,
        { parse_mode: "HTML", disable_web_page_preview: true }
      );
    } catch (e: any) {
      console.error("Sheet create error:", e?.message || e);
      await sendMessage(botToken, chatId, "❌ Jadval yaratishda xatolik.");
    }
    return;
  }

  // ---- DOCS ----
  if (text.startsWith("/doc")) {
    const title =
      text.replace("/doc", "").trim() ||
      `Yangi hujjat (${new Date().toLocaleDateString("uz-UZ")})`;
    try {
      const res = await createDocFromText(accessToken, title, "");
      await sendMessage(
        botToken,
        chatId,
        `✅ Hujjat yaratildi!\n\n📝 <b>${escapeHtml(title)}</b>\n🔗 <a href="${res.url}">Ochish</a>`,
        { parse_mode: "HTML", disable_web_page_preview: true }
      );
    } catch (e: any) {
      console.error("Doc create error:", e?.message || e);
      await sendMessage(botToken, chatId, "❌ Hujjat yaratishda xatolik.");
    }
    return;
  }

  // ---- GMAIL ----
  if (text.startsWith("/gmail")) {
    const rest = text.replace("/gmail", "").trim();
    const parts = rest.split(/\s+/);
    if (parts.length < 3) {
      await sendMessage(
        botToken,
        chatId,
        "📧 Foydalanish: <code>/gmail email@misol.uz Mavzu Xabar matni</code>",
        { parse_mode: "HTML" }
      );
      return;
    }
    const to = parts[0];
    const subject = parts[1];
    const body = parts.slice(2).join(" ");
    try {
      await sendGmail(accessToken, { to, subject, text: body });
      await sendMessage(botToken, chatId, `✅ Email yuborildi: <b>${escapeHtml(to)}</b>`, {
        parse_mode: "HTML",
      });
    } catch (e: any) {
      console.error("Gmail send error:", e?.message || e);
      await sendMessage(botToken, chatId, "❌ Email yuborishda xatolik.");
    }
    return;
  }

  // ---- FAYL yuborilganda — Drive'ga yuklash ----
  const document =
    message.document ||
    (message.photo ? message.photo[message.photo.length - 1] : null) ||
    message.video;
  if (document) {
    try {
      await sendMessage(botToken, chatId, "⏳ Fayl Drive'ga yuklanmoqda...");
      const file = await getFile(botToken, document.file_id);
      if (!file) throw new Error("File download failed");

      const workspaceConfig = (bot.workspaceConfig as any) || {};
      const folderId =
        workspaceConfig.folderId && workspaceConfig.folderId !== "root"
          ? workspaceConfig.folderId
          : undefined;

      const upload = await uploadFileToDrive(accessToken, {
        name: document.file_name || file.fileName || `tg_${Date.now()}`,
        mimeType: document.mime_type || file.mimeType || "application/octet-stream",
        data: file.buffer,
        folderId,
      });

      await sendMessage(
        botToken,
        chatId,
        `✅ Fayl yuklandi!\n\n📁 <b>${escapeHtml(upload.name || "")}</b>\n🔗 <a href="${upload.webViewLink}">Ochish</a>`,
        { parse_mode: "HTML", disable_web_page_preview: true }
      );
    } catch (error: any) {
      console.error("Drive upload error:", error?.message || error);
      await sendMessage(botToken, chatId, "❌ Faylni yuklashda xatolik.");
    }
    return;
  }

  // ---- Fallback: oddiy matn → vazifa qo'shish ----
  if (text && !text.startsWith("/")) {
    try {
      await createGoogleTask(accessToken, { title: text });
      await sendMessage(
        botToken,
        chatId,
        `✅ Vazifa qo'shildi: <b>${escapeHtml(text)}</b>`,
        { parse_mode: "HTML" }
      );
    } catch (e: any) {
      console.error("Task create error:", e?.message || e);
      await sendMessage(botToken, chatId, "❌ Vazifa qo'shishda xatolik.");
    }
    return;
  }

  // Boshqa hech narsa mos kelmasa — yordam menyusini ko'rsatamiz
  await sendMessage(botToken, chatId, "Tushunmadim. Menyudan foydalaning yoki /help yozing.", {
    reply_markup: mainKb,
  });
}

// =====================================================================
//  FORM BOT
// =====================================================================
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
    return;
  }

  const currentIndex = response.lastQuestionIndex;
  if (currentIndex < 0 || currentIndex >= questions.length) {
    await sendMessage(botToken, chatId, "Xatolik: savol topilmadi. /start qayta boshlang.");
    return;
  }

  const question = questions[currentIndex];

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

  if (question.type === "fileUpload") {
    const file = message.document || message.photo?.[message.photo.length - 1] || message.video;
    if (!file) {
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

    // Foydalanuvchiga javobni qaytarmasdan, fonda Sheets va integratsiyalarni ishga tushiramiz.
    // Bu webhook javob vaqtini tezlashtirish uchun ahamiyatli — Telegram 10s ichida 200 kutadi.
    void runPostCompletion(bot, response, questions, nextData, chatId);
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

async function runPostCompletion(
  bot: any,
  response: any,
  questions: ParsedQuestion[],
  nextData: ResponseData,
  chatId: string
) {
  // 1) Google Sheets — har bir javobni jadval qatori sifatida yozamiz
  try {
    const accessToken = await getAccessTokenByUserId(bot.userId);
    if (accessToken) {
      let spreadsheetId = bot.form.linkedSheetId;
      if (!spreadsheetId) {
        const created = await createSpreadsheet(accessToken, bot.form.title);
        if (created?.id) {
          spreadsheetId = created.id;
          await prisma.form.update({
            where: { id: bot.form.id },
            data: { linkedSheetId: created.id },
          });
          await writeSheetHeaders(accessToken, created.id, [
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

  // 2) Bot uchun yoqilgan integratsiyalar (Calendar/Docs/Slides/Drive/Gmail/Meet/Tasks)
  try {
    const ownerEmail = await prisma.user
      .findUnique({ where: { id: bot.userId }, select: { email: true } })
      .then((u) => u?.email || null);
    const { _state: _omit, ...cleanAnswers } = nextData as ResponseData;
    await runIntegrationsForResponse({
      botId: bot.id,
      userId: bot.userId,
      responseId: response.id,
      formTitle: bot.form.title,
      chatId,
      questions,
      answers: cleanAnswers,
      ownerEmail,
    });
  } catch (integErr: any) {
    console.error("Integrations run failed:", integErr?.message || integErr);
  }
}

function escapeHtml(s: string) {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
