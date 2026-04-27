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
  Sparkles,
  HardDrive,
  Zap,
} from "lucide-react";
import { BotSettingsPanel } from "@/components/dashboard/BotSettingsPanel";
import { BotHeaderActions } from "@/components/dashboard/BotHeaderActions";
import { BotIntegrationsPanel } from "@/components/dashboard/BotIntegrationsPanel";
import { parseForm } from "@/lib/formQuestions";
import { RealTimeRefresh } from "@/components/dashboard/RealTimeRefresh";
import { ResponsesList } from "@/components/dashboard/ResponsesList";
import { WorkspaceManager } from "@/components/dashboard/WorkspaceManager";

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
      responses: {
        where: { status: "completed" },
        orderBy: { createdAt: "desc" },
        take: 20,
      },
      _count: { select: { responses: { where: { status: "completed" } } } },
    },
  });

  if (!bot) notFound();

  const isWorkspaceBot = !bot.formId;
  const parsed = bot.form ? parseForm(bot.form.metadata) : { questions: [], isQuiz: false };
  const questions = parsed.questions;
  const completedResponses = bot.responses || [];
  const totalCompleted = bot._count?.responses || 0;
  const ownerEmail = session?.user?.email || null;
  const activeTab = ["responses", "workspace", "integrations", "settings"].includes(searchParams?.tab || "")
    ? searchParams!.tab!
    : isWorkspaceBot ? "workspace" : "responses";

  const formatDate = (date: any) => {
    try {
      return new Date(date).toISOString().split('T')[0];
    } catch {
      return "---";
    }
  };

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
              <RealTimeRefresh intervalMs={60000} />
            </div>
            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5 truncate">
              {bot.form ? (
                <>
                  <ExternalLink size={12} />
                  {bot.form.title}
                </>
              ) : (
                <>
                  <Sparkles size={12} className="text-primary" />
                  {bot.type} Bot
                </>
              )}
            </p>
          </div>
        </div>
        <BotHeaderActions
          botId={bot.id}
          initialStatus={bot.status}
          telegramUsername={bot.telegramBotUsername}
          isWorkspace={isWorkspaceBot}
        />
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <MiniStat label="Jami javoblar" value={totalCompleted} />
        <MiniStat label="Status" value={bot.status === 'active' ? 'Aktiv' : 'O\'chiq'} />
        <MiniStat
          label="Oxirgi faollik"
          value={completedResponses.length > 0 ? formatDate(completedResponses[0].createdAt) : "---"}
          small
        />
        <MiniStat label="Yaratilgan" value={formatDate(bot.createdAt)} small />
      </div>

      {/* Tabs */}
      <Tabs defaultValue={activeTab} className="w-full">
        <div className="flex justify-start">
          <TabsList className="bg-slate-100 p-1 rounded-full h-11">
            {isWorkspaceBot ? (
              <TabsTrigger value="workspace" className="rounded-full px-5 gap-2 text-sm">
                <HardDrive size={14} />
                Boshqaruv
              </TabsTrigger>
            ) : (
              <TabsTrigger value="responses" className="rounded-full px-5 gap-2 text-sm">
                <MessageSquare size={14} />
                Javoblar
              </TabsTrigger>
            )}

            <TabsTrigger value="integrations" className="rounded-full px-5 gap-2 text-sm">
              <Zap size={14} />
              Integratsiyalar
            </TabsTrigger>

            <TabsTrigger value="settings" className="rounded-full px-5 gap-2 text-sm">
              <Settings size={14} />
              Sozlamalar
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="responses" className="w-full mt-5">
           {completedResponses.length === 0 ? (
             <p className="text-center py-10 text-slate-400">Hozircha ma'lumot yo'q</p>
           ) : (
             <ResponsesList responses={completedResponses} bot={bot} />
           )}
        </TabsContent>

        <TabsContent value="workspace" className="w-full mt-5">
           <WorkspaceManager
              botId={bot.id}
              botType={bot.type}
              config={(bot.workspaceConfig as any) || {}}
           />
        </TabsContent>

        <TabsContent value="integrations" className="w-full mt-5">
          <BotIntegrationsPanel botId={bot.id} ownerEmail={ownerEmail} />
        </TabsContent>

        <TabsContent value="settings" className="w-full mt-5">
          <div className="max-w-3xl mx-auto">
            <BotSettingsPanel
              botId={bot.id}
              initialStatus={bot.status}
              currentFormTitle={bot.form?.title || "Workspace Bot"}
              isWorkspace={isWorkspaceBot}
            />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function MiniStat({ label, value, small = false }: any) {
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
