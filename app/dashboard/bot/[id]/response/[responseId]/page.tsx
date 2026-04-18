import Link from "next/link";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, User2, Hash, Award } from "lucide-react";
import { parseForm, formatAnswerForDisplay, isAnswerCorrect } from "@/lib/formQuestions";

export default async function ResponseDetailPage({
  params,
}: {
  params: { id: string; responseId: string };
}) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) notFound();

  const response = await prisma.response.findUnique({
    where: { id: params.responseId },
    include: {
      bot: { include: { form: true } },
    },
  });

  if (!response || response.botId !== params.id || response.bot.userId !== session.user.id) {
    notFound();
  }

  const parsed = parseForm(response.bot.form.metadata);
  const questions = parsed.questions;
  const answers = (response.data as Record<string, any>) || {};

  let quizScore: { gained: number; total: number } | null = null;
  if (parsed.isQuiz) {
    let total = 0;
    let gained = 0;
    for (const q of questions) {
      if (!q.correctAnswers || q.correctAnswers.length === 0) continue;
      const pts = q.points ?? 1;
      total += pts;
      if (isAnswerCorrect(q, answers[q.questionId] ?? answers[q.title])) gained += pts;
    }
    quizScore = { gained, total };
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <Button variant="ghost" asChild className="gap-2 -ml-3 mb-3">
          <Link href={`/dashboard/bot/${params.id}`}>
            <ArrowLeft size={16} />
            Botga qaytish
          </Link>
        </Button>
        <h1 className="text-3xl font-bold tracking-tight">Javob tafsilotlari</h1>
        <p className="text-slate-500 text-lg">
          @{response.bot.telegramBotUsername} — {response.bot.form.title}
        </p>
      </div>

      <Card className="border-none shadow-sm">
        <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/5 text-primary rounded-lg">
              <Calendar size={18} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Qabul qilingan</p>
              <p className="font-medium">{new Date(response.createdAt).toLocaleString("uz-UZ")}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/5 text-primary rounded-lg">
              <User2 size={18} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Chat ID</p>
              <p className="font-medium">{response.chatId || "—"}</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="p-2 bg-primary/5 text-primary rounded-lg">
              <Hash size={18} />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Holat</p>
              <Badge
                variant="outline"
                className={
                  response.status === "completed"
                    ? "text-green-700 bg-green-50 border-green-100"
                    : "text-yellow-700 bg-yellow-50 border-yellow-100"
                }
              >
                {response.status === "completed" ? "Tugatildi" : "Jarayonda"}
              </Badge>
            </div>
          </div>
          {quizScore && (
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-100 text-amber-700 rounded-lg">
                <Award size={18} />
              </div>
              <div>
                <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Test balli</p>
                <p className="font-bold text-amber-700">
                  {quizScore.gained} / {quizScore.total}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-none shadow-md">
        <CardHeader>
          <CardTitle>Javoblar</CardTitle>
          <CardDescription>Foydalanuvchi savollarga bergan javoblari.</CardDescription>
        </CardHeader>
        <CardContent>
          {questions.length === 0 ? (
            <p className="text-slate-400 text-center py-8">Bu formada savollar yo'q.</p>
          ) : (
            <div className="space-y-4">
              {questions.map((q, i) => {
                const raw = answers[q.questionId] ?? answers[q.title];
                const value = formatAnswerForDisplay(raw);
                const hasAnswer = value !== "";
                const hasGrading = q.correctAnswers && q.correctAnswers.length > 0;
                const correct = hasGrading ? isAnswerCorrect(q, raw) : null;

                return (
                  <div
                    key={q.questionId || i}
                    className="flex gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50/50"
                  >
                    <div className="w-8 h-8 rounded-full bg-white border flex items-center justify-center font-bold text-slate-400 flex-shrink-0">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start gap-2 flex-wrap">
                        <p className="font-semibold text-slate-900">{q.title}</p>
                        {q.required && (
                          <Badge variant="outline" className="text-xs bg-red-50 text-red-600 border-red-100">
                            Majburiy
                          </Badge>
                        )}
                        {typeof q.points === "number" && (
                          <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
                            {q.points} ball
                          </Badge>
                        )}
                      </div>
                      {q.description && (
                        <p className="text-sm text-slate-500 mt-1">{q.description}</p>
                      )}
                      <div
                        className={`mt-3 p-3 rounded-lg border ${
                          correct === true
                            ? "bg-green-50 border-green-100"
                            : correct === false
                            ? "bg-red-50 border-red-100"
                            : "bg-white border-slate-100"
                        }`}
                      >
                        {hasAnswer ? (
                          <p className="text-slate-900 whitespace-pre-wrap break-words">{value}</p>
                        ) : (
                          <p className="text-slate-400 italic">Javob berilmagan</p>
                        )}
                        {correct === false && q.correctAnswers && (
                          <p className="text-xs text-slate-500 mt-2">
                            To'g'ri javob:{" "}
                            <span className="font-semibold">{q.correctAnswers.join(", ")}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
