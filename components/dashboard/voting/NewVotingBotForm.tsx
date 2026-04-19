"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Bot, HelpCircle, Loader2, Rocket, Vote } from "lucide-react";

export function NewVotingBotForm() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [botToken, setBotToken] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Konkurs nomini kiriting");
      return;
    }
    if (!botToken.trim()) {
      toast.error("Bot tokenini kiriting");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/voting-bots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          botToken: botToken.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Yaratishda xatolik");
      toast.success("Konkurs boti yaratildi!");
      router.push(`/dashboard/voting-bot/${data.id}`);
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Vote className="text-primary" />
          Yangi konkurs boti
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          Ovoz toplash uchun Telegram bot yarating — nomzodlarni keyingi sahifada
          qo'shasiz.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="border-none shadow-lg">
          <CardHeader>
            <CardTitle>Konkurs ma'lumotlari</CardTitle>
            <CardDescription>
              Bu ma'lumotlar botda foydalanuvchiga ko'rsatiladi.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Konkurs nomi *</Label>
              <Input
                id="title"
                placeholder="Masalan: Eng yaxshi sanatkor 2026"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="h-11"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Tavsif (ixtiyoriy)</Label>
              <textarea
                id="description"
                placeholder="Konkurs haqida qisqacha ma'lumot..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                className="w-full rounded-md border border-slate-200 p-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="token">Telegram Bot Token *</Label>
              <Input
                id="token"
                placeholder="123456789:ABCdefGHI..."
                value={botToken}
                onChange={(e) => setBotToken(e.target.value)}
                className="h-11 font-mono"
              />
            </div>

            <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 space-y-2">
              <div className="flex items-center gap-2 text-blue-700 font-semibold text-sm">
                <HelpCircle size={16} />
                <span>Bot tokenni qanday olish mumkin?</span>
              </div>
              <ol className="text-xs text-blue-600/80 space-y-1 list-decimal list-inside">
                <li>Telegram'da @BotFather'ni qidiring.</li>
                <li>/newbot buyrug'ini bering, nom va username bering.</li>
                <li>Berilgan HTTP API tokenni shu yerga kiriting.</li>
              </ol>
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-3 border-t p-6">
            <Button
              type="button"
              variant="ghost"
              onClick={() => router.back()}
              className="rounded-full"
              disabled={loading}
            >
              Bekor qilish
            </Button>
            <Button
              type="submit"
              className="rounded-full px-8 h-11"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Yaratilmoqda...
                </>
              ) : (
                <>
                  Botni yaratish
                  <Rocket className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
