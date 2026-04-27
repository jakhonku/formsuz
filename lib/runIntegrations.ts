import { prisma } from "./prisma";
import { getAccessTokenByUserId } from "./auth-utils";
import {
  createCalendarEvent,
  createDocFromText,
  createSlidesPresentation,
  uploadFileToDrive,
  sendGmail,
  createMeetLink,
  createGoogleTask,
} from "./googleServices";
import { ParsedQuestion, formatAnswerForDisplay } from "./formQuestions";

export type BotIntegrationsConfig = {
  calendar?: { enabled?: boolean };
  docs?: { enabled?: boolean };
  slides?: { enabled?: boolean };
  drive?: { enabled?: boolean };
  gmail?: { enabled?: boolean; to?: string };
  meet?: { enabled?: boolean };
  tasks?: { enabled?: boolean };
};

const SERVICES = ["calendar", "docs", "slides", "drive", "gmail", "meet", "tasks"] as const;
export type Service = (typeof SERVICES)[number];

type Ctx = {
  botId: string;
  userId: string;
  responseId: string;
  formTitle: string;
  chatId: string;
  questions: ParsedQuestion[];
  answers: Record<string, unknown>;
  ownerEmail?: string | null;
};

function buildPlainSummary(ctx: Ctx) {
  const lines: string[] = [];
  lines.push(`Forma: ${ctx.formTitle}`);
  lines.push(`Telegram chat ID: ${ctx.chatId}`);
  lines.push(`Sana: ${new Date().toLocaleString("uz-UZ")}`);
  lines.push("");
  for (const q of ctx.questions) {
    const a = formatAnswerForDisplay(ctx.answers[q.questionId]);
    lines.push(`• ${q.title}: ${a || "—"}`);
  }
  return lines.join("\n");
}

function buildHtmlSummary(ctx: Ctx) {
  const rows = ctx.questions
    .map((q) => {
      const a = formatAnswerForDisplay(ctx.answers[q.questionId]);
      const safeQ = (q.title || "").replace(/</g, "&lt;");
      const safeA = (a || "—").replace(/</g, "&lt;");
      return `<tr><td style="padding:8px;border:1px solid #e5e7eb;font-weight:600">${safeQ}</td><td style="padding:8px;border:1px solid #e5e7eb">${safeA}</td></tr>`;
    })
    .join("");
  return `
    <div style="font-family:system-ui,Arial,sans-serif">
      <h2>Yangi javob keldi</h2>
      <p><b>Forma:</b> ${ctx.formTitle}<br/><b>Telegram:</b> ${ctx.chatId}<br/><b>Sana:</b> ${new Date().toLocaleString("uz-UZ")}</p>
      <table style="border-collapse:collapse;border:1px solid #e5e7eb">${rows}</table>
    </div>
  `;
}

async function logResult(args: {
  botId: string;
  responseId: string;
  service: Service;
  success: boolean;
  resultUrl?: string | null;
  resultId?: string | null;
  error?: string | null;
  payload?: any;
}) {
  try {
    await prisma.integrationLog.create({
      data: {
        botId: args.botId,
        responseId: args.responseId,
        service: args.service,
        success: args.success,
        resultUrl: args.resultUrl || null,
        resultId: args.resultId || null,
        error: args.error || null,
        payload: args.payload || undefined,
      },
    });
  } catch (e: any) {
    console.error("integrationLog create failed:", e?.message || e);
  }
}

