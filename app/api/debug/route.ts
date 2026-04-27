import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function GET(request: Request) {
  const session = await getServerSession(authOptions);

  // Safe environment variables to expose (no secrets)
  const safeEnv = {
    NODE_ENV: process.env.NODE_ENV,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    // Don't expose secrets, keys, or tokens
  };

  return NextResponse.json({
    session: session ? {
      user: session.user ? {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
        accessTokenExists: !!session.user.accessToken,
        refreshTokenExists: !!session.user.refreshToken,
        plan: session.user.plan,
        planExpiresAt: session.user.planExpiresAt,
      } : null,
      expires: session.expires,
    } : null,
    env: safeEnv,
    cookies: request.headers.get("cookie") || "",
  });
}