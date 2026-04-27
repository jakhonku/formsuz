import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { workspaceConfig } = await req.json();

    const bot = await prisma.bot.findUnique({
      where: { id: params.id, userId: session.user.id },
    });

    if (!bot) {
      return NextResponse.json({ error: "Bot topilmadi" }, { status: 404 });
    }

    const updated = await prisma.bot.update({
      where: { id: params.id },
      data: {
        workspaceConfig: workspaceConfig,
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error("Update workspace config error:", error);
    return NextResponse.json({ error: "Server xatosi" }, { status: 500 });
  }
}
