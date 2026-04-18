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
  HelpCircle
} from "lucide-react";
import { toast } from "sonner";

export default function NewBotPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Step 1 Data: Google Form
  const [forms, setForms] = useState<any[]>([]);
  const [selectedForm, setSelectedForm] = useState<string | null>(null);

  // Step 2 Data: Telegram Bot
  const [botToken, setBotToken] = useState("");
  const [botInfo, setBotInfo] = useState<{ id: number; first_name: string; username: string } | null>(null);

  const totalSteps = 3;
  const progress = (step / totalSteps) * 100;

  // Step 1: Fetch real Forms
  useEffect(() => {
    async function fetchForms() {
      if (step === 1) {
        setLoading(true);
        try {
          const res = await fetch("/api/forms/list");
          if (!res.ok) throw new Error("Formalarni yuklashda xatolik");
          const data = await res.json();
          setForms(data);
        } catch (error: any) {
          toast.error(error.message || "Tizimga kirishda xatolik yuz berdi");
        } finally {
          setLoading(false);
        }
      }
    }
    fetchForms();
  }, [step]);

  const validateStep2 = async () => {
    if (!botToken) {
      toast.error("Iltimos, Telegram Bot Tokenini kiriting");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/bot/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: botToken }),
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
        body: JSON.stringify({ formId: selectedForm, botToken }),
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Ulashda xatolik yuz berdi");
      
      toast.success("Bot muvaffaqiyatli ulandi! Webhook faollashtirildi.");
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
      {/* Progress Bar */}
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
                <CardDescription>Telegram'ga xabarlarni yuborishi kerak bo'lgan formani tanlang yoki ID kiriting.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3">
                  {forms.map((f) => (
                    <div 
                      key={f.id}
                      onClick={() => setSelectedForm(f.id)}
                      className={cn(
                        "flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all",
                        selectedForm === f.id 
                          ? "border-primary bg-primary/5 shadow-md" 
                          : "border-slate-100 hover:border-slate-200"
                      )}
                    >
                      <div className="flex items-center gap-4">
                        <div className={cn(
                          "w-10 h-10 rounded-full flex items-center justify-center",
                          selectedForm === f.id ? "bg-primary text-white" : "bg-slate-100 text-slate-400"
                        )}>
                          <FileText size={20} />
                        </div>
                        <div>
                          <p className="font-semibold">{f.title}</p>
                          <p className="text-xs text-slate-400">{f.questions} ta savol • {f.date}</p>
                        </div>
                      </div>
                      {selectedForm === f.id && <CheckCircle2 className="text-primary h-6 w-6" />}
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-400 pt-2">
                  <AlertCircle size={14} />
                  <span>Sizning barcha formalaringiz ro'yxati chiqmoqda.</span>
                </div>
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
                <CardDescription>Botingizning API Tokenini kiriting. Ushbu token orqali FormBot javoblarni yuboradi.</CardDescription>
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
                  {loading ? "Tekshirilmoqda..." : "Keyingi"}
                  {!loading && <ChevronRight className="ml-2 h-4 w-4" />}
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
                <CardDescription className="text-primary/70 font-medium">Barcha ma'lumotlarni tekshiring va tasdiqlang.</CardDescription>
              </div>
              <CardContent className="p-8 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Google Form</span>
                    <p className="font-bold text-lg mt-1 truncate">Mijozlar so'rovnomasi</p>
                    <p className="text-sm text-slate-500">5 ta savol mavjud</p>
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
                  {loading ? "Ulanmoqda..." : "Botni faollashtirish"}
                  {!loading && <Rocket className="ml-2 h-4 w-4" />}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Utility icon
import { Rocket } from "lucide-react";
import { cn } from "@/lib/utils";
