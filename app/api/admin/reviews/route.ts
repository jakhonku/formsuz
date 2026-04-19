import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const ADMIN_EMAILS = ["jakhongirbakhtiyarov0130@gmail.com", "jakhonku@gmail.com"];

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const reviews = await prisma.review.findMany({
      where: { isApproved: false },
      include: {
        user: { select: { name: true, email: true } }
      },
      orderBy: { createdAt: "desc" }
    });
    return NextResponse.json(reviews);
  } catch (error) {
    return new NextResponse("Error", { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { reviewId } = await req.json();
    await prisma.review.update({
      where: { id: reviewId },
      data: { isApproved: true }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return new NextResponse("Error", { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { reviewId } = await req.json();
    await prisma.review.delete({
      where: { id: reviewId }
    });
    return NextResponse.json({ success: true });
  } catch (error) {
    return new NextResponse("Error", { status: 500 });
  }
}
