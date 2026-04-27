import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  FileText,
  Presentation,
  HardDrive,
  Mail,
  Video,
  CheckSquare,
  ArrowRight,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Sparkles,
} from "lucide-react";

export const metadata = { title: "Google integratsiyalar — Gway" };

const SERVICE_META: Record<
  string,
  { name: string; icon: any; color: string }
> = {
  calendar: { name: "Calendar", icon: Calendar, color: "bg-blue-100 text-blue-700" },
  docs: { name: "Docs", icon: FileText, color: "bg-indigo-100 text-indigo-700" },
  slides: { name: "Slides", icon: Presentation, color: "bg-amber-100 text-amber-700" },
  drive: { name: "Drive", icon: HardDrive, color: "bg-emerald-100 text-emerald-700" },
  gmail: { name: "Gmail", icon: Mail, color: "bg-rose-100 text-rose-700" },
  meet: { name: "Meet", icon: Video, color: "bg-cyan-100 text-cyan-700" },
  tasks: { name: "Tasks", icon: CheckSquare, color: "bg-purple-100 text-purple-700" },
};

export default async function IntegrationsPage() {
  const session = await getServerSession(authOptions);
  const userId = session?.user?.id ?? "";

  const [bots, logs, totals] = await Promise.all([
    prisma.bot.findMany({
      where: { userId },
      select: {
        id: true,
        name: true,
        telegramBotUsername: true,
        integrations: true,
        form: { select: { title: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.integrationLog.findMany({
      where: { bot: { userId } },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { bot: { select: { telegramBotUsername: true } } },
    }),
    prisma.integrationLog.groupBy({
      by: ["service", "success"],
      where: { bot: { userId } },
      _count: true,
    }),
  ]);

  const totalsByService: Record<string, { ok: number; fail: number }> = {};
  for (const t of totals) {
    if (!totalsByService[t.service]) totalsByService[t.service] = { ok: 0, fail: 0 };
    if (t.success) totalsByService[t.service].ok = (t._count as number) || 0;
    else totalsByService[t.service].fail = (t._count as number) || 0;
  }

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Google integratsiyalar</h1>
        <p className="text-slate-500">
          Botlaringizni Google xizmatlariga ulang. Form botlari uchun javob kelganda, Workspace botlari esa interaktiv tarzda ishlaydi.
        </p>
      </div>

      <Card className="border-blue-200 bg-blue-50/50">
        <CardContent className="p-4 text-sm text-blue-900">
          <strong>Qanday yoqiladi?</strong> Pastdagi botingizni bosing → "Integratsiyalar" tab → kerakli
          xizmatlarni yoqing. Shundan keyin har bir keladigan javob avtomatik ravishda yoqilgan
          xizmatlarni ishga tushiradi.
        </CardContent>
      </Card>

      {/* Service totals */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {Object.entries(SERVICE_META).map(([key, meta]) => {
          const t = totalsByService[key] || { ok: 0, fail: 0 };
          const Icon = meta.icon;
          return (
            <Card key={key} className="border-none shadow-sm">
              <CardContent className="p-3 text-center">
                <div className={`w-10 h-10 rounded-xl mx-auto flex items-center justify-center mb-2 ${meta.color}`}>
                  <Icon size={18} />
                </div>
                <p className="text-xs font-bold">{meta.name}</p>
                <p className="text-[10px] text-slate-500">
                  ✓ {t.ok} · ✗ {t.fail}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Bots list */}
      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Botlaringiz</CardTitle>
          <CardDescription>Har bir bot uchun integratsiyalarni alohida sozlang.</CardDescription>
        </CardHeader>
        <CardContent>
          {bots.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-sm text-slate-500 mb-3">Hali botlar yo'q.</p>
              <Button asChild size="sm" className="rounded-full">
                <Link href="/dashboard/new">Yangi bot ulash</Link>
              </Button>
            </div>
          ) : (
            <ul className="space-y-2">
              {bots.map((b) => {
                const cfg = (b.integrations as Record<string, any>) || {};
                const enabled = Object.entries(cfg)
                  .filter(([, v]: any) => v?.enabled)
                  .map(([k]) => k);
                return (
                  <li key={b.id}>
                    <Link
                      href={`/dashboard/bot/${b.id}?tab=integrations`}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 border border-slate-100"
                    >
                      <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                        <Sparkles size={16} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-semibold text-sm truncate">
                          @{b.telegramBotUsername || b.name}
                        </p>
                          <p className="text-xs text-slate-500 truncate">{b.form?.title || "Workspace Bot"}</p>
                      </div>
                      <div className="flex items-center gap-1 flex-wrap justify-end">
                        {enabled.length === 0 ? (
                          <Badge variant="outline" className="text-[10px] text-slate-400">
                            Yoqilmagan
                          </Badge>
                        ) : (
                          enabled.map((k) => {
                            const m = SERVICE_META[k];
                            if (!m) return null;
                            const Icon = m.icon;
                            return (
                              <span
                                key={k}
                                className={`w-7 h-7 rounded-md flex items-center justify-center ${m.color}`}
                                title={m.name}
                              >
                                <Icon size={13} />
                              </span>
                            );
                          })
                        )}
                      </div>
                      <ArrowRight size={16} className="text-slate-400 shrink-0" />
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>

      {/* Recent logs */}
      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Oxirgi ishga tushishlar</CardTitle>
          <CardDescription>Barcha botlardagi avtomatik integratsiya yurishlari.</CardDescription>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <p className="text-sm text-slate-400 py-6 text-center">
              Hali log yo'q. Botingizga javob kelganda integratsiyalar avtomatik ishlaydi.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {logs.map((log) => {
                const meta = SERVICE_META[log.service];
                const Icon = meta?.icon || Sparkles;
                return (
                  <li key={log.id} className="flex items-center gap-3 py-2.5">
                    {log.success ? (
                      <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                    ) : (
                      <XCircle size={16} className="text-rose-500 shrink-0" />
                    )}
                    <div
                      className={`w-7 h-7 rounded-md flex items-center justify-center shrink-0 ${meta?.color || "bg-slate-100"
                        }`}
                    >
                      <Icon size={13} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold">{meta?.name || log.service}</span>
                        <span className="text-xs text-slate-400">
                          @{log.bot.telegramBotUsername || ""}
                        </span>
                        <span className="text-xs text-slate-400">
                          {new Date(log.createdAt).toLocaleString("uz-UZ", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                      {log.error && (
                        <p className="text-xs text-rose-600 mt-0.5 truncate">{log.error}</p>
                      )}
                    </div>
                    {log.resultUrl && (
                      <a
                        href={log.resultUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary font-semibold hover:underline flex items-center gap-1 shrink-0"
                      >
                        Ochish <ExternalLink size={11} />
                      </a>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
