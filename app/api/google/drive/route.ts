import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { listDriveFiles, uploadFileToDrive } from "@/lib/googleServices";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const files = await listDriveFiles(session.user.accessToken, 10);
    return NextResponse.json({ ok: true, files });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Drive error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const name = body.name || `gway-test-${Date.now()}.txt`;
  const content = body.content || "Gway tomonidan avtomatik yaratilgan fayl.";
  const mimeType = body.mimeType || "text/plain";
  try {
    const file = await uploadFileToDrive(session.user.accessToken, {
      name,
      mimeType,
      data: content,
    });
    return NextResponse.json({ ok: true, file });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Drive upload error" }, { status: 500 });
  }
}
