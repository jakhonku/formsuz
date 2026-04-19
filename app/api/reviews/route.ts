import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const reviews = await prisma.review.findMany({
      where: { isApproved: true },
      include: {
        user: {
          select: {
            name: true,
            image: true,
          }
        }
      },
      orderBy: { createdAt: "desc" },
      take: 6
    });
    return NextResponse.json(reviews);
  } catch (error) {
    return new NextResponse("Error fetching reviews", { status: 500 });
  }
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  try {
    const { rating, content } = await req.json();

    if (!rating || !content) {
      return new NextResponse("Missing fields", { status: 400 });
    }

    const review = await prisma.review.create({
      data: {
        userId: session.user.id,
        rating: Number(rating),
        content,
        isApproved: false // Moderation by default
      }
    });

    return NextResponse.json(review);
  } catch (error) {
    return new NextResponse("Error creating review", { status: 500 });
  }
}
