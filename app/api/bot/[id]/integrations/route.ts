import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const ALLOWED = ["calendar", "docs", "slides", "drive", "gmail", "meet", "tasks"] as const;

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const bot = await prisma.bot.findUnique({
    where: { id: params.id },
    select: { id: true, userId: true, integrations: true },
  });
  if (!bot || bot.userId !== session.user.id) {
    return NextResponse.json({ error: "Topilmadi" }, { status: 404 });
  }
  return NextResponse.json({ integrations: bot.integrations || {} });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const bot = await prisma.bot.findUnique({
    where: { id: params.id },
    select: { id: true, userId: true, integrations: true },
  });
  if (!bot || bot.userId !== session.user.id) {
    return NextResponse.json({ error: "Topilmadi" }, { status: 404 });
  }

  const body = await req.json().catch(() => ({}));
  const incoming = body.integrations || {};
  const current = (bot.integrations as Record<string, any>) || {};

  // Only accept allowed services
  const next: Record<string, any> = { ...current };
  for (const svc of ALLOWED) {
    if (svc in incoming) {
      const v = incoming[svc] || {};
      next[svc] = {
        enabled: !!v.enabled,
        ...(v.to && typeof v.to === "string" ? { to: v.to.trim() } : {}),
      };
    }
  }

  const updated = await prisma.bot.update({
    where: { id: bot.id },
    data: { integrations: next as any },
    select: { integrations: true },
  });

  return NextResponse.json({ integrations: updated.integrations || {} });
}
