import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { sendGmail } from "@/lib/googleServices";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.accessToken || !session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const to = body.to || session.user.email;
  const subject = body.subject || "Gway test xabari";
  const html = body.html || `<h2>Salom!</h2><p>Bu Gway tomonidan yuborilgan test xat.</p>`;
  try {
    const msg = await sendGmail(session.user.accessToken, { to, subject, html });
    return NextResponse.json({ ok: true, message: msg });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Gmail error" }, { status: 500 });
  }
}
