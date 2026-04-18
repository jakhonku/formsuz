import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { decrypt } from "@/lib/crypto";
import { deleteBotWebhook, setWebhook } from "@/lib/telegram";
import { getFormDetails } from "@/lib/google";

function resolvePublicBaseUrl(req: Request) {
  const envUrl = process.env.NEXTAUTH_URL;
  if (envUrl) return envUrl.replace(/\/$/, "");
  const host = req.headers.get("host");
  const proto = req.headers.get("x-forwarded-proto") || "https";
  if (host) return `${proto}://${host}`;
  return "";
}

async function requireBot(req: Request, id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  const bot = await prisma.bot.findUnique({ where: { id } });
  if (!bot || bot.userId !== session.user.id) {
    return { error: NextResponse.json({ error: "Topilmadi" }, { status: 404 }) };
  }
  return { session, bot };
}

export async function GET(req: Request, { params }: { params: { id: string } }) {
  const result = await requireBot(req, params.id);
  if ("error" in result) return result.error;

  const bot = await prisma.bot.findUnique({
    where: { id: params.id },
    include: {
      form: true,
      _count: { select: { responses: true } },
    },
  });

  return NextResponse.json(bot);
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const result = await requireBot(req, params.id);
  if ("error" in result) return result.error;
  const { bot, session } = result;

  try {
    const body = await req.json();
    const data: Record<string, unknown> = {};

    if (typeof body.status === "string" && ["active", "inactive"].includes(body.status)) {
      data.status = body.status;
    }

    // Refresh form metadata from Google (user edited form in Google Forms)
    if (body.refreshForm === true) {
      if (!session.user?.accessToken) {
        return NextResponse.json(
          { error: "Google ruxsati yo'q. Qaytadan kiring." },
          { status: 401 }
        );
      }
      const currentForm = await prisma.form.findUnique({ where: { id: bot.formId } });
      if (!currentForm) {
        return NextResponse.json({ error: "Forma topilmadi" }, { status: 404 });
      }
      try {
        const googleForm = await getFormDetails(
          session.user.accessToken,
          currentForm.googleFormId
        );
        await prisma.form.update({
          where: { id: currentForm.id },
          data: {
            title: googleForm.info?.title || currentForm.title,
            metadata: googleForm as any,
          },
        });
      } catch (err: any) {
        return NextResponse.json(
          { error: "Formani Google'dan yuklab bo'lmadi. Qaytadan kiring." },
          { status: 400 }
        );
      }
    }

    if (typeof body.formId === "string" && body.formId.length > 0) {
      if (!session.user?.accessToken) {
        return NextResponse.json(
          { error: "Google ruxsati yo'q. Qaytadan kiring." },
          { status: 401 }
        );
      }
      let googleForm;
      try {
        googleForm = await getFormDetails(session.user.accessToken, body.formId);
      } catch {
        return NextResponse.json(
          { error: "Google Forma topilmadi" },
          { status: 400 }
        );
      }

      const dbForm = await prisma.form.upsert({
        where: { googleFormId: body.formId },
        update: {
          title: googleForm.info?.title || "Nomsiz forma",
          metadata: googleForm as any,
        },
        create: {
          googleFormId: body.formId,
          title: googleForm.info?.title || "Nomsiz forma",
          userId: session.user.id!,
          metadata: googleForm as any,
        },
      });
      data.formId = dbForm.id;
    }

    if (Object.keys(data).length === 0 && body.refreshForm !== true) {
      return NextResponse.json({ error: "O'zgartirish uchun ma'lumot yo'q" }, { status: 400 });
    }

    if (Object.keys(data).length === 0) {
      // Only refresh happened — return updated bot
      const refreshed = await prisma.bot.findUnique({
        where: { id: bot.id },
        include: { form: true },
      });
      return NextResponse.json(refreshed);
    }

    const updated = await prisma.bot.update({
      where: { id: bot.id },
      data,
      include: { form: true },
    });

    if (data.status === "inactive") {
      try {
        const token = decrypt(bot.telegramToken);
        await deleteBotWebhook(token);
      } catch (e) {
        console.error("deleteWebhook on inactive failed:", e);
      }
    }

    if (data.status === "active") {
      try {
        const token = decrypt(bot.telegramToken);
        const baseUrl = resolvePublicBaseUrl(req);
        if (baseUrl) {
          await setWebhook(token, `${baseUrl}/api/webhook/telegram/${bot.id}`);
        }
      } catch (e) {
        console.error("setWebhook on active failed:", e);
      }
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Bot PATCH error:", error);
    return NextResponse.json(
      { error: error?.message || "Yangilashda xatolik" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const result = await requireBot(req, params.id);
  if ("error" in result) return result.error;
  const { bot } = result;

  try {
    try {
      const token = decrypt(bot.telegramToken);
      await deleteBotWebhook(token);
    } catch (e) {
      console.error("deleteWebhook on delete failed:", e);
    }

    await prisma.bot.delete({ where: { id: bot.id } });
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("Bot DELETE error:", error);
    return NextResponse.json(
      { error: error?.message || "O'chirishda xatolik" },
      { status: 500 }
    );
  }
}
