import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlusCircle, Bot, MessageSquare, ExternalLink } from "lucide-react";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  
  const bots = await prisma.bot.findMany({
    where: { userId: session?.user?.id },
    include: {
      form: true,
      _count: {
        select: { responses: true }
      }
    },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Xush kelibsiz, {session?.user?.name}!</h1>
          <p className="text-slate-500 text-lg">Barcha botlaringiz va ulangan formalaringiz shu yerda.</p>
        </div>
        <Button size="lg" asChild className="rounded-full shadow-lg shadow-primary/20 gap-2 h-12 px-6">
          <Link href="/dashboard/new">
            <PlusCircle className="h-5 w-5" />
            Yangi bot ulash
          </Link>
        </Button>
      </div>

      {bots.length === 0 ? (
        <Card className="border-dashed border-2 bg-transparent">
          <CardContent className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-6">
              <Bot className="h-10 w-10 text-slate-400" />
            </div>
            <h3 className="text-2xl font-semibold mb-2">Hali botlar yo'q</h3>
            <p className="text-slate-500 max-w-sm mb-8">
              Siz hali hech qanday Google Formni Telegram botga ulamagansiz. Boshlash uchun tugmani bosing.
            </p>
            <Button asChild size="lg" className="rounded-full">
              <Link href="/dashboard/new">Yangi bot ulash</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {bots.map((bot) => (
            <Card key={bot.id} className="group hover:shadow-xl transition-all duration-300 border-none shadow-sm overflow-hidden bg-white">
              <CardHeader className="pb-4">
                <div className="flex justify-between items-start mb-2">
                  <div className="p-2 bg-primary/5 text-primary rounded-lg group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                    <Bot size={24} />
                  </div>
                  <Badge variant={bot.status === "active" ? "default" : "secondary"} className="rounded-full">
                    {bot.status === "active" ? "Aktiv" : "Faol emas"}
                  </Badge>
                </div>
                <CardTitle className="text-xl font-bold truncate">@{bot.telegramBotUsername || bot.name}</CardTitle>
                <div className="flex items-center text-sm text-slate-500 gap-1">
                  <ExternalLink size={14} />
                  <span className="truncate">{bot.form.title}</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Javoblar</span>
                    <div className="flex items-center gap-2 mt-1">
                      <MessageSquare size={16} className="text-primary" />
                      <span className="text-2xl font-bold text-slate-900">{bot._count.responses}</span>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" asChild className="text-primary hover:text-primary hover:bg-primary/10">
                    <Link href={`/dashboard/bot/${bot.id}`}>Batafsil</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
