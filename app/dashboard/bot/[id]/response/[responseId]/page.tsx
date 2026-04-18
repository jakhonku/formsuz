import Link from "next/link";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Calendar, User2, Hash } from "lucide-react";

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

  const formMetadata = response.bot.form.metadata as any;
  const items = (formMetadata?.items || []) as any[];
  const answers = (response.data as Record<string, any>) || {};

  const questions = items
    .filter((it) => it.questionItem?.question)
    .map((it, idx) => ({
      index: idx,
      title: it.title || `Savol ${idx + 1}`,
      description: it.description || null,
      questionId: it.questionItem?.question?.questionId,
    }));

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
        <p className="text-slate-500 text-lg">@{response.bot.telegramBotUsername} — {response.bot.form.title}</p>
      </div>

      <Card className="border-none shadow-sm">
        <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
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
        </CardContent>
      </Card>

      <Card className="border-none shadow-md">
        <CardHeader>
          <CardTitle>Javoblar</CardTitle>
          <CardDescription>Foydalanuvchi savollarga bergan javoblari ro'yxati.</CardDescription>
        </CardHeader>
        <CardContent>
          {questions.length === 0 ? (
            <p className="text-slate-400 text-center py-8">Bu formada savollar yo'q.</p>
          ) : (
            <div className="space-y-4">
              {questions.map((q, i) => {
                const raw =
                  (q.questionId && answers[q.questionId]) ??
                  answers[String(i)] ??
                  answers[q.title];
                const value =
                  raw == null
                    ? null
                    : typeof raw === "string"
                    ? raw
                    : Array.isArray(raw)
                    ? raw.join(", ")
                    : typeof raw === "object"
                    ? JSON.stringify(raw)
                    : String(raw);

                return (
                  <div
                    key={i}
                    className="flex gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50/50"
                  >
                    <div className="w-8 h-8 rounded-full bg-white border flex items-center justify-center font-bold text-slate-400 flex-shrink-0">
                      {i + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-900">{q.title}</p>
                      {q.description && (
                        <p className="text-sm text-slate-500 mt-1">{q.description}</p>
                      )}
                      <div className="mt-3 p-3 bg-white rounded-lg border border-slate-100">
                        {value ? (
                          <p className="text-slate-900 whitespace-pre-wrap break-words">{value}</p>
                        ) : (
                          <p className="text-slate-400 italic">Javob berilmagan</p>
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
