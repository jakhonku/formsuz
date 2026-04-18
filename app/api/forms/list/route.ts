import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { listUserForms } from "@/lib/google";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.accessToken) {
    return NextResponse.json(
      { error: "Avtorizatsiya talab qilinadi. Iltimos, qaytadan kiring." },
      { status: 401 }
    );
  }

  try {
    const forms = await listUserForms(session.user.accessToken);
    return NextResponse.json(forms);
  } catch (error: any) {
    console.error("List forms error:", error?.message || error);
    const message = error?.response?.data?.error?.message || error?.message || "Formalarni olib bo'lmadi";
    const status = error?.response?.status || error?.code === 401 ? 401 : 500;
    if (status === 401 || message?.toLowerCase().includes("invalid credentials")) {
      return NextResponse.json(
        { error: "Google ruxsat muddati tugagan. Iltimos, tizimdan chiqib qaytadan kiring." },
        { status: 401 }
      );
    }
    if (message?.toLowerCase().includes("insufficient") || message?.toLowerCase().includes("scope")) {
      return NextResponse.json(
        { error: "Google Drive ruxsati yo'q. Iltimos, chiqib qaytadan kiring va barcha ruxsatlarga rozi bo'ling." },
        { status: 403 }
      );
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
