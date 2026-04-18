import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, X, Sparkles, Rocket, Crown, ArrowRight } from "lucide-react";

const plans = [
  {
    name: "Bepul",
    tagline: "Boshlash uchun ideal",
    price: "0",
    currency: "so'm",
    period: "/oy",
    icon: <Sparkles className="h-5 w-5" />,
    accent: false,
    cta: "Bepul boshlash",
    href: "/login",
    features: [
      { text: "3 ta bot", enabled: true },
      { text: "Cheksiz javoblar", enabled: true },
      { text: "Google Sheets integratsiyasi", enabled: true },
      { text: "Excel / CSV eksport", enabled: true },
      { text: "Test/Quiz rejimi", enabled: true },
      { text: "Dashboard statistika", enabled: true },
      { text: "Prioritet qo'llab-quvvatlash", enabled: false },
      { text: "Maxsus domen (custom)", enabled: false },
      { text: "API kirish", enabled: false },
    ],
  },
  {
    name: "Pro",
    tagline: "Keng imkoniyatlar, jamoa uchun",
    price: "99 000",
    currency: "so'm",
    period: "/oy",
    icon: <Rocket className="h-5 w-5" />,
    accent: true,
    popular: true,
    cta: "Pro'ga o'tish",
    href: "/login",
    features: [
      { text: "Cheksiz bot", enabled: true },
      { text: "Cheksiz javoblar", enabled: true },
      { text: "Google Sheets integratsiyasi", enabled: true },
      { text: "Excel / CSV eksport", enabled: true },
      { text: "Test/Quiz rejimi", enabled: true },
      { text: "Kengaytirilgan statistika", enabled: true },
      { text: "Prioritet qo'llab-quvvatlash", enabled: true },
      { text: "Webhook sozlash", enabled: true },
      { text: "API kirish (tez orada)", enabled: false },
    ],
  },
  {
    name: "Biznes",
    tagline: "Tashkilotlar uchun",
    price: "Kelishiladi",
    currency: "",
    period: "",
    icon: <Crown className="h-5 w-5" />,
    accent: false,
    cta: "Biz bilan bog'laning",
    href: "https://t.me/formbot_support",
    external: true,
    features: [
      { text: "Pro'dagi hammasi", enabled: true },
      { text: "SLA kafolat", enabled: true },
      { text: "Shaxsiy menejer", enabled: true },
      { text: "Maxsus integratsiyalar", enabled: true },
      { text: "On-premise variant", enabled: true },
      { text: "Xavfsizlik auditi", enabled: true },
      { text: "Maxsus o'quv kurs", enabled: true },
      { text: "Yangilanishlarga erta kirish", enabled: true },
      { text: "API kirish", enabled: true },
    ],
  },
];

