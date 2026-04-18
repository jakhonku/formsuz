"use client";

import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import { PLANS } from "@/lib/plans";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Send, Check, Wallet, Smartphone, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const tierId = params.tierId as string;
  const plan = PLANS[tierId as keyof typeof PLANS];

  const [loadingMethod, setLoadingMethod] = useState<string | null>(null);

  if (!plan || tierId === "FREE") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <h1 className="text-2xl font-bold">Noto'g'ri tarif tanlandi</h1>
        <Button asChild><Link href="/pricing">Orqaga qaytish</Link></Button>
      </div>
    );
  }

  const handlePayment = (method: string) => {
    setLoadingMethod(method);
    // Simulation: In real app, redirect to Click/Payme API
    setTimeout(() => {
      if (method === "telegram") {
        window.open("https://t.me/jakhonku", "_blank");
      } else {
        alert(`${method} orqali to'lov tizimi tez kunda ishga tushadi. Hozircha Telegram orqali bog'laning.`);
      }
      setLoadingMethod(null);
    }, 1000);
  };

  return (
    <div className="max-w-5xl mx-auto py-10 px-4">
      <Button 
        variant="ghost" 
        onClick={() => router.back()} 
        className="mb-6 hover:bg-slate-100 rounded-full"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Orqaga
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Order Summary */}
        <div className="lg:col-span-1 border-r border-slate-100 pr-0 lg:pr-8">
          <h2 className="text-2xl font-black mb-6">Buyurtma</h2>
          <Card className="border-none shadow-xl shadow-primary/5 bg-primary overflow-hidden text-white">
            <CardHeader className="pb-4">
              <Badge variant="secondary" className="w-fit bg-white/20 text-white border-none mb-2">
                Tanlangan tarif
              </Badge>
              <CardTitle className="text-3xl font-black">{plan.name}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-baseline">
                <span className="text-white/70">Narxi:</span>
                <span className="text-2xl font-bold">{plan.price.toLocaleString()} so'm</span>
              </div>
              <div className="h-px bg-white/20 my-4" />
              <ul className="space-y-2">
                {plan.features.slice(0, 4).map((f, i) => (
                  <li key={i} className="text-xs flex items-center gap-2 text-white/90">
                    <Check size={12} className="text-white shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
          
          <div className="mt-8 p-6 bg-slate-50 rounded-2xl border border-slate-100">
            <h3 className="text-sm font-bold uppercase tracking-wider mb-3 text-slate-400">Ma'lumot</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              To'lov amalga oshirilgandan so'ng, tarifingiz avtomatik ravishda 
              faollashadi. Agar muammo yuzaga kelsa, @jakhonku ga yozing.
            </p>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-2xl font-black">To'lov usulini tanlang</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Click */}
            <button 
              onClick={() => handlePayment("click")}
              disabled={loadingMethod !== null}
              className="group relative flex flex-col items-center justify-center p-8 bg-white border-2 border-slate-100 rounded-[2rem] hover:border-primary hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 overflow-hidden"
            >
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Smartphone size={100} />
              </div>
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Wallet size={32} />
              </div>
              <span className="text-xl font-bold">Click.uz</span>
              <span className="text-xs text-slate-400 mt-1">Hamyon yoki karta orqali</span>
              {loadingMethod === "click" && <Loader2 className="absolute inset-x-0 bottom-4 mx-auto animate-spin text-primary" />}
            </button>

            {/* Payme */}
            <button 
              onClick={() => handlePayment("payme")}
              disabled={loadingMethod !== null}
              className="group relative flex flex-col items-center justify-center p-8 bg-white border-2 border-slate-100 rounded-[2rem] hover:border-[#00BAE0] hover:shadow-2xl hover:shadow-[#00BAE0]/10 transition-all duration-300 overflow-hidden"
            >
               <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Smartphone size={100} />
              </div>
              <div className="w-16 h-16 bg-cyan-50 text-[#00BAE0] rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <CreditCard size={32} />
              </div>
              <span className="text-xl font-bold">Payme</span>
              <span className="text-xs text-slate-400 mt-1">Payme hamyoni orqali</span>
              {loadingMethod === "payme" && <Loader2 className="absolute inset-x-0 bottom-4 mx-auto animate-spin text-[#00BAE0]" />}
            </button>

             {/* Visa/MasterCard */}
             <button 
              onClick={() => handlePayment("card")}
              disabled={loadingMethod !== null}
              className="group relative flex flex-col md:flex-row items-center gap-6 p-6 bg-white border-2 border-slate-100 rounded-[2rem] hover:border-slate-900 transition-all md:col-span-2 text-left"
            >
              <div className="w-16 h-16 bg-slate-100 text-slate-900 rounded-2xl flex items-center justify-center shrink-0">
                <CreditCard size={32} />
              </div>
              <div className="flex-1">
                <span className="text-xl font-bold block">Karta orqali (Uzcard/Humo/Visa)</span>
                <span className="text-sm text-slate-400">Xavfsiz onlayn to'lov (Stripe/Global)</span>
              </div>
              <Check size={24} className="text-slate-200 group-hover:text-slate-900" />
            </button>

             {/* Telegram Admin */}
             <button 
              onClick={() => handlePayment("telegram")}
              disabled={loadingMethod !== null}
              className="group relative flex flex-col md:flex-row items-center gap-6 p-6 bg-slate-900 text-white rounded-[2rem] hover:shadow-2xl hover:shadow-slate-900/40 transition-all md:col-span-2 text-left"
            >
              <div className="w-16 h-16 bg-white/10 text-white rounded-2xl flex items-center justify-center shrink-0">
                <Send size={32} />
              </div>
              <div className="flex-1">
                <span className="text-xl font-bold block text-blue-400">Telegram Admin</span>
                <span className="text-sm text-white/60">Admin bilan bog'lanib, qo'lda faollashtirish</span>
              </div>
              <div className="px-4 py-2 bg-blue-500 rounded-full text-xs font-bold animate-pulse">
                TAVSIYA ETILADI
              </div>
            </button>
          </div>

          <div className="text-center pt-10">
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              To'lovni amalga oshirish orqali siz loyihaning foydalanish shartlariga rozilik bildirasiz. 
              Ma'lumotlaringiz xavfsizligi kafolatlanadi.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
