"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  ChevronRight,
  ChevronLeft,
  Bot,
  Check,
  Loader2,
  Rocket,
  FolderOpen,
  Calendar,
  CheckSquare,
  Globe,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type BotInfo = {
  id: number;
  first_name: string;
  username: string;
};

const BOT_TYPES = [
  { id: "UNIVERSAL", title: "Universal Bot", desc: "Drive, Calendar va Tasks bir joyda", icon: Globe, color: "text-blue-500", bg: "bg-blue-50" },
  { id: "DRIVE", title: "Drive Bot", desc: "Fayllarni boshqarish va yuklash", icon: FolderOpen, color: "text-amber-500", bg: "bg-amber-50" },
  { id: "CALENDAR", title: "Calendar Bot", desc: "Majlislar va rejalarni boshqarish", icon: Calendar, color: "text-indigo-500", bg: "bg-indigo-50" },
  { id: "TASKS", title: "Tasks Bot", desc: "Vazifalar ro'yxatini boshqarish", icon: CheckSquare, color: "text-green-500", bg: "bg-green-50" },
];

export default function NewWorkspaceBotPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [selectedType, setSelectedType] = useState<string>("UNIVERSAL");
  const [botToken, setBotToken] = useState("");
  const [botInfo, setBotInfo] = useState<BotInfo | null>(null);

  const totalSteps = 3;
  const progress = (step / totalSteps) * 100;

  const validateStep2 = async () => {
    if (!botToken.trim()) {
      toast.error("Iltimos, Telegram Bot Tokenini kiriting");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/bot/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: botToken.trim() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Token noto'g'ri");

      setBotInfo(data);
      setStep(3);
      toast.success("Bot topildi: @" + data.username);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = async () => {
    setLoading(true);
    try {
      // Yangi endpoint yaratamiz: /api/bot/connect-workspace
      const res = await fetch("/api/bot/connect-workspace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: selectedType, botToken: botToken.trim() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ulashda xatolik yuz berdi");

      toast.success("Workspace Bot muvaffaqiyatli ulandi!");
      router.push("/dashboard");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <div className="mb-12 space-y-4">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Yangi Workspace Bot</h1>
            <p className="text-slate-500">Google xizmatlarini Telegram orqali boshqaring</p>
          </div>
          <span className="text-sm font-medium text-slate-400">Bosqich {step}/{totalSteps}</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle>Bot turini tanlang</CardTitle>
                <CardDescription>
                  Sizga qaysi Google xizmati bilan ishlovchi bot kerak?
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {BOT_TYPES.map((t) => {
                    const Icon = t.icon;
                    const isSelected = selectedType === t.id;
                    return (
                      <div
                        key={t.id}
                        onClick={() => setSelectedType(t.id)}
                        className={cn(
                          "flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all",
                          isSelected
                            ? "border-primary bg-primary/5 shadow-md"
                            : "border-slate-100 hover:border-slate-200"
                        )}
                      >
                        <div className={cn("w-12 h-12 rounded-full flex items-center justify-center", t.bg, t.color)}>
                          <Icon size={24} />
                        </div>
                        <div>
                          <p className="font-semibold">{t.title}</p>
                          <p className="text-xs text-slate-500 mt-1">{t.desc}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
              <CardFooter className="flex justify-end p-6 border-t">
                <Button
                  onClick={() => setStep(2)}
                  className="rounded-full px-8 h-12"
                >
                  Keyingi
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <Card className="border-none shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bot className="text-primary" />
                  Telegram Bot Token
                </CardTitle>
                <CardDescription>
                  BotFather'dan olingan tokenni kiriting.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="token">Bot Token</Label>
                  <Input
                    id="token"
                    placeholder="123456789:ABCdefGHI..."
                    className="h-12 font-mono"
                    value={botToken}
                    onChange={(e) => setBotToken(e.target.value)}
                  />
                </div>
              </CardContent>
              <CardFooter className="flex items-center justify-between p-6 border-t">
                <Button variant="ghost" onClick={() => setStep(1)} className="rounded-full">
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Orqaga
                </Button>
                <Button
                  onClick={validateStep2}
                  disabled={loading}
                  className="rounded-full px-8 h-12"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Tekshirilmoqda...
                    </>
                  ) : (
                    <>
                      Keyingi
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <Card className="border-none shadow-lg overflow-hidden">
              <div className="bg-primary/5 p-8 border-b border-primary/10 text-center">
                <div className="w-20 h-20 bg-primary text-white rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-primary/20">
                  <Check size={40} />
                </div>
                <CardTitle className="text-2xl">Tayyormisiz?</CardTitle>
                <CardDescription className="text-primary/70 font-medium">
                  {selectedType} turidagi bot yaratilmoqda.
                </CardDescription>
              </div>
              <CardContent className="p-8 space-y-6">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Telegram Bot
                  </span>
                  <p className="font-bold text-lg mt-1 truncate">@{botInfo?.username}</p>
                  <p className="text-sm text-slate-500">{botInfo?.first_name}</p>
                </div>
              </CardContent>
              <CardFooter className="flex items-center justify-between p-6 bg-slate-50 border-t">
                <Button variant="ghost" onClick={() => setStep(2)} className="rounded-full">
                  <ChevronLeft className="mr-2 h-4 w-4" />
                  Orqaga
                </Button>
                <Button
                  onClick={handleFinish}
                  disabled={loading}
                  className="rounded-full px-10 h-12 bg-green-600 hover:bg-green-700 shadow-lg shadow-green-200"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Ulanmoqda...
                    </>
                  ) : (
                    <>
                      Botni faollashtirish
                      <Rocket className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
