"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  Play,
  Pause,
  RefreshCw,
  Trash2,
  Loader2,
  Send,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Props = {
  botId: string;
  initialStatus: string;
  telegramUsername: string | null;
  isWorkspace?: boolean;
};

export function BotHeaderActions({ botId, initialStatus, telegramUsername, isWorkspace }: Props) {
  const router = useRouter();
  const [statusNow, setStatusNow] = useState(initialStatus);
  const [busy, startTransition] = useTransition();
  const [refreshing, setRefreshing] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isActive = statusNow === "active";

  async function toggleStatus() {
    const next = isActive ? "inactive" : "active";
    setStatusNow(next);
    startTransition(async () => {
      try {
        const res = await fetch(`/api/bot/${botId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: next }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Xatolik");
        toast.success(next === "active" ? "So'rov yoqildi" : "So'rov tohtatildi");
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
      const res = await fetch(`/api/bot/${botId}`, {
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
      const res = await fetch(`/api/bot/${botId}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "O'chirishda xatolik");
      toast.success("Bot o'chirildi");
      router.push("/dashboard/bots");
      router.refresh();
    } catch (e: any) {
      toast.error(e.message);
      setDeleting(false);
    }
  }

  return (
    <>
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          onClick={toggleStatus}
          disabled={busy}
          variant={isActive ? "outline" : "default"}
          className={`rounded-full gap-2 h-10 ${
            isActive
              ? "border-amber-200 text-amber-700 hover:bg-amber-50"
              : "bg-green-600 hover:bg-green-700"
          }`}
        >
          {busy ? (
            <Loader2 size={16} className="animate-spin" />
          ) : isActive ? (
            <Pause size={16} />
          ) : (
            <Play size={16} />
          )}
          {isActive ? "So'rovni tohtatish" : "So'rovni yoqish"}
        </Button>

        {!isWorkspace && (
          <Button
            variant="outline"
            onClick={refreshForm}
            disabled={refreshing}
            title="Formani Google'dan qayta yuklash"
            className="rounded-full gap-2 h-10"
          >
            {refreshing ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <RefreshCw size={16} />
            )}
            Formani yangilash
          </Button>
        )}

        {telegramUsername && (
          <Button variant="outline" asChild className="rounded-full gap-2 h-10">
            <a href={`https://t.me/${telegramUsername}`} target="_blank" rel="noreferrer">
              <Send size={16} />
              Telegram'da ochish
            </a>
          </Button>
        )}

        <Button
          variant="ghost"
          onClick={() => setConfirmDel(true)}
          title="Botni o'chirish"
          className="rounded-full h-10 w-10 p-0 text-red-500 hover:bg-red-50"
        >
          <Trash2 size={18} />
        </Button>
      </div>

      <Dialog open={confirmDel} onOpenChange={setConfirmDel}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Botni o'chirishni tasdiqlaysizmi?</DialogTitle>
            <DialogDescription>
              Bot va uning barcha javoblari o'chiriladi. Webhook Telegram'dan olib tashlanadi. Bu amalni qaytarib bo'lmaydi.
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
