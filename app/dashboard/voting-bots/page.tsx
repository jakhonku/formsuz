import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  PlusCircle,
  Vote,
  Users,
  TrendingUp,
  Lock,
  ArrowRight,
  Crown,
} from "lucide-react";

const ALLOWED_PLANS = ["PRO", "BUSINESS", "GWAY"];

export default async function VotingBotsPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true },
  });

  const userPlan = user?.plan || "FREE";
  const hasAccess = ALLOWED_PLANS.includes(userPlan);

  if (!hasAccess) {
    return (
      <div className="flex items-center justify-center min-h-[70vh]">
        <Card className="border-none shadow-lg max-w-lg">
          <CardContent className="p-10 text-center space-y-5">
            <div className="w-20 h-20 bg-amber-100 rounded-3xl flex items-center justify-center mx-auto">
              <Lock className="h-10 w-10 text-amber-600" />
            </div>
            <h2 className="text-2xl font-bold">Bu funksiya Professional tarifida</h2>
            <p className="text-slate-600">
              Ovoz toplash botlari — konkurs, reyting va so'rovnoma uchun maxsus
              bot. Bu imkoniyat <b>Professional</b> va undan yuqori tariflarda
              mavjud.
            </p>
            <div className="bg-slate-50 rounded-xl p-4 text-left text-sm space-y-2">
              <div className="flex items-start gap-2">
                <Crown className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <span>Cheksiz nomzodlar qo'shish</span>
              </div>
              <div className="flex items-start gap-2">
                <Crown className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <span>Real-vaqtda ovozlar hisoboti</span>
              </div>
              <div className="flex items-start gap-2">
                <Crown className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <span>Bir foydalanuvchi — bir ovoz kafolati</span>
              </div>
            </div>
            <Button asChild size="lg" className="rounded-full w-full">
              <Link href="/pricing">Tarifni yangilash</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const bots = await prisma.votingBot.findMany({
    where: { userId },
    include: {
      _count: { select: { candidates: true, votes: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const totalVotes = bots.reduce((sum, b) => sum + b._count.votes, 0);
  const activeBots = bots.filter((b) => b.status === "active").length;

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
            <Vote className="text-primary" />
            Ovoz toplash botlari
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Konkurslar, reytinglar va so'rovnomalar uchun Telegram botlari.
          </p>
        </div>
        <Button
          asChild
          size="sm"
          className="rounded-full h-10 gap-2 shadow-md shadow-primary/20"
        >
          <Link href="/dashboard/voting-bots/new">
            <PlusCircle size={16} />
            Yangi konkurs boti
          </Link>
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <Card className="border-none shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Vote size={18} />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Konkurs botlari</p>
              <p className="text-xl font-bold leading-tight">{bots.length}</p>
              <p className="text-xs text-slate-400">{activeBots} aktiv</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Users size={18} />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">Jami ovozlar</p>
              <p className="text-xl font-bold leading-tight">{totalVotes}</p>
              <p className="text-xs text-slate-400">barcha konkurslar</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm bg-primary text-white col-span-2 md:col-span-1">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-white/20 text-white flex items-center justify-center">
              <TrendingUp size={18} />
            </div>
            <div>
              <p className="text-xs font-medium text-white/80">Holat</p>
              <p className="text-xl font-bold leading-tight">Faol</p>
              <p className="text-xs text-white/70">{userPlan} tarifi</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {bots.length === 0 ? (
        <Card className="border-dashed border-2 bg-transparent">
          <CardContent className="flex flex-col items-center justify-center py-14 text-center">
            <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mb-3">
              <Vote className="h-7 w-7 text-slate-400" />
            </div>
            <h3 className="text-base font-semibold mb-1">Hali konkurs botlari yo'q</h3>
            <p className="text-slate-500 text-sm max-w-sm mb-4">
              Birinchi ovoz toplash botingizni yarating — nomzodlarni kiriting va
              odamlarga havola yuboring.
            </p>
            <Button asChild size="sm" className="rounded-full">
              <Link href="/dashboard/voting-bots/new">Yangi konkurs boti</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {bots.map((bot) => (
            <Link key={bot.id} href={`/dashboard/voting-bot/${bot.id}`}>
              <Card className="border-none shadow-sm hover:shadow-md transition-shadow h-full">
                <CardContent className="p-5 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                      <Vote size={18} />
                    </div>
                    <Badge
                      variant={bot.status === "active" ? "default" : "outline"}
                      className="text-xs"
                    >
                      {bot.status === "active" ? "Aktiv" : "Nofaol"}
                    </Badge>
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold truncate">{bot.title}</p>
                    <p className="text-xs text-slate-400 truncate">
                      @{bot.telegramBotUsername || bot.name}
                    </p>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t text-sm">
                    <div className="flex items-center gap-1 text-slate-600">
                      <Users size={14} />
                      <span>
                        <b>{bot._count.candidates}</b> nomzod
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-primary font-semibold">
                      <span>{bot._count.votes} ovoz</span>
                      <ArrowRight size={14} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
