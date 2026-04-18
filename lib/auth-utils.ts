import { prisma } from "./prisma";

export async function getAccessTokenByUserId(userId: string) {
  const account = await prisma.account.findFirst({
    where: { userId, provider: "google" },
  });

  return account?.access_token;
}
