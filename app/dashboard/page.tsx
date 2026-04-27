import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  PlusCircle,
  Bot,
  MessageSquare,
  Activity,
  Clock,
  ArrowRight,
  Eye,
  FileText,
  Vote,
  Sparkles,
} from "lucide-react";
import { BotCard } from "@/components/dashboard/BotCard";
import { RealTimeRefresh } from "@/components/dashboard/RealTimeRefresh";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id;
  if (!userId) redirect("/login");

  const userInfo = await prisma.user.findUnique({
    where: { id: userId },
    select: { plan: true },
  });
  const userPlan = userInfo?.plan || "FREE";
  const canUseVoting = ["PRO", "BUSINESS", "GWAY"].includes(userPlan);

  const [bots, recentResponses, totalResponses, activeBotsCount, formCount] =
    await Promise.all([
      prisma.bot.findMany({
        where: { userId },
        include: { form: true, _count: { select: { responses: true } } },
        orderBy: { createdAt: "desc" },
        take: 3,
      }),
      prisma.response.findMany({
        where: { bot: { userId }, status: "completed" },
        include: { bot: { select: { telegramBotUsername: true, form: { select: { title: true } } } } },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.response.count({ where: { bot: { userId }, status: "completed" } }),
      prisma.bot.count({ where: { userId, status: "active" } }),
      prisma.form.count({ where: { userId } }),
    ]);

  const totalBots = await prisma.bot.count({ where: { userId } });
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayResponses = await prisma.response.count({
    where: { bot: { userId }, status: "completed", createdAt: { gte: today } },
  });

  return (
    <div className="flex flex-col h-full gap-5">
      {/* Welcome bar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight">
              Xush kelibsiz, {session?.user?.name?.split(" ")[0] || "Do'st"}!
            </h1>
            <RealTimeRefresh intervalMs={60000} />
          </div>
          <p className="text-slate-500 text-sm">
            Barcha botlaringiz va javoblar bir ko'rinishda.
          </p>
        </div>
        <Button asChild size="sm" className="rounded-full h-10 gap-2 shadow-md shadow-primary/20">
          <Link href="/dashboard/new">
            <PlusCircle size={16} />
            Yangi bot ulash
          </Link>
        </Button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard icon={<Bot size={18} />} label="Botlar" value={totalBots} hint={`${activeBotsCount} aktiv`} />
        <StatCard icon={<MessageSquare size={18} />} label="Javoblar" value={totalResponses} hint="jami" />
        <StatCard icon={<Activity size={18} />} label="Bugun" value={todayResponses} hint="ta javob" accent />
        <StatCard icon={<FileText size={18} />} label="Formalar" value={formCount} hint="ulangan" />
      </div>

      {/* Voting bots promo / link */}
      <Link
        href={canUseVoting ? "/dashboard/voting-bots" : "/pricing"}
        className="block"
      >
        <Card className="border-none shadow-sm bg-gradient-to-r from-primary to-primary/80 text-white hover:shadow-md transition-shadow">
          <CardContent className="p-4 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <Vote size={22} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-bold">Ovoz toplash boti</p>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-300 text-amber-900">
                  {canUseVoting ? "FAOL" : "PRO"}
                </span>
              </div>
              <p className="text-xs text-white/80 mt-0.5">
                {canUseVoting
                  ? "Konkurs, reyting va sanatkorlar uchun ovoz toplash boti yarating."
                  : "Professional tarifida ochiladi — konkurs botini yarating va ovoz toplang."}
              </p>
            </div>
            <div className="flex items-center gap-1 text-sm font-semibold">
              {canUseVoting ? "Ochish" : <><Sparkles size={14} />Yangilash</>}
              <ArrowRight size={14} />
            </div>
          </CardContent>
        </Card>
      </Link>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 flex-1 min-h-0">
        {/* My bots quick view */}
        <div className="lg:col-span-2 flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-slate-800">Oxirgi botlaringiz</h2>
            <Button asChild variant="ghost" size="sm" className="h-8 gap-1 text-primary">
              <Link href="/dashboard/bots">
                Hammasi <ArrowRight size={14} />
              </Link>
            </Button>
          </div>

          {bots.length === 0 ? (
            <Card className="border-dashed border-2 bg-transparent flex-1">
              <CardContent className="flex flex-col items-center justify-center py-10 text-center h-full">
                <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                  <Bot className="h-7 w-7 text-slate-400" />
                </div>
                <h3 className="text-base font-semibold mb-1">Hali botlar yo'q</h3>
                <p className="text-slate-500 text-sm max-w-xs mb-4">
                  Birinchi botingizni ulab, Google Form javoblarini Telegram'da qabul qilishni boshlang.
                </p>
                <Button asChild size="sm" className="rounded-full">
                  <Link href="/dashboard/new">Yangi bot ulash</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {bots.map((bot) => (
                <BotCard
                  key={bot.id}
                  compact
                  bot={{
                    id: bot.id,
                    telegramBotUsername: bot.telegramBotUsername,
                    name: bot.name,
                    status: bot.status,
                    responsesCount: bot._count.responses,
                    formTitle: bot.form.title,
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Recent responses */}
        <div className="flex flex-col min-h-0">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              <Clock size={16} className="text-primary" />
              Oxirgi javoblar
            </h2>
          </div>
          <Card className="border-none shadow-sm flex-1">
            <CardContent className="p-2">
              {recentResponses.length === 0 ? (
                <div className="text-center py-8 text-sm text-slate-400">
                  Hali javoblar yo'q
                </div>
              ) : (
                <ul className="divide-y divide-slate-100">
                  {recentResponses.map((r) => (
                    <li key={r.id}>
                      <Link
                        href={`/dashboard/bot/${r.botId}/response/${r.id}`}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition"
                      >
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">
                          {r.chatId?.slice(-2) || "—"}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium truncate">
                            {r.bot.form?.title || "Forma"}
                          </p>
                          <p className="text-xs text-slate-400 truncate">
                            @{r.bot.telegramBotUsername || "bot"} •{" "}
                            {new Date(r.createdAt).toLocaleString("uz-UZ", {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                        </div>
                        <Badge variant="outline" className="shrink-0 text-xs gap-1">
                          <Eye size={11} />
                          ko'rish
                        </Badge>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  hint,
  accent = false,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  hint: string;
  accent?: boolean;
}) {
  return (
    <Card
      className={`border-none shadow-sm ${
        accent ? "bg-primary text-white" : "bg-white"
      }`}
    >
      <CardContent className="p-3 flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
            accent ? "bg-white/20 text-white" : "bg-primary/10 text-primary"
          }`}
        >
          {icon}
        </div>
        <div className="min-w-0">
          <p className={`text-xs font-medium ${accent ? "text-white/80" : "text-slate-500"}`}>
            {label}
          </p>
          <p className="text-xl font-bold leading-tight">{value}</p>
          <p className={`text-xs ${accent ? "text-white/70" : "text-slate-400"}`}>{hint}</p>
        </div>
      </CardContent>
    </Card>
  );
}
