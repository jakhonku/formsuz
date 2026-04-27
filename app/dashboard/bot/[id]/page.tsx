import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

export default async function BotDetailPage({ params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);
    const bot = await prisma.bot.findUnique({
      where: { id: params.id, userId: session?.user?.id },
      include: { form: true }
    });

    if (!bot) return notFound();

    return (
      <div className="p-10">
        <h1 className="text-2xl font-bold">Bot Debug Sahifasi</h1>
        <p>Bot ID: {bot.id}</p>
        <p>Bot Username: @{bot.telegramBotUsername}</p>
        <p>Bot Type: {bot.type || "Noma'lum"}</p>
        <p>Form: {bot.form?.title || "Workspace Bot"}</p>
        <div className="mt-4 p-4 bg-slate-100 rounded">
          <p className="text-xs font-mono">Agar ushbu sahifani ko'rayotgan bo'lsangiz, demak baza bilan ulanish yaxshi. Muammo murakkab komponentlarda.</p>
        </div>
      </div>
    );
  } catch (error: any) {
    return (
      <div className="p-10 text-red-600">
        <h1 className="text-2xl font-bold">Server Xatosi (Debug)</h1>
        <pre className="mt-4 p-4 bg-red-50 rounded text-xs">
          {error.message}
          {error.stack}
        </pre>
      </div>
    );
  }
}
