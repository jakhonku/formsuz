"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Bot,
  FileText,
  Check,
  AlertCircle,
  HelpCircle,
  Loader2,
  Rocket,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type FormItem = {
  id: string;
  title: string;
  createdTime: string | null;
  modifiedTime: string | null;
};

type BotInfo = {
  id: number;
  first_name: string;
  username: string;
};

function formatDate(iso: string | null) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("uz-UZ", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "—";
  }
}

export default function NewBotPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const [forms, setForms] = useState<FormItem[]>([]);
  const [formsLoading, setFormsLoading] = useState(false);
  const [formsError, setFormsError] = useState<string | null>(null);
  const [selectedForm, setSelectedForm] = useState<FormItem | null>(null);

  const [botToken, setBotToken] = useState("");
  const [botInfo, setBotInfo] = useState<BotInfo | null>(null);

  const totalSteps = 3;
  const progress = (step / totalSteps) * 100;

  useEffect(() => {
    async function fetchForms() {
      setFormsLoading(true);
      setFormsError(null);
      try {
        const res = await fetch("/api/forms/list");
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Formalarni yuklashda xatolik");
        }
        setForms(Array.isArray(data) ? data : []);
      } catch (error: any) {
        setFormsError(error.message || "Xatolik yuz berdi");
        toast.error(error.message || "Formalarni yuklashda xatolik");
      } finally {
        setFormsLoading(false);
      }
    }
    if (step === 1) {
      fetchForms();
    }
  }, [step]);

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
    if (!selectedForm || !botToken) return;

    setLoading(true);
    try {
      const res = await fetch("/api/bot/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formId: selectedForm.id, botToken: botToken.trim() }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ulashda xatolik yuz berdi");

      toast.success("Bot muvaffaqiyatli ulandi!");
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
            <h1 className="text-2xl font-bold tracking-tight">Yangi bot ulash</h1>
            <p className="text-slate-500">Google Formni Telegram botga 3 qadamda ulang</p>
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
                <CardTitle className="flex items-center gap-2">
                  <FileText className="text-primary" />
                  Google Formani tanlang
                </CardTitle>
                <CardDescription>
                  Telegram'ga xabar yuborishi kerak bo'lgan formani tanlang.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {formsLoading && (
                  <div className="flex items-center justify-center py-16">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-3 text-slate-500">Formalar yuklanmoqda...</span>
                  </div>
                )}

                {!formsLoading && formsError && (
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 border border-red-100 text-red-700">
                    <AlertCircle className="flex-shrink-0 mt-0.5" size={18} />
                    <div>
                      <p className="font-semibold">Formalarni yuklab bo'lmadi</p>
                      <p className="text-sm text-red-600/80 mt-1">{formsError}</p>
                      <p className="text-sm text-red-600/80 mt-2">
                        Iltimos, qaytadan tizimga kiring — Google akkauntingiz uchun Drive ruxsatini qayta berish kerak bo'lishi mumkin.
                      </p>
                    </div>
                  </div>
                )}

                {!formsLoading && !formsError && forms.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                      <FileText className="text-slate-400 h-8 w-8" />
                    </div>
                    <p className="font-semibold text-slate-700">Formalar topilmadi</p>
                    <p className="text-sm text-slate-500 mt-1 max-w-sm">
                      Google akkauntingizda hali formalar yo'q. Avval forms.google.com'da yangi forma yarating.
                    </p>
                  </div>
                )}

                {!formsLoading && !formsError && forms.length > 0 && (
                  <div className="grid gap-3">
                    {forms.map((f) => (
                      <div
                        key={f.id}
                        onClick={() => setSelectedForm(f)}
                        className={cn(
                          "flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all",
                          selectedForm?.id === f.id
                            ? "border-primary bg-primary/5 shadow-md"
                            : "border-slate-100 hover:border-slate-200"
                        )}
                      >
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0",
                            selectedForm?.id === f.id ? "bg-primary text-white" : "bg-slate-100 text-slate-400"
                          )}>
                            <FileText size={20} />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold truncate">{f.title}</p>
                            <p className="text-xs text-slate-400">
                              Yangilangan: {formatDate(f.modifiedTime || f.createdTime)}
                            </p>
                          </div>
                        </div>
                        {selectedForm?.id === f.id && <CheckCircle2 className="text-primary h-6 w-6 flex-shrink-0" />}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-end p-6 border-t">
                <Button
                  disabled={!selectedForm}
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
                  Telegram Bot ulash
                </CardTitle>
                <CardDescription>
                  Botingizning API Tokenini kiriting. Ushbu token orqali FormBot javoblarni yuboradi.
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

                <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 space-y-3">
                  <div className="flex items-center gap-2 text-blue-700 font-semibold">
                    <HelpCircle size={18} />
                    <span>Bot tokenni qanday olish mumkin?</span>
                  </div>
                  <ol className="text-sm text-blue-600/80 space-y-1 list-decimal list-inside">
                    <li>Telegram'da @BotFather'ni qidiring.</li>
                    <li>/newbot buyrug'ini bering.</li>
                    <li>Botga nom va username bering.</li>
                    <li>Sizga berilgan HTTP API tokenni bu yerga kiriting.</li>
                  </ol>
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
                  Barcha ma'lumotlarni tekshiring va tasdiqlang.
                </CardDescription>
              </div>
              <CardContent className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Google Form</span>
                    <p className="font-bold text-lg mt-1 truncate">{selectedForm?.title || "—"}</p>
                    <p className="text-sm text-slate-500">
                      Yangilangan: {formatDate(selectedForm?.modifiedTime || selectedForm?.createdTime || null)}
                    </p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Telegram Bot</span>
                    <p className="font-bold text-lg mt-1 truncate">@{botInfo?.username}</p>
                    <p className="text-sm text-slate-500">{botInfo?.first_name}</p>
                  </div>
                </div>
                <div className="flex gap-4 p-4 rounded-2xl bg-yellow-50 border border-yellow-100 text-yellow-800 text-sm">
                  <AlertCircle className="flex-shrink-0" size={20} />
                  <p>
                    Tugmani bosganingizdan so'ng, formangiz botga ulanadi va har bir yangi javob Telegram'ga keladi.
                  </p>
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
