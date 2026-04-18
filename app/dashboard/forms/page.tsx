import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText, Bot as BotIcon, PlusCircle, ExternalLink } from "lucide-react";

export default async function FormsPage() {
  const session = await getServerSession(authOptions);

  const forms = await prisma.form.findMany({
    where: { userId: session?.user?.id },
    include: {
      bots: { select: { id: true, telegramBotUsername: true, status: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Google Formlar </h1>
          <p className="text-slate-500 text-lg">Platformaga ulangan formalaringiz.</p>
        </div>
        <Button size="lg" asChild className="rounded-full shadow-lg shadow-primary/20 gap-2 h-12 px-6">
          <Link href="/dashboard/new">
            <PlusCircle className="h-5 w-5" />
            Yangi ulash
          </Link>
        </Button>
      </div>

      {forms.length === 0 ? (
        <Card className="border-dashed border-2 bg-transparent">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
              <FileText className="h-10 w-10 text-slate-400" />
            </div>
            <h3 className="text-2xl font-semibold mb-2">Formalar ulanmagan</h3>
            <p className="text-slate-500 max-w-sm mb-8">
              Botlar ulaganingizda bu yerda Google Formlaringiz ko'rinadi.
            </p>
            <Button asChild size="lg" className="rounded-full">
              <Link href="/dashboard/new">Bot ulash</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {forms.map((form) => (
            <Card key={form.id} className="border-none shadow-sm hover:shadow-md transition">
              <CardHeader>
                <div className="flex justify-between items-start gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="p-2 bg-primary/5 text-primary rounded-lg flex-shrink-0">
                      <FileText size={24} />
                    </div>
                    <CardTitle className="text-lg font-bold truncate">{form.title}</CardTitle>
                  </div>
                  <Button variant="ghost" size="sm" asChild>
                    <a
                      href={`https://docs.google.com/forms/d/${form.googleFormId}/edit`}
                      target="_blank"
                      rel="noreferrer"
                      className="gap-1"
                    >
                      <ExternalLink size={14} />
                      Ochish
                    </a>
                  </Button>
                </div>
                <CardDescription>
                  {form.bots.length > 0
                    ? `${form.bots.length} ta bot ulangan`
                    : "Hech bir botga ulanmagan"}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {form.bots.length > 0 ? (
                  <div className="space-y-2">
                    {form.bots.map((b) => (
                      <Link
                        key={b.id}
                        href={`/dashboard/bot/${b.id}`}
                        className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <BotIcon size={16} className="text-primary flex-shrink-0" />
                          <span className="font-medium truncate">@{b.telegramBotUsername}</span>
                        </div>
                        <Badge
                          variant={b.status === "active" ? "default" : "secondary"}
                          className="rounded-full text-xs"
                        >
                          {b.status === "active" ? "Aktiv" : "Faol emas"}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-400">Bot ulash uchun yangi wizard'ni boshlang.</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