export async function runIntegrationsForResponse(ctx: Ctx) {
  const bot = await prisma.bot.findUnique({
    where: { id: ctx.botId },
    select: { integrations: true },
  });
  const cfg = (bot?.integrations as BotIntegrationsConfig) || {};

  // Quick exit: nothing enabled
  const anyEnabled = SERVICES.some((s) => (cfg as any)[s]?.enabled);
  if (!anyEnabled) return;

  const accessToken = await getAccessTokenByUserId(ctx.userId);
  if (!accessToken) {
    console.error("No access token for user", ctx.userId);
    return;
  }

  const title = `Gway: ${ctx.formTitle} — ${new Date().toLocaleString("uz-UZ")}`;
  const summaryText = buildPlainSummary(ctx);
  const summaryHtml = buildHtmlSummary(ctx);

  // Run integrations in parallel; each one independently logs.
  const jobs: Promise<void>[] = [];

  if (cfg.calendar?.enabled) {
    jobs.push(
      (async () => {
        try {
          const now = new Date();
          const start = new Date(now.getTime() + 30 * 60 * 1000).toISOString();
          const end = new Date(now.getTime() + 60 * 60 * 1000).toISOString();
          const ev = await createCalendarEvent(accessToken, {
            summary: title,
            description: summaryText,
            startISO: start,
            endISO: end,
          });
          await logResult({
            botId: ctx.botId,
            responseId: ctx.responseId,
            service: "calendar",
            success: true,
            resultUrl: ev.htmlLink || null,
            resultId: ev.id || null,
            payload: { title },
          });
        } catch (e: any) {
          await logResult({
            botId: ctx.botId,
            responseId: ctx.responseId,
            service: "calendar",
            success: false,
            error: e?.message || String(e),
          });
        }
      })()
    );
  }

  if (cfg.docs?.enabled) {
    jobs.push(
      (async () => {
        try {
          const doc = await createDocFromText(accessToken, title, summaryText);
          await logResult({
            botId: ctx.botId,
            responseId: ctx.responseId,
            service: "docs",
            success: true,
            resultUrl: doc.url,
            resultId: doc.id || null,
            payload: { title },
          });
        } catch (e: any) {
          await logResult({
            botId: ctx.botId,
            responseId: ctx.responseId,
            service: "docs",
            success: false,
            error: e?.message || String(e),
          });
        }
      })()
    );
  }

  if (cfg.slides?.enabled) {
    jobs.push(
      (async () => {
        try {
          const pres = await createSlidesPresentation(accessToken, title, [
            { title: ctx.formTitle, body: `Telegram: ${ctx.chatId}` },
            { title: "Javoblar", body: summaryText.slice(0, 2000) },
          ]);
          await logResult({
            botId: ctx.botId,
            responseId: ctx.responseId,
            service: "slides",
            success: true,
            resultUrl: pres.url,
            resultId: pres.id || null,
            payload: { title },
          });
        } catch (e: any) {
          await logResult({
            botId: ctx.botId,
            responseId: ctx.responseId,
            service: "slides",
            success: false,
            error: e?.message || String(e),
          });
        }
      })()
    );
  }

  if (cfg.drive?.enabled) {
    jobs.push(
      (async () => {
        try {
          const file = await uploadFileToDrive(accessToken, {
            name: `${title}.txt`,
            mimeType: "text/plain",
            data: summaryText,
          });
          await logResult({
            botId: ctx.botId,
            responseId: ctx.responseId,
            service: "drive",
            success: true,
            resultUrl: file.webViewLink || null,
            resultId: file.id || null,
            payload: { title },
          });
        } catch (e: any) {
          await logResult({
            botId: ctx.botId,
            responseId: ctx.responseId,
            service: "drive",
            success: false,
            error: e?.message || String(e),
          });
        }
      })()
    );
  }

  if (cfg.gmail?.enabled) {
    jobs.push(
      (async () => {
        const to = cfg.gmail?.to || ctx.ownerEmail;
        if (!to) {
          await logResult({
            botId: ctx.botId,
            responseId: ctx.responseId,
            service: "gmail",
            success: false,
            error: "Gmail recipient (to) sozlanmagan",
          });
          return;
        }
        try {
          const msg = await sendGmail(accessToken, {
            to,
            subject: `Yangi javob — ${ctx.formTitle}`,
            html: summaryHtml,
            text: summaryText,
          });
          await logResult({
            botId: ctx.botId,
            responseId: ctx.responseId,
            service: "gmail",
            success: true,
            resultId: msg.id || null,
            payload: { to },
          });
        } catch (e: any) {
          await logResult({
            botId: ctx.botId,
            responseId: ctx.responseId,
            service: "gmail",
            success: false,
            error: e?.message || String(e),
          });
        }
      })()
    );
  }

  if (cfg.meet?.enabled) {
    jobs.push(
      (async () => {
        try {
          const now = new Date();
          const start = new Date(now.getTime() + 60 * 60 * 1000).toISOString();
          const end = new Date(now.getTime() + 120 * 60 * 1000).toISOString();
          const meet = await createMeetLink(accessToken, {
            title: title,
            startISO: start,
            endISO: end,
          });
          await logResult({
            botId: ctx.botId,
            responseId: ctx.responseId,
            service: "meet",
            success: true,
            resultUrl: meet.meetLink || null,
            resultId: meet.eventId || null,
            payload: { title },
          });
        } catch (e: any) {
          await logResult({
            botId: ctx.botId,
            responseId: ctx.responseId,
            service: "meet",
            success: false,
            error: e?.message || String(e),
          });
        }
      })()
    );
  }

  if (cfg.tasks?.enabled) {
    jobs.push(
      (async () => {
        try {
          const t = await createGoogleTask(accessToken, {
            title: `${ctx.formTitle} — yangi javob (chat ${ctx.chatId})`,
            notes: summaryText,
          });
          await logResult({
            botId: ctx.botId,
            responseId: ctx.responseId,
            service: "tasks",
            success: true,
            resultId: t.id || null,
            payload: { title: t.title },
          });
        } catch (e: any) {
          await logResult({
            botId: ctx.botId,
            responseId: ctx.responseId,
            service: "tasks",
            success: false,
            error: e?.message || String(e),
          });
        }
      })()
    );
  }

  await Promise.allSettled(jobs);
}
