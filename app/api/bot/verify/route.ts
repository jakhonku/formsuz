import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { verifyBotToken } from "@/lib/telegram";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Avtorizatsiya talab qilinadi" }, { status: 401 });
  }

  try {
    const { token } = await req.json();
    if (!token || typeof token !== "string") {
      return NextResponse.json({ error: "Bot token talab qilinadi" }, { status: 400 });
    }

    const trimmed = token.trim();
    if (!/^\d+:[\w-]+$/.test(trimmed)) {
      return NextResponse.json(
        { error: "Bot token formati noto'g'ri (misol: 123456789:ABC...)" },
        { status: 400 }
      );
    }

    const botInfo = await verifyBotToken(trimmed);
    if (!botInfo) {
      return NextResponse.json(
        { error: "Bot topilmadi. Tokenni tekshiring yoki yangi bot yarating (@BotFather)." },
        { status: 400 }
      );
    }

    return NextResponse.json(botInfo);
  } catch (error: any) {
    console.error("Verify bot error:", error);
    return NextResponse.json(
      { error: error?.message || "Tokenni tekshirishda xatolik" },
      { status: 500 }
    );
  }
}
