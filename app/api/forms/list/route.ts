import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { listUserForms } from "@/lib/google";

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user?.accessToken) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const forms = await listUserForms(session.user.accessToken);
    return NextResponse.json(forms);
  } catch (error: any) {
    console.error("List forms error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
