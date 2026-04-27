import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createGoogleTask, listGoogleTasks } from "@/lib/googleServices";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const items = await listGoogleTasks(session.user.accessToken, 10);
    return NextResponse.json({ ok: true, items });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Tasks error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const title = body.title || `Gway test vazifa — ${new Date().toLocaleString("uz-UZ")}`;
  try {
    const task = await createGoogleTask(session.user.accessToken, {
      title,
      notes: body.notes,
      dueISO: body.dueISO,
    });
    return NextResponse.json({ ok: true, task });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Tasks create error" }, { status: 500 });
  }
}
