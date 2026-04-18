"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  Bot as BotIcon,
  MessageSquare,
  ExternalLink,
  Play,
  Pause,
  Settings,
  Trash2,
  RefreshCw,
  Loader2,
  Send,
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export type BotCardData = {
  id: string;
  telegramBotUsername: string | null;
  name: string;
  status: string;
  responsesCount: number;
  formTitle: string;
};

export function BotCard({ bot, compact = false }: { bot: BotCardData; compact?: boolean }) {
  const router = useRouter();
  const [busy, startTransition] = useTransition();
  const [statusNow, setStatusNow] = useState(bot.status);
  const [confirmDel, setConfirmDel] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const isActive = statusNow === "active";

  async function toggleStatus() {
    const next = isActive ? "inactive" : "active";
    setStatusNow(next);
    startTransition(async () => {
      try {
        const res = await fetch(`/api/bot/${bot.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: next }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Xatolik");
        toast.success(next === "active" ? "Bot yoqildi" : "Bot to'xtatildi");
        router.refresh();
      } catch (e: any) {
        setStatusNow(isActive ? "active" : "inactive");
        toast.error(e.message);
      }
    });
  }

  async function refreshForm() {
    setRefreshing(true);
    try {
      const res = await fetch(`/api/bot/${bot.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshForm: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Xatolik");
      toast.success("Forma yangilandi");
      router.refresh();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setRefreshing(false);
    }
  }

  async function deleteBot() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/bot/${bot.id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "O'chirishda xatolik");
      toast.success("Bot o'chirildi");
      setConfirmDel(false);
      router.refresh();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <Card className="group border-none shadow-sm hover:shadow-md transition overflow-hidden bg-white">
        <CardContent className={compact ? "p-4" : "p-5"}>
          <div className="flex items-start gap-3">
            <div
              className={`p-2 rounded-lg flex-shrink-0 ${
                isActive ? "bg-primary/10 text-primary" : "bg-slate-100 text-slate-400"
              }`}
            >
              <BotIcon size={compact ? 18 : 22} />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <Link
                  href={`/dashboard/bot/${bot.id}`}
                  className="font-bold text-slate-900 truncate hover:text-primary"
                >
                  @{bot.telegramBotUsername || bot.name}
                </Link>
                <Badge
                  variant={isActive ? "default" : "secondary"}
                  className="rounded-full text-xs shrink-0"
                >
                  {isActive ? "Aktiv" : "Tohtatilgan"}
                </Badge>
              </div>
              <div className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                <ExternalLink size={12} />
                <span className="truncate">{bot.formTitle}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-slate-600">
              <MessageSquare size={14} className="text-primary" />
              <span className="font-semibold text-sm">{bot.responsesCount}</span>
              <span className="text-xs text-slate-400">javob</span>
            </div>
            <div className="flex items-center gap-1">
              <Button
                size="sm"
                variant="ghost"
                onClick={toggleStatus}
                disabled={busy}
                title={isActive ? "So'rovni tohtatish" : "So'rovni yoqish"}
                aria-label={isActive ? "Tohtatish" : "Yoqish"}
                className={`h-8 w-8 p-0 ${
                  isActive
                    ? "text-amber-600 hover:bg-amber-50"
                    : "text-green-600 hover:bg-green-50"
                }`}
              >
                {busy ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : isActive ? (
                  <Pause size={15} />
                ) : (
                  <Play size={15} />
                )}
              </Button>

              <Button
                size="sm"
                variant="ghost"
                onClick={refreshForm}
                disabled={refreshing}
                title="Formani Google'dan yangilash"
                aria-label="Formani yangilash"
                className="h-8 w-8 p-0 text-slate-500 hover:bg-slate-100"
              >
                {refreshing ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <RefreshCw size={15} />
                )}
              </Button>

              {bot.telegramBotUsername && (
                <a
                  href={`https://t.me/${bot.telegramBotUsername}`}
                  target="_blank"
                  rel="noreferrer"
                  title="Telegram'da ochish"
                  aria-label="Telegram'da ochish"
                  className="h-8 w-8 inline-flex items-center justify-center rounded-md text-slate-500 hover:bg-sky-50 hover:text-sky-600"
                >
                  <Send size={15} />
                </a>
              )}

              <Link
                href={`/dashboard/bot/${bot.id}?tab=settings`}
                title="Sozlamalar"
                aria-label="Sozlamalar"
                className="h-8 w-8 inline-flex items-center justify-center rounded-md text-slate-500 hover:bg-slate-100"
              >
                <Settings size={15} />
              </Link>

              <Button
                size="sm"
                variant="ghost"
                onClick={() => setConfirmDel(true)}
                title="O'chirish"
                aria-label="O'chirish"
                className="h-8 w-8 p-0 text-red-500 hover:bg-red-50"
              >
                <Trash2 size={15} />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={confirmDel} onOpenChange={setConfirmDel}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Botni o'chirishni tasdiqlaysizmi?</DialogTitle>
            <DialogDescription>
              @{bot.telegramBotUsername} va uning barcha javoblari o'chiriladi. Bu amalni qaytarib bo'lmaydi.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setConfirmDel(false)} disabled={deleting}>
              Bekor qilish
            </Button>
            <Button variant="destructive" onClick={deleteBot} disabled={deleting}>
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  O'chirilmoqda...
                </>
              ) : (
                "Ha, o'chirish"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
