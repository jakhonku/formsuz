import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createDocFromText } from "@/lib/googleServices";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const title = body.title || `Gway hisobot — ${new Date().toLocaleString("uz-UZ")}`;
  const content = body.body || "Gway tomonidan avtomatik yaratilgan hujjat.\n\n";
  try {
    const doc = await createDocFromText(session.user.accessToken, title, content);
    return NextResponse.json({ ok: true, doc });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Docs error" }, { status: 500 });
  }
}
