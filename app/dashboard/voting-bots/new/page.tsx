import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";
import { Lock, Crown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { NewVotingBotForm } from "@/components/dashboard/voting/NewVotingBotForm";

const ALLOWED_PLANS = ["PRO", "BUSINESS", "GWAY"];

export default async function NewVotingBotPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true },
  });
  const userPlan = user?.plan || "FREE";

  if (!ALLOWED_PLANS.includes(userPlan)) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <Card className="border-none shadow-lg max-w-md">
          <CardContent className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center mx-auto">
              <Lock className="h-8 w-8 text-amber-600" />
            </div>
            <h2 className="text-xl font-bold">Tariflaringizni yangilang</h2>
            <p className="text-slate-500 text-sm">
              Ovoz toplash boti yaratish uchun Professional tarifi kerak.
            </p>
            <Button asChild className="rounded-full w-full">
              <Link href="/pricing">
                <Crown className="mr-2 h-4 w-4" />
                Tarifni yangilash
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <NewVotingBotForm />;
}
