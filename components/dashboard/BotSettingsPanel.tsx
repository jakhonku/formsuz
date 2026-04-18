"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Loader2, Trash2, RefreshCw } from "lucide-react";
import { ChangeFormDialog } from "./ChangeFormDialog";

type Props = {
  botId: string;
  initialStatus: string;
  currentFormTitle: string;
};

export function BotSettingsPanel({ botId, initialStatus, currentFormTitle }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState(initialStatus);
  const [toggling, setToggling] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [changeFormOpen, setChangeFormOpen] = useState(false);

  async function toggleStatus(active: boolean) {
    const newStatus = active ? "active" : "inactive";
    setToggling(true);
    try {
      const res = await fetch(`/api/bot/${botId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Xatolik");
      setStatus(newStatus);
      toast.success(active ? "Bot faollashtirildi" : "Bot to'xtatildi");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setToggling(false);
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
    } catch (error: any) {
      toast.error(error.message);
      setDeleting(false);
    }
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle>Bot holati</CardTitle>
            <CardDescription>Bot javoblarni qabul qilishi yoki vaqtincha to'xtashi mumkin.</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-between">
            <div>
              <p className="font-medium">Faollashtirish</p>
              <p className="text-sm text-slate-500">
                {status === "active" ? "Bot hozir javoblarni qabul qilmoqda" : "Bot to'xtatilgan"}
              </p>
            </div>
            {toggling ? (
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
            ) : (
              <Switch
                checked={status === "active"}
                onCheckedChange={toggleStatus}
              />
            )}
          </CardContent>
        </Card>

        <Card className="border-none shadow-md">
          <CardHeader>
            <CardTitle>Google Forma</CardTitle>
            <CardDescription>Ulangan formani boshqasiga almashtirish.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="font-medium truncate">{currentFormTitle}</p>
            <Button
              variant="outline"
              className="gap-2 rounded-full"
              onClick={() => setChangeFormOpen(true)}
            >
              <RefreshCw size={16} />
              Formani almashtirish
            </Button>
          </CardContent>
        </Card>

        <Card className="border-red-100 border-2 shadow-md bg-red-50/20 md:col-span-2">
          <CardHeader>
            <CardTitle className="text-red-600">Xavfli hudud</CardTitle>
            <CardDescription>Botni butunlay o'chirish qayta tiklanmaydi. Webhook Telegram'dan olib tashlanadi.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              variant="destructive"
              className="gap-2 rounded-full h-12"
              onClick={() => setDeleteOpen(true)}
            >
              <Trash2 size={18} />
              Botni butunlay o'chirish
            </Button>
          </CardContent>
        </Card>
      </div>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Botni o'chirishni tasdiqlaysizmi?</DialogTitle>
            <DialogDescription>
              Bot va unga tegishli barcha javoblar o'chiriladi. Bu amalni qaytarib bo'lmaydi.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setDeleteOpen(false)} disabled={deleting}>
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

      <ChangeFormDialog
        botId={botId}
        open={changeFormOpen}
        onOpenChange={setChangeFormOpen}
        onChanged={() => router.refresh()}
      />
    </>
  );
}