export default function PricingPage() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero */}
      <section className="w-full bg-gradient-to-b from-blue-50/40 to-white py-16 md:py-24 text-center px-4">
        <div className="container max-w-4xl mx-auto">
          <Badge variant="outline" className="mb-4 rounded-full px-3 py-1 bg-white">
            Tariflar
          </Badge>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Oddiy va tushunarli narxlar
          </h1>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto">
            Bepul tarifda boshlang. Keyin kerakli hajmga qarab kengaytiring.
            Yashirin to'lovlar yo'q.
          </p>
        </div>
      </section>

      {/* Plans */}
      <section className="w-full py-8 pb-16 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {plans.map((p, i) => (
              <Card
                key={i}
                className={`relative overflow-hidden ${
                  p.accent
                    ? "border-primary border-2 shadow-xl shadow-primary/10"
                    : "border-slate-200 shadow-sm"
                }`}
              >
                {p.popular && (
                  <div className="absolute top-0 right-0 bg-primary text-white text-xs font-bold px-3 py-1 rounded-bl-xl">
                    Mashhur
                  </div>
                )}
                <CardContent className="p-7">
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${
                      p.accent ? "bg-primary text-white" : "bg-slate-100 text-slate-700"
                    }`}
                  >
                    {p.icon}
                  </div>
                  <h3 className="text-2xl font-bold mb-1">{p.name}</h3>
                  <p className="text-sm text-slate-500 mb-5">{p.tagline}</p>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-4xl font-extrabold">{p.price}</span>
                    {p.currency && (
                      <span className="text-lg font-semibold text-slate-500">{p.currency}</span>
                    )}
                  </div>
                  {p.period && <p className="text-xs text-slate-400 mb-6">{p.period}</p>}
                  {!p.period && <div className="mb-6" />}

                  {p.external ? (
                    <Button
                      asChild
                      variant={p.accent ? "default" : "outline"}
                      className="w-full rounded-full h-11 font-semibold"
                    >
                      <a href={p.href} target="_blank" rel="noreferrer">
                        {p.cta} <ArrowRight size={16} className="ml-1.5" />
                      </a>
                    </Button>
                  ) : (
                    <Button
                      asChild
                      variant={p.accent ? "default" : "outline"}
                      className="w-full rounded-full h-11 font-semibold"
                    >
                      <Link href={p.href}>
                        {p.cta} <ArrowRight size={16} className="ml-1.5" />
                      </Link>
                    </Button>
                  )}

                  <ul className="mt-6 space-y-2.5 pt-6 border-t border-slate-100">
                    {p.features.map((f, fi) => (
                      <li
                        key={fi}
                        className={`flex items-start gap-2.5 text-sm ${
                          f.enabled ? "text-slate-700" : "text-slate-400"
                        }`}
                      >
                        {f.enabled ? (
                          <Check size={16} className="text-green-600 shrink-0 mt-0.5" />
                        ) : (
                          <X size={16} className="text-slate-300 shrink-0 mt-0.5" />
                        )}
                        <span>{f.text}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ mini */}
      <section className="w-full py-16 bg-slate-50">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-2">Tariflar bo'yicha savollar</h2>
            <p className="text-slate-500">Tez-tez so'raladigan savollar</p>
          </div>
          <div className="space-y-3">
            {[
              {
                q: "Bepul tarif haqiqatdan ham bepulmi?",
                a: "Ha. 3 ta botgacha, cheksiz javoblar bilan, karta kerak emas. Hech qanday yashirin to'lov yo'q.",
              },
              {
                q: "Tarifni istalgan vaqtda almashtirish mumkinmi?",
                a: "Ha. Dashboard orqali yuqoriga yoki pastga har qachon o'ta olasiz. To'lov proporsional hisoblanadi.",
              },
              {
                q: "To'lovni qanday amalga oshiraman?",
                a: "Click, Payme va bank karta orqali to'lov mumkin. Yuridik shaxslar uchun hisob-faktura ham beriladi.",
              },
              {
                q: "Pul qaytarib olish imkoniyati bormi?",
                a: "Ha, xarid qilingandan keyin 14 kun ichida to'liq pulni qaytaramiz. Hech qanday savolsiz.",
              },
              {
                q: "Biznes tarifga nima kiradi?",
                a: "SLA kafolat, shaxsiy menejer, maxsus integratsiyalar va on-premise variant. Telegram orqali bog'laning.",
              },
            ].map((f, i) => (
              <details key={i} className="group bg-white rounded-2xl px-5 py-4 cursor-pointer border border-transparent hover:border-slate-200 transition">
                <summary className="flex items-center justify-between font-semibold text-slate-800 list-none">
                  <span>{f.q}</span>
                  <span className="w-7 h-7 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 group-open:rotate-45 transition-transform text-lg leading-none">
                    +
                  </span>
                </summary>
                <p className="text-slate-500 text-sm mt-3 leading-relaxed">{f.a}</p>
              </details>
            ))}
          </div>
          <div className="text-center mt-8">
            <Button variant="outline" asChild className="rounded-full gap-2">
              <Link href="/faq">
                Barcha savollar <ArrowRight size={16} />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="w-full py-16 px-4">
        <div className="container max-w-4xl mx-auto bg-gradient-to-br from-primary to-blue-700 text-white rounded-3xl p-10 md:p-14 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            Bepul tarifda sinab ko'ring
          </h2>
          <p className="text-white/80 mb-7 max-w-lg mx-auto">
            Karta kerak emas. 2 daqiqada birinchi botingiz ishga tushadi.
          </p>
          <Button size="lg" variant="secondary" asChild className="rounded-full h-12 px-8 text-primary font-bold">
            <Link href="/login">Hoziroq boshlash</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
