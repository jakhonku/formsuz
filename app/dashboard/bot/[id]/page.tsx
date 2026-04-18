import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Bot as BotIcon, MessageSquare, ListTodo, Settings, Trash2, ExternalLink } from "lucide-react";

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

      {/* Tabs */}
      <Tabs defaultValue="responses" className="w-full">
        <TabsList className="bg-slate-100 p-1 rounded-full mb-8">
          <TabsTrigger value="responses" className="rounded-full px-6 gap-2">
            <MessageSquare size={16} />
            Javoblar
          </TabsTrigger>
          <TabsTrigger value="questions" className="rounded-full px-6 gap-2">
            <ListTodo size={16} />
            Savollar
          </TabsTrigger>
          <TabsTrigger value="settings" className="rounded-full px-6 gap-2">
            <Settings size={16} />
            Sozlamalar
          </TabsTrigger>
        </TabsList>

        <TabsContent value="responses">
          <Card className="border-none shadow-md overflow-hidden">
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-slate-50">
                  <TableRow>
                    <TableHead className="w-[180px]">Sana</TableHead>
                    <TableHead>Foydalanuvchi (Chat ID)</TableHead>
                    <TableHead className="w-[100px] text-right">Amal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {bot.responses.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-12 text-slate-400">
                        Hali hech qanday javob kelmagan.
                      </TableCell>
                    </TableRow>
                  ) : (
                    bot.responses.map((resp) => (
                      <TableRow key={resp.id}>
                        <TableCell className="font-medium">
                          {new Date(resp.createdAt).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          User: {resp.chatId}
                          {resp.status === "in_progress" && (
                            <Badge variant="outline" className="ml-2 text-yellow-600 bg-yellow-50">Jarayonda</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm">Batafsil</Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="questions">
          <Card className="border-none shadow-md">
            <CardHeader>
              <CardTitle>Forma savollari</CardTitle>
              <CardDescription>Ushbu bot orqali foydalanuvchilarga beriladigan savollar ro'yxati.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {questions.map((q: any, i: number) => (
                  <div key={i} className="flex gap-4 p-4 rounded-xl border border-slate-100 bg-slate-50/50">
                    <div className="w-8 h-8 rounded-full bg-white border flex items-center justify-center font-bold text-slate-400 flex-shrink-0">
                      {i + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{q.title}</p>
                      {q.description && <p className="text-sm text-slate-500 mt-1">{q.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="border-none shadow-md">
              <CardHeader>
                <CardTitle>Bot Holati</CardTitle>
                <CardDescription>Botni vaqtincha to'xtatib qo'yishingiz mumkin.</CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <span className="font-medium">Botni faollashtirish</span>
                {/* Switch would go here, using a static badge for now */}
                <Badge className="bg-green-500">Aktiv</Badge>
              </CardContent>
            </Card>

            <Card className="border-red-100 border-2 shadow-md bg-red-50/20">
              <CardHeader>
                <CardTitle className="text-red-600">Xavfli hudud</CardTitle>
                <CardDescription>Botni o'chirish qayta tiklanmaydi.</CardDescription>
              </CardHeader>
              <CardContent>
                <Button variant="destructive" className="w-full gap-2 rounded-full h-12">
                  <Trash2 size={18} />
                  Botni butunlay o'chirish
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
