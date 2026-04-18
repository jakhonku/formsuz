import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bot as BotIcon, MessageSquare, ListTodo, Settings, ExternalLink, Award } from "lucide-react";
import { BotSettingsPanel } from "@/components/dashboard/BotSettingsPanel";
import { ResponsesTable } from "@/components/dashboard/ResponsesTable";
import { parseForm } from "@/lib/formQuestions";

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

export default async function BotDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);

  const bot = await prisma.bot.findUnique({
    where: { id: params.id, userId: session?.user?.id },
    include: {
      form: true,
      responses: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!bot) {
    notFound();
  }

  const parsed = parseForm(bot.form.metadata);
  const questions = parsed.questions;
  const completedResponses = bot.responses.filter((r) => r.status === "completed");

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
            <BotIcon size={28} />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold tracking-tight">@{bot.telegramBotUsername}</h1>
              <Badge variant={bot.status === "active" ? "default" : "secondary"}>
                {bot.status === "active" ? "Aktiv" : "Faol emas"}
              </Badge>
              {parsed.isQuiz && (
                <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 gap-1">
                  <Award size={12} /> Test rejimi
                </Badge>
              )}
            </div>
            <p className="text-slate-500 flex items-center gap-1">
              <ExternalLink size={14} />
              {bot.form.title}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild className="rounded-full">
            <a href={`https://t.me/${bot.telegramBotUsername}`} target="_blank" rel="noreferrer">
              Botga o'tish
            </a>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="font-medium uppercase tracking-wider text-xs">Jami javoblar</CardDescription>
            <CardTitle className="text-3xl font-bold">{completedResponses.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="font-medium uppercase tracking-wider text-xs">Savollar soni</CardDescription>
            <CardTitle className="text-3xl font-bold">{questions.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="font-medium uppercase tracking-wider text-xs">Oxirgi faollik</CardDescription>
            <CardTitle className="text-xl font-bold">
              {bot.responses.length > 0
                ? new Date(bot.responses[0].createdAt).toLocaleDateString("uz-UZ")
                : "Hali yo'q"}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Tabs Section */}
      <Tabs defaultValue="responses" className="w-full">
        <div className="flex justify-center mb-6">
          <TabsList className="bg-slate-100 p-1 rounded-full h-12">
            <TabsTrigger value="responses" className="rounded-full px-8 gap-2">
              <MessageSquare size={16} />
              Javoblar
            </TabsTrigger>
            <TabsTrigger value="questions" className="rounded-full px-8 gap-2">
              <ListTodo size={16} />
              Savollar
            </TabsTrigger>
            <TabsTrigger value="settings" className="rounded-full px-8 gap-2">
              <Settings size={16} />
              Sozlamalar
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="responses" className="w-full">
          <ResponsesTable
            responses={completedResponses}
            questions={questions}
            botName={bot.telegramBotUsername || "bot"}
            isQuiz={parsed.isQuiz}
          />
        </TabsContent>

        <TabsContent value="questions" className="w-full">
          {questions.length === 0 ? (
            <Card className="border-dashed border-2 bg-transparent">
              <CardContent className="py-16 text-center text-slate-500">
                Bu formada hali savollar yo'q.
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {questions.map((q, i) => (
                <Card key={q.questionId || i} className="border-none shadow-sm h-full">
                  <CardContent className="p-6 flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold flex-shrink-0">
                      {i + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-slate-800 break-words">{q.title}</p>
                      {q.description && (
                        <p className="text-sm text-slate-500 mt-1 line-clamp-2">{q.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <Badge variant="secondary" className="rounded-full text-xs font-normal">
                          {TYPE_LABEL[q.type] || q.type}
                        </Badge>
                        {q.required && (
                          <Badge variant="outline" className="rounded-full text-xs font-normal bg-red-50 text-red-600 border-red-100">
                            Majburiy
                          </Badge>
                        )}
                        {typeof q.points === "number" && (
                          <Badge variant="outline" className="rounded-full text-xs font-normal bg-amber-50 text-amber-700 border-amber-200">
                            {q.points} ball
                          </Badge>
                        )}
                      </div>
                      {q.options && q.options.length > 0 && (
                        <ul className="mt-3 space-y-1 text-xs text-slate-500">
                          {q.options.slice(0, 5).map((o, oi) => (
                            <li key={oi} className="flex items-center gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                              <span className="truncate">{o.value}</span>
                              {o.isCorrect && <span className="text-green-600">✓</span>}
                            </li>
                          ))}
                          {q.options.length > 5 && (
                            <li className="text-slate-400">+{q.options.length - 5} boshqa</li>
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

        <TabsContent value="settings" className="w-full">
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
