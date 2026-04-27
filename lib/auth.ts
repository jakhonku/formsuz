import { PrismaAdapter } from "@auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import { JWT } from "next-auth/jwt";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";

async function refreshAccessToken(token: JWT) {
  try {
    const url = "https://oauth2.googleapis.com/token";
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        grant_type: "refresh_token",
        refresh_token: token.refreshToken!,
      }),
    });

    const refreshedTokens = await response.json();

    if (!response.ok) {
      throw refreshedTokens;
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken, // Fall back to old refresh token
    };
  } catch (error) {
    console.error("RefreshAccessTokenError", error);

    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code",
          scope: [
            "openid",
            "https://www.googleapis.com/auth/userinfo.email",
            "https://www.googleapis.com/auth/userinfo.profile",
            "https://www.googleapis.com/auth/drive.metadata.readonly",
            "https://www.googleapis.com/auth/forms.body.readonly",
            "https://www.googleapis.com/auth/forms.responses.readonly",
            "https://www.googleapis.com/auth/spreadsheets",
          ].join(" "),
        },
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      // Initial sign in
      if (account && user) {
        // Fetch fresh plan info from DB even on sign in (since adapter creates the user)
        const dbUser = await prisma.user.findUnique({
          where: { id: user.id },
          select: { plan: true, planExpiresAt: true }
        });

        return {
          accessToken: account.access_token,
          accessTokenExpires: (account.expires_at ?? 0) * 1000,
          refreshToken: account.refresh_token,
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          plan: dbUser?.plan || "FREE",
          planExpiresAt: dbUser?.planExpiresAt?.toISOString() || null
        };
      }

      // Re-read plan/expiry from DB with a short TTL so admin upgrades
      // take effect within ~60s without hammering the DB on every request.
      const PLAN_TTL_MS = 60_000;
      const lastCheck = (token.planCheckedAt as number | undefined) ?? 0;
      if (token.id && Date.now() - lastCheck > PLAN_TTL_MS) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: { plan: true, planExpiresAt: true }
        });
        if (dbUser) {
          token.plan = dbUser.plan;
          token.planExpiresAt = dbUser.planExpiresAt?.toISOString() || null;
        }
        token.planCheckedAt = Date.now();
      }

      if (Date.now() < (token.accessTokenExpires as number)) {
        return token;
      }

      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.accessToken = token.accessToken as string | undefined;
        session.user.refreshToken = token.refreshToken as string | undefined;
        session.user.accessTokenExpires = token.accessTokenExpires as number | undefined;
        session.user.error = token.error as string | undefined;
        session.user.plan = token.plan as string | undefined;
        session.user.planExpiresAt = token.planExpiresAt as string | null | undefined;
      }
      return session;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      try {
        if (new URL(url).origin === baseUrl) return url;
      } catch {
        // ignore invalid URL
      }
      return `${baseUrl}/dashboard`;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
