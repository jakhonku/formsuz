import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const ADMIN_EMAILS = ["jakhongirbakhtiyarov0130@gmail.com", "jakhonku@gmail.com"];

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { userId, plan } = await req.json();

  if (!userId || !plan) {
    return new NextResponse("Missing fields", { status: 400 });
  }

  // Set expiration date (e.g., 30 days if upgrading to PRO/BUSINESS)
  let expiresAt = null;
  if (plan !== "FREE") {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    expiresAt = d;
  }

  try {
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { 
        plan,
        planExpiresAt: expiresAt
      }
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Admin update error:", error);
    return new NextResponse("Database error", { status: 500 });
  }
}
