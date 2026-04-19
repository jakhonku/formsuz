import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

async function requireCandidate(votingBotId: string, candidateId: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  const bot = await prisma.votingBot.findUnique({ where: { id: votingBotId } });
  if (!bot || bot.userId !== session.user.id) {
    return { error: NextResponse.json({ error: "Topilmadi" }, { status: 404 }) };
  }
  const candidate = await prisma.candidate.findUnique({ where: { id: candidateId } });
  if (!candidate || candidate.votingBotId !== bot.id) {
    return { error: NextResponse.json({ error: "Nomzod topilmadi" }, { status: 404 }) };
  }
  return { bot, candidate };
}

export async function PATCH(
  req: Request,
  { params }: { params: { id: string; candidateId: string } }
) {
  const result = await requireCandidate(params.id, params.candidateId);
  if ("error" in result) return result.error;
  const { candidate } = result;

  try {
    const body = await req.json();
    const data: Record<string, unknown> = {};
    if (typeof body.name === "string" && body.name.trim().length > 0) {
      data.name = body.name.trim();
    }
    if (typeof body.description === "string") {
      data.description = body.description.trim() || null;
    }
    if (typeof body.photoUrl === "string") {
      data.photoUrl = body.photoUrl.trim() || null;
    }
    if (typeof body.order === "number") {
      data.order = body.order;
    }

    if (Object.keys(data).length === 0) {
      return NextResponse.json({ error: "O'zgartirish yo'q" }, { status: 400 });
    }

    const updated = await prisma.candidate.update({
      where: { id: candidate.id },
      data,
    });
    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Candidate PATCH error:", error);
    return NextResponse.json(
      { error: error?.message || "Yangilashda xatolik" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string; candidateId: string } }
) {
  const result = await requireCandidate(params.id, params.candidateId);
  if ("error" in result) return result.error;
  const { candidate } = result;

  try {
    await prisma.candidate.delete({ where: { id: candidate.id } });
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error("Candidate DELETE error:", error);
    return NextResponse.json(
      { error: error?.message || "O'chirishda xatolik" },
      { status: 500 }
    );
  }
}
