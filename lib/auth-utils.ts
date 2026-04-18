import { prisma } from "./prisma";

export async function getAccessTokenByUserId(userId: string) {
  const account = await prisma.account.findFirst({
    where: { userId, provider: "google" },
  });

  if (!account) return null;

  // Check if token is expired (expires_at is in seconds)
  const isExpired = account.expires_at ? Date.now() >= account.expires_at * 1000 - 60000 : false;

  if (!isExpired && account.access_token) {
    return account.access_token;
  }

  // Token is expired, try to refresh it
  if (!account.refresh_token) {
    console.error("No refresh token available for user", userId);
    return account.access_token; // Return what we have, though it likely won't work
  }

  try {
    const url = "https://oauth2.googleapis.com/token";
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: process.env.GOOGLE_CLIENT_ID!,
        client_secret: process.env.GOOGLE_CLIENT_SECRET!,
        grant_type: "refresh_token",
        refresh_token: account.refresh_token,
      }),
    });

    const tokens = await response.json();

    if (!response.ok) throw tokens;

    const newAccessToken = tokens.access_token;
    const newExpiresAt = Math.floor(Date.now() / 1000 + tokens.expires_in);

    // Update database
    await prisma.account.update({
      where: { id: account.id },
      data: {
        access_token: newAccessToken,
        expires_at: newExpiresAt,
        refresh_token: tokens.refresh_token ?? account.refresh_token,
      },
    });

    return newAccessToken;
  } catch (error) {
    console.error("Error refreshing token in auth-utils:", error);
    return account.access_token;
  }
}
