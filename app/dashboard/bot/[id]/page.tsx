import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bot as BotIcon, MessageSquare, ListTodo, Settings, ExternalLink } from "lucide-react";
import { BotSettingsPanel } from "@/components/dashboard/BotSettingsPanel";
import { ResponsesTable } from "@/components/dashboard/ResponsesTable";

export default async function BotDetailPage({ params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  
  const bot = await prisma.bot.findUnique({
    where: { id: params.id, userId: session?.user?.id },
    include: {
      form: true,
      responses: {
        orderBy: { createdAt: "desc" }
      }
    }
  });

  if (!bot) {
    notFound();
  }

  const formMetadata = bot.form.metadata as any;
  const questions = formMetadata?.items || [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary text-white rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20">
            <BotIcon size={28} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight">@{bot.telegramBotUsername}</h1>
              <Badge variant={bot.status === "active" ? "default" : "secondary"}>
                {bot.status === "active" ? "Aktiv" : "Faol emas"}
              </Badge>
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
            <CardTitle className="text-3xl font-bold">{bot.responses.length}</CardTitle>
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
                ? new Date(bot.responses[0].createdAt).toLocaleDateString()
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
            responses={bot.responses} 
            questions={questions}
            botName={bot.telegramBotUsername || "bot"} 
          />
        </TabsContent>

        <TabsContent value="questions" className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {questions.map((q: any, i: number) => (
              <Card key={i} className="border-none shadow-sm h-full">
                <CardContent className="p-6 flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold flex-shrink-0">
                    {i + 1}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-800 break-words">{q.title}</p>
                    {q.description && <p className="text-sm text-slate-500 mt-1 line-clamp-2">{q.description}</p>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
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
