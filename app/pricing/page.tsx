"use client";

import { useSession } from "next-auth/react";
import { Check, Zap, Rocket, Building2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

const tiers = [
  {
    name: "Bepul",
    id: "FREE",
    price: "Bepul",
    description: "Yangi boshlayotganlar uchun eng yaxshi tanlov.",
    features: ["3 tagacha bot", "Google Form ulanish", "Telegram bot orqali javoblar", "Asosiy qo'llab-quvvatlash"],
    icon: Zap,
    buttonText: "Hozir boshlang",
    popular: false,
  },
  {
    name: "Professional",
    id: "PRO",
    price: "99,000 so'm",
    unit: "/oy",
    description: "Kichik va o'rta biznes egalari uchun kengaytirilgan imkoniyatlar.",
    features: [
      "10 tagacha bot",
      "Barcha bepul imkoniyatlar",
      "Admin bilan real-vaqtda chat",
      "Media fayllar (Rasm, PDF, Fayl)",
      "Eksport (Excel/CSV)",
      "Tezkor yordam",
    ],
    icon: Rocket,
    buttonText: "Pro'ga o'ting",
    popular: true,
  },
  {
    name: "Biznes",
    id: "BUSINESS",
    price: "299,000 so'm",
    unit: "/oy",
    description: "Katta loyihalar va cheksiz imkoniyatlar qidirganlar uchun.",
    features: [
      "Cheksiz botlar",
      "Shaxsiy brending (Branding)",
      "Cheksiz chat tarixi",
      "API orqali ulanish imkoniyati",
      "24/7 Ustuvor qo'llab-quvvatlash",
      "Shaxsiy menejer",
    ],
    icon: Building2,
    buttonText: "Biznesni tanlang",
    popular: false,
  },
];

export default function PricingPage() {
  const { data: session } = useSession();

  return (
    <div className="py-20 lg:py-28 px-4 bg-slate-50/50">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16 space-y-4">
          <Badge variant="secondary" className="rounded-full px-4 py-1.5 bg-primary/10 text-primary border-none text-[10px] font-bold uppercase tracking-widest">
            Tarif rejalar
          </Badge>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight text-slate-900 leading-[1.1]">
            Oddiy va shaffof narxlar
          </h1>
          <p className="text-slate-500 max-w-2xl mx-auto text-lg md:text-xl leading-relaxed">
            O'zingizga mos tarifni tanlang va botingizni professional darajaga ko'taring.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pt-16 px-4 md:px-0">
          {tiers.map((tier) => (
            <Card 
              key={tier.id} 
              className={`relative flex flex-col h-full border-none transition-all duration-300 hover:-translate-y-2 ${
                tier.popular 
                  ? "shadow-[0_20px_50px_rgba(37,99,235,0.15)] ring-2 ring-primary scale-105 z-10" 
                  : "shadow-xl shadow-slate-200/50 bg-white"
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 rounded-full shadow-lg z-20">
                  ENG MASHHUR
                </div>
              )}
              
              <CardHeader>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${
                  tier.popular ? "bg-primary text-white" : "bg-slate-100 text-slate-600"
                }`}>
                  <tier.icon size={24} />
                </div>
                <CardTitle className="text-2xl font-bold">{tier.name}</CardTitle>
                <CardDescription className="min-h-[40px]">{tier.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-3xl font-extrabold tracking-tight">{tier.price}</span>
                  {tier.unit && <span className="text-slate-500 text-sm font-medium">{tier.unit}</span>}
                </div>
                
                <ul className="space-y-3">
                  {tier.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-slate-600">
                      <div className="mt-0.5 w-4 h-4 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                        <Check size={10} strokeWidth={3} />
                      </div>
                      {feature}
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="pt-6">
                <Button 
                  className={`w-full h-14 rounded-2xl text-md font-black transition-all shadow-lg ${
                    tier.popular 
                      ? "bg-primary hover:bg-primary/90 shadow-primary/25" 
                      : "bg-slate-900 hover:bg-slate-800 shadow-slate-900/10"
                  }`}
                  asChild
                >
                  <Link href={`/dashboard/checkout/${tier.id}`}>
                    {tier.buttonText}
                  </Link>
                </Button>
              </CardFooter>
              {tier.id !== "FREE" && (
                <p className="text-[10px] text-center pb-4 text-slate-400 font-medium px-4">
                  * To'lovdan so'ng 5 daqiqa ichida faollashadi
                </p>
              )}
            </Card>
          ))}
        </div>

        <div className="mt-20 bg-slate-50 rounded-3xl p-8 md:p-12 border border-slate-100 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">Maxsus so'rov bormi?</h2>
          <p className="text-slate-500 max-w-xl mx-auto mb-8">
            Agar sizga alohida imkoniyatlar yoki korporativ yechim kerak bo'lsa, 
            biz bilan bevosita bog'laning. Biz sizga mos moslashuvchan narxlarni taklif qilamiz.
          </p>
          <Button variant="outline" size="lg" className="rounded-full gap-2 px-8">
            Biz bilan bog'lanish <ArrowRight size={18} />
          </Button>
        </div>
      </div>
    </div>
  );
}
