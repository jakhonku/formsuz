import Link from "next/link";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, User2, Award, Download } from "lucide-react";
import { parseForm, formatAnswerForDisplay, isAnswerCorrect } from "@/lib/formQuestions";
import { ResponseDownloadButton } from "@/components/dashboard/ResponseDownloadButton";

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

  // Prepare data for download
  const responseData = questions.map((q, i) => {
    const raw = answers[q.questionId] ?? answers[q.title];
    const value = formatAnswerForDisplay(raw);
    const correct =
      q.correctAnswers && q.correctAnswers.length > 0 ? isAnswerCorrect(q, raw) : null;
    return {
      index: i + 1,
      question: q.title,
      answer: value || "Javob berilmagan",
      correct,
      correctAnswer: q.correctAnswers?.join(", ") || null,
      points: q.points,
    };
  });

  return (
    <div className="w-full min-w-0">
      {/* Top bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" asChild className="gap-2 -ml-2">
            <Link href={`/dashboard/bot/${params.id}`}>
              <ArrowLeft size={16} />
              Orqaga
            </Link>
          </Button>
          <div className="h-6 w-px bg-slate-200" />
          <div>
            <h1 className="text-lg font-bold">Javob tafsilotlari</h1>
            <p className="text-xs text-slate-500">
              @{response.bot.telegramBotUsername} — {response.bot.form.title}
            </p>
          </div>
        </div>
        <ResponseDownloadButton
          botName={response.bot.telegramBotUsername || "bot"}
          responseData={JSON.stringify(responseData)}
          date={response.createdAt.toISOString()}
        />
      </div>

      {/* Info strip */}
      <div className="flex flex-wrap items-center gap-4 mb-6 text-sm">
        <div className="flex items-center gap-2 text-slate-600">
          <Calendar size={14} className="text-slate-400" />
          <span>{new Date(response.createdAt).toLocaleString("uz-UZ")}</span>
        </div>
        <div className="flex items-center gap-2 text-slate-600">
          <User2 size={14} className="text-slate-400" />
          <code className="text-xs bg-slate-100 px-2 py-0.5 rounded">{response.chatId || "—"}</code>
        </div>
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
        {quizScore && (
          <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200 gap-1">
            <Award size={12} />
            {quizScore.gained} / {quizScore.total} ball
          </Badge>
        )}
      </div>

      {/* Google Sheets-like table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-4 py-3 w-12">
                  #
                </th>
                <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-4 py-3">
                  Savol
                </th>
                <th className="text-left text-xs font-bold text-slate-500 uppercase tracking-wider px-4 py-3">
                  Javob
                </th>
                {parsed.isQuiz && (
                  <th className="text-center text-xs font-bold text-slate-500 uppercase tracking-wider px-4 py-3 w-24">
                    Natija
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {questions.map((q, i) => {
                const raw = answers[q.questionId] ?? answers[q.title];
                const value = formatAnswerForDisplay(raw);
                const hasAnswer = value !== "";
                const hasGrading = q.correctAnswers && q.correctAnswers.length > 0;
                const correct = hasGrading ? isAnswerCorrect(q, raw) : null;

                return (
                  <tr
                    key={q.questionId || i}
                    className={`border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors ${
                      correct === true
                        ? "bg-green-50/30"
                        : correct === false
                        ? "bg-red-50/30"
                        : ""
                    }`}
                  >
                    <td className="px-4 py-3 text-sm font-medium text-slate-400 align-top">
                      {i + 1}
                    </td>
                    <td className="px-4 py-3 align-top">
                      <p className="font-medium text-slate-900 text-sm">{q.title}</p>
                      {q.description && (
                        <p className="text-xs text-slate-400 mt-0.5">{q.description}</p>
                      )}
                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        {q.required && (
                          <span className="text-[10px] text-red-500 font-medium">Majburiy</span>
                        )}
                        {typeof q.points === "number" && (
                          <span className="text-[10px] text-amber-600 font-medium">
                            {q.points} ball
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 align-top">
                      {hasAnswer ? (
                        <p className="text-sm text-slate-800 whitespace-pre-wrap break-words">
                          {value}
                        </p>
                      ) : (
                        <p className="text-sm text-slate-300 italic">Javob berilmagan</p>
                      )}
                      {correct === false && q.correctAnswers && (
                        <p className="text-xs text-green-600 mt-1">
                          ✓ To&apos;g&apos;ri: {q.correctAnswers.join(", ")}
                        </p>
                      )}
                    </td>
                    {parsed.isQuiz && (
                      <td className="px-4 py-3 text-center align-top">
                        {correct === true && (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-green-100 text-green-700 text-sm font-bold">
                            ✓
                          </span>
                        )}
                        {correct === false && (
                          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-red-100 text-red-600 text-sm font-bold">
                            ✗
                          </span>
                        )}
                        {correct === null && (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
