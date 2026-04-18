import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Bot as BotIcon,
  MessageSquare,
  ListTodo,
  Settings,
  ExternalLink,
  Award,
  ArrowLeft,
} from "lucide-react";
import { BotSettingsPanel } from "@/components/dashboard/BotSettingsPanel";
import { ResponsesTable } from "@/components/dashboard/ResponsesTable";
import { BotHeaderActions } from "@/components/dashboard/BotHeaderActions";
import { parseForm } from "@/lib/formQuestions";
import { RealTimeRefresh } from "@/components/dashboard/RealTimeRefresh";
import { ResponsesList } from "@/components/dashboard/ResponsesList";

const TYPE_LABEL: Record<string, string> = {
  short: "Qisqa javob",
  paragraph: "Uzun matn",
  radio: "Bitta tanlov",
  checkbox: "Bir nechta tanlov",
  dropdown: "Ro'yxat (dropdown)",
  scale: "Baholash shkalasi",
  date: "Sana",
  time: "Vaqt",
  fileUpload: "Fayl yuklash",
  unknown: "Boshqa",
};

export default async function BotDetailPage({
  params,
  searchParams,
}: {
  params: { id: string };
  searchParams?: { tab?: string };
}) {
  const session = await getServerSession(authOptions);

  const bot = await prisma.bot.findUnique({
    where: { id: params.id, userId: session?.user?.id },
    include: {
      form: true,
      responses: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!bot) notFound();

  const parsed = parseForm(bot.form.metadata);
  const questions = parsed.questions;
  const completedResponses = bot.responses.filter((r) => r.status === "completed");
  const activeTab = ["responses", "questions", "settings"].includes(searchParams?.tab || "")
    ? searchParams!.tab!
    : "responses";

  return (
    <div className="flex flex-col gap-5 w-full min-w-0">
      {/* Back button */}
      <Button variant="ghost" asChild className="gap-2 w-fit -ml-2">
        <Link href="/dashboard/bots">
          <ArrowLeft size={16} />
          Orqaga
        </Link>
      </Button>

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-md shrink-0 ${
              bot.status === "active"
                ? "bg-primary text-white shadow-primary/20"
                : "bg-slate-200 text-slate-400"
            }`}
          >
            <BotIcon size={22} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-3">
              <h1 className="text-xl md:text-2xl font-bold tracking-tight truncate">
                @{bot.telegramBotUsername}
              </h1>
              <Badge
                variant={bot.status === "active" ? "default" : "secondary"}
                className={bot.status === "active" ? "bg-blue-600" : ""}
              >
                {bot.status === "active" ? "Aktiv" : "To'xtatilgan"}
              </Badge>
              <RealTimeRefresh intervalMs={10000} />
            </div>
            <div className="flex items-center gap-2 flex-wrap mt-1">
              {parsed.isQuiz && (
                <Badge
                  variant="outline"
                  className="bg-amber-50 text-amber-700 border-amber-200 gap-1 text-xs"
                >
                  <Award size={11} /> Test rejimi
                </Badge>
              )}
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 truncate">
              <ExternalLink size={12} />
              {bot.form.title}
            </p>
          </div>
        </div>
        <BotHeaderActions
          botId={bot.id}
          initialStatus={bot.status}
          telegramUsername={bot.telegramBotUsername}
        />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MiniStat label="Jami javoblar" value={completedResponses.length} />
        <MiniStat label="Savollar" value={questions.length} />
        <MiniStat
          label="Oxirgi faollik"
          value={
            bot.responses.length > 0
              ? new Date(bot.responses[0].createdAt).toLocaleDateString("uz-UZ", {
                  month: "short",
                  day: "numeric",
                })
              : "—"
          }
          small
        />
        <MiniStat
          label="Yaratilgan"
          value={new Date(bot.createdAt).toLocaleDateString("uz-UZ", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
          small
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue={activeTab} className="w-full">
        <div className="flex justify-start">
          <TabsList className="bg-slate-100 p-1 rounded-full h-11">
            <TabsTrigger value="responses" className="rounded-full px-5 gap-2 text-sm">
              <MessageSquare size={14} />
              Javoblar
              <span className="text-xs text-slate-400">({completedResponses.length})</span>
            </TabsTrigger>
            <TabsTrigger value="questions" className="rounded-full px-5 gap-2 text-sm">
              <ListTodo size={14} />
              Savollar
              <span className="text-xs text-slate-400">({questions.length})</span>
            </TabsTrigger>
            <TabsTrigger value="settings" className="rounded-full px-5 gap-2 text-sm">
              <Settings size={14} />
              Sozlamalar
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="responses" className="w-full mt-5">
          {completedResponses.length === 0 ? (
            <Card className="border-dashed border-2 bg-transparent">
              <CardContent className="py-14 text-center text-slate-500 text-sm">
                Hozircha javoblar mavjud emas.
              </CardContent>
            </Card>
          ) : (
            <ResponsesList responses={completedResponses} bot={bot} />
          )}
        </TabsContent>

        <TabsContent value="questions" className="w-full mt-5">
          {questions.length === 0 ? (
            <Card className="border-dashed border-2 bg-transparent">
              <CardContent className="py-14 text-center text-slate-500 text-sm">
                Bu formada hali savollar yo'q.
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {questions.map((q, i) => (
                <Card key={q.questionId || i} className="border-none shadow-sm h-full">
                  <CardContent className="p-4 flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold flex-shrink-0 text-sm">
                      {i + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-800 break-words text-sm">
                        {q.title}
                      </p>
                      {q.description && (
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">
                          {q.description}
                        </p>
                      )}
                      <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                        <Badge variant="secondary" className="rounded-full text-xs font-normal">
                          {TYPE_LABEL[q.type] || q.type}
                        </Badge>
                        {q.required && (
                          <Badge
                            variant="outline"
                            className="rounded-full text-xs font-normal bg-red-50 text-red-600 border-red-100"
                          >
                            Majburiy
                          </Badge>
                        )}
                        {typeof q.points === "number" && (
                          <Badge
                            variant="outline"
                            className="rounded-full text-xs font-normal bg-amber-50 text-amber-700 border-amber-200"
                          >
                            {q.points} ball
                          </Badge>
                        )}
                      </div>
                      {q.options && q.options.length > 0 && (
                        <ul className="mt-2 space-y-0.5 text-xs text-slate-500">
                          {q.options.slice(0, 3).map((o, oi) => (
                            <li key={oi} className="flex items-center gap-1.5">
                              <span className="w-1 h-1 rounded-full bg-slate-300" />
                              <span className="truncate">{o.value}</span>
                              {o.isCorrect && <span className="text-green-600">✓</span>}
                            </li>
                          ))}
                          {q.options.length > 3 && (
                            <li className="text-slate-400">+{q.options.length - 3} boshqa</li>
                          )}
                        </ul>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="settings" className="w-full mt-5">
          <div className="max-w-3xl mx-auto">
            <BotSettingsPanel
              botId={bot.id}
              initialStatus={bot.status}
              currentFormTitle={bot.form.title}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function MiniStat({
  label,
  value,
  small = false,
}: {
  label: string;
  value: number | string;
  small?: boolean;
}) {
  return (
    <Card className="border-none shadow-sm bg-white">
      <CardContent className="p-3">
        <p className="text-xs text-slate-500 font-medium">{label}</p>
        <p className={small ? "text-sm font-semibold mt-0.5" : "text-xl font-bold mt-0.5"}>
          {value}
        </p>
      </CardContent>
    </Card>
  );
}
