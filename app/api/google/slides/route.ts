import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createSlidesPresentation } from "@/lib/googleServices";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const title = body.title || `Gway prezentatsiya — ${new Date().toLocaleDateString("uz-UZ")}`;
  const slides =
    Array.isArray(body.slides) && body.slides.length
      ? body.slides
      : [
          { title: "Salom!", body: "Gway prezentatsiyasi" },
          { title: "Natijalar", body: "Forma javoblari shu yerda" },
        ];
  try {
    const pres = await createSlidesPresentation(session.user.accessToken, title, slides);
    return NextResponse.json({ ok: true, presentation: pres });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Slides error" }, { status: 500 });
  }
}
