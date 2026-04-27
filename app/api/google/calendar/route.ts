import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createCalendarEvent, listUpcomingEvents } from "@/lib/googleServices";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const items = await listUpcomingEvents(session.user.accessToken, 5);
    return NextResponse.json({ ok: true, items });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Calendar error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const summary = body.summary || "Gway test voqea";
  const now = new Date();
  const start = body.startISO || new Date(now.getTime() + 60 * 60 * 1000).toISOString();
  const end = body.endISO || new Date(now.getTime() + 90 * 60 * 1000).toISOString();
  try {
    const ev = await createCalendarEvent(session.user.accessToken, {
      summary,
      description: body.description,
      startISO: start,
      endISO: end,
      addMeetLink: !!body.addMeetLink,
      attendees: body.attendees,
    });
    return NextResponse.json({ ok: true, event: ev });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Calendar create error" }, { status: 500 });
  }
}
