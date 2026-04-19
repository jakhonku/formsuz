import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const ADMIN_EMAILS = ["jakhongirbakhtiyarov0130@gmail.com", "jakhonku@gmail.com"];

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const { userId, plan, expiresAt } = await req.json();

  if (!userId || !plan) {
    return new NextResponse("Missing fields", { status: 400 });
  }

  // Determine expiration date
  let finalExpiresAt = null;
  if (expiresAt) {
    finalExpiresAt = new Date(expiresAt);
  } else if (plan === "PRO" || plan === "BUSINESS") {
    // Default to 30 days if not specified but upgrading
    const d = new Date();
    d.setDate(d.getDate() + 30);
    finalExpiresAt = d;
  }

  try {
    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        plan,
        planExpiresAt: finalExpiresAt
      }
    });

    revalidatePath("/admin-panel-secret");
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/voting-bots");
    revalidatePath("/dashboard/voting-bots/new");
    revalidatePath("/dashboard/settings");

    return NextResponse.json(updated);
  } catch (error) {
    console.error("Admin update error:", error);
    return new NextResponse("Database error", { status: 500 });
  }
}
