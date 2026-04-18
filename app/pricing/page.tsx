"use client";

import { useSession } from "next-auth/react";
import { Check, Zap, Rocket, Building2, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

const tiers = [
  {
    name: "Free",
    id: "FREE",
    price: "Bepul",
    description: "Yangi boshlayotganlar uchun eng yaxshi tanlov.",
    features: ["3 tagacha bot", "Google Form ulanish", "Telegram bot orqali javoblar", "Asosiy qo'llab-quvvatlash"],
    icon: Zap,
    buttonText: "Hozir boshlang",
    popular: false,
  },
  {
    name: "Pro",
    id: "PRO",
    price: "99,000 so'm",
    unit: "/oy",
    description: "Kichik va o'rta biznes egalari uchun professional imkoniyatlar.",
    features: [
      "10 tagacha bot",
      "Barcha Free imkoniyatlar",
      "Admin real-time chat",
      "Media fayllar (Rasm, PDF, Fayl)",
      "Eksport (Excel/CSV)",
      "Tezkor yordam",
    ],
    icon: Rocket,
    buttonText: "Pro'ga o'ting",
    popular: true,
  },
  {
    name: "Business",
    id: "BUSINESS",
    price: "299,000 so'm",
    unit: "/oy",
    description: "Katta loyihalar va cheksiz imkoniyatlar qidirganlar uchun.",
    features: [
      "Cheksiz botlar",
      "Shaxsiy branding",
      "O'lmas kesh (Infinite history)",
      "API orqali ulanish",
      "24/7 Priority support",
      "Shaxsiy menejer",
    ],
    icon: Building2,
    buttonText: "Business'ni tanlang",
    popular: false,
  },
];

export default function PricingPage() {
  const { data: session } = useSession();

  return (
    <div className="py-20 lg:py-28 px-4">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <Badge variant="outline" className="mb-4 rounded-full px-3 py-1">Tariflar</Badge>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Oddiy va shaffof narxlar
          </h1>
          <p className="text-slate-500 max-w-2xl mx-auto text-lg">
            O'zingizga mos tarifni tanlang va botingizni professional darajaga ko'taring.
            Siz istalgan vaqtda tarifingizni o'zgartirishingiz mumkin.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {tiers.map((tier) => (
            <Card 
              key={tier.id} 
              className={`relative flex flex-col h-full border-2 transition-all hover:shadow-xl ${
                tier.popular ? "border-primary shadow-lg scale-105 z-10" : "border-slate-100 shadow-sm"
              }`}
            >
              {tier.popular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-lg">
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
              <CardFooter>
                <Button 
                  className={`w-full h-12 rounded-xl text-md font-bold transition-all ${
                    tier.popular ? "bg-primary hover:bg-primary/90" : "bg-slate-900 hover:bg-slate-800"
                  }`}
                  asChild
                >
                  <Link href={session ? "/dashboard/settings" : "/login"}>
                    {tier.buttonText}
                  </Link>
                </Button>
              </CardFooter>
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
