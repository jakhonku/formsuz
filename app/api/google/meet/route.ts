import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createMeetLink } from "@/lib/googleServices";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const title = body.title || "Gway Meet uchrashuvi";
  const now = new Date();
  const startISO = body.startISO || new Date(now.getTime() + 30 * 60 * 1000).toISOString();
  const endISO = body.endISO || new Date(now.getTime() + 90 * 60 * 1000).toISOString();
  try {
    const meet = await createMeetLink(session.user.accessToken, {
      title,
      startISO,
      endISO,
      attendees: body.attendees,
    });
    return NextResponse.json({ ok: true, meet });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Meet error" }, { status: 500 });
  }
}
