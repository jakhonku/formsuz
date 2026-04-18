"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Zap,
  ShieldCheck,
  Rocket,
  Bot,
  FileText,
  MessageSquare,
  Award,
  BarChart3,
  Check,
  Clock,
  Users,
  GraduationCap,
  Briefcase,
  Heart,
  Star,
  ArrowRight,
  Sparkles,
  Database,
  LayoutDashboard
} from "lucide-react";

export default function Home() {
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";
  return (
    <div className="flex flex-col items-center overflow-hidden">
      {/* Hero */}
      <section className="w-full relative bg-gradient-to-b from-white via-blue-50/30 to-white py-20 lg:py-28 flex flex-col items-center text-center px-4">
        <div className="absolute top-20 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl -z-10" />
        <div className="absolute top-40 right-1/4 w-72 h-72 bg-purple-200/30 rounded-full blur-3xl -z-10" />

        <div className="container flex flex-col items-center gap-6 max-w-5xl">
          <div className="inline-flex items-center rounded-full border border-primary/20 bg-white/80 backdrop-blur px-4 py-1.5 text-sm font-medium text-primary shadow-sm">
            <Sparkles className="mr-2 h-4 w-4" />
            <span>Kodsiz · 2 daqiqada · Bepul boshlang</span>
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 max-w-4xl leading-[1.05]">
            Google Form'ni <br className="hidden md:block" />
            Telegram botga <span className="text-primary italic whitespace-nowrap">2 daqiqada</span> ulang
          </h1>

          <p className="text-lg md:text-xl text-slate-500 max-w-2xl">
            So'rovnoma va testlaringizni Telegram bot orqali o'tkazing. Javoblar avtomatik
            ravishda Google Sheets'ga yoziladi. Dasturlash bilimi talab qilinmaydi.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 mt-6">
            <Button size="lg" asChild className="rounded-full h-14 px-8 text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all">
              <Link href={isAuthenticated ? "/dashboard" : "/login"}>
                {isAuthenticated ? <LayoutDashboard className="mr-2 h-5 w-5" /> : (
                  <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                )}
                {isAuthenticated ? "Dashboard'ga o'tish" : "Ro'yxatdan o'tish"}
              </Link>
            </Button>
            {!isAuthenticated && (
              <Button size="lg" variant="outline" asChild className="rounded-full h-14 px-8 text-base bg-white">
                <Link href="/login">
                  Tizimga kirish
                </Link>
              </Button>
            )}
          </div>

          <div className="flex items-center gap-6 mt-4 text-sm text-slate-500">
            <span className="flex items-center gap-1.5">
              <Check size={16} className="text-green-600" /> Karta kerak emas
            </span>
            <span className="flex items-center gap-1.5">
              <Check size={16} className="text-green-600" /> 3 ta bot bepul
            </span>
            <span className="hidden sm:flex items-center gap-1.5">
              <Check size={16} className="text-green-600" /> Onlayn qo'llab-quvvatlash
            </span>
          </div>
        </div>

        {/* Trust stats */}
        <div className="container max-w-4xl mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
          {[
            { value: "2 daqiqa", label: "O'rtacha ulanish vaqti" },
            { value: "1000+", label: "Ulangan formalar" },
            { value: "50k+", label: "Qabul qilingan javoblar" },
            { value: "99.9%", label: "Server ishlash vaqti" },
          ].map((s, i) => (
            <div key={i} className="text-center">
              <p className="text-2xl md:text-3xl font-extrabold text-slate-900">{s.value}</p>
              <p className="text-xs md:text-sm text-slate-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="w-full py-20 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-14">
            <Badge variant="outline" className="mb-4 rounded-full px-3 py-1">Imkoniyatlar</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-3">Nega aynan FormBot?</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">
              Bir nechta tugma bosish bilan Telegram botingizni professional so'rov
              platformasiga aylantiring.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              {
                icon: <Zap />,
                color: "bg-amber-100 text-amber-700",
                title: "Chaqqon ulanish",
                desc: "BotFather tokenini va formani tanlang — tamom. Kod yozish shart emas.",
              },
              {
                icon: <FileText />,
                color: "bg-blue-100 text-blue-700",
                title: "Barcha savol turlari",
                desc: "Qisqa javob, uzun matn, tanlov, shkala, sana, vaqt — barchasi qo'llab-quvvatlanadi.",
              },
              {
                icon: <Award />,
                color: "bg-purple-100 text-purple-700",
                title: "Test/Quiz rejimi",
                desc: "Google Forms'dagi test savollari avtomatik aniqlanadi. Ball va natija darhol chiqadi.",
              },
              {
                icon: <Database />,
                color: "bg-green-100 text-green-700",
                title: "Google Sheets'ga yozish",
                desc: "Har bir javob avtomatik jadvalga tushadi. Eksport qilish yoki tahlil qulay.",
              },
              {
                icon: <BarChart3 />,
                color: "bg-pink-100 text-pink-700",
                title: "Jonli dashboard",
                desc: "Javoblar, statistika, savollar — barchasi bir ekranda. Excel va CSV'ga eksport.",
              },
              {
                icon: <ShieldCheck />,
                color: "bg-teal-100 text-teal-700",
                title: "Xavfsizlik",
                desc: "Tokenlar shifrlangan holda saqlanadi. Ma'lumotlar Google va Telegram'da qoladi.",
              },
            ].map((f, i) => (
              <Card key={i} className="border-slate-200/70 shadow-none hover:shadow-md hover:-translate-y-0.5 transition-all">
                <CardContent className="p-6">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${f.color}`}>
                    {f.icon}
                  </div>
                  <h3 className="text-lg font-bold mb-1.5">{f.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-10">
            <Button asChild variant="outline" className="rounded-full gap-2">
              <Link href="/features">
                Barcha imkoniyatlar <ArrowRight size={16} />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Use cases */}
      <section className="w-full py-20 bg-slate-50">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-14">
            <Badge variant="outline" className="mb-4 rounded-full px-3 py-1 bg-white">Kim foydalanadi?</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-3">Har qanday so'rov uchun</h2>
            <p className="text-slate-500 max-w-xl mx-auto">
              FormBot turli sohalardagi mijozlarga yordam beradi.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                icon: <GraduationCap />,
                title: "O'qituvchilar",
                desc: "Testlar, uy vazifalari va o'quvchilar bilimini tekshiring.",
              },
              {
                icon: <Briefcase />,
                title: "Biznes va HR",
                desc: "Ish uchun anketa, xodimlar so'rovlari va mijoz fikrlari.",
              },
              {
                icon: <Users />,
                title: "Yig'in tashkilotchilari",
                desc: "Ishtirokchi ro'yxatga olish, ovoz berish, fikr-mulohaza.",
              },
              {
                icon: <Heart />,
                title: "Nodavlat tashkilotlar",
                desc: "So'rov, ro'yxatga olish va ma'lumot to'plash.",
              },
            ].map((u, i) => (
              <Card key={i} className="border-none shadow-sm bg-white hover:shadow-md transition-all">
                <CardContent className="p-6">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                    {u.icon}
                  </div>
                  <h3 className="text-lg font-bold mb-1.5">{u.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{u.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="w-full py-20 bg-white">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-14">
            <Badge variant="outline" className="mb-4 rounded-full px-3 py-1">Qanday ishlaydi?</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-3">3 qadamda tayyor</h2>
            <p className="text-slate-500 max-w-xl mx-auto">
              Ulanishdan birinchi javobni olguncha bor-yo'g'i bir necha daqiqa.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                step: "01",
                icon: <Bot size={20} />,
                title: "Telegram bot yarating",
                desc: "Telegram'da @BotFather orqali yangi bot yarating va API tokenni oling.",
              },
              {
                step: "02",
                icon: <FileText size={20} />,
                title: "Google Form tanlang",
                desc: "Google akkaunt bilan kiring va ulangandigan formani ro'yxatdan tanlang.",
              },
              {
                step: "03",
                icon: <MessageSquare size={20} />,
                title: "Javoblar kela boshlaydi",
                desc: "Dashboard'da statistika, Sheets'da ma'lumotlar, Telegram'da foydalanuvchi.",
              },
            ].map((s, i) => (
              <div key={i} className="relative bg-slate-50 rounded-3xl p-6">
                <div className="absolute -top-3 left-6 bg-white rounded-full px-3 py-1 text-xs font-bold text-primary shadow-sm border border-slate-200">
                  {s.step}
                </div>
                <div className="w-11 h-11 rounded-xl bg-primary text-white flex items-center justify-center mb-4 mt-3">
                  {s.icon}
                </div>
                <h3 className="text-lg font-bold mb-1.5">{s.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button size="lg" asChild className="rounded-full gap-2">
              <Link href={isAuthenticated ? "/dashboard" : "/login"}>
                {isAuthenticated ? "Dashboard'ga o'tish" : "Hoziroq ulanish"} <ArrowRight size={16} />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Social proof */}
      <section className="w-full py-20 bg-slate-50">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-14">
            <Badge variant="outline" className="mb-4 rounded-full px-3 py-1 bg-white">Fikr-mulohazalar</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-3">Foydalanuvchilar nima deydi?</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                name: "Aziz K.",
                role: "O'qituvchi, Toshkent",
                text: "O'quvchilarga Telegram'da test yuborishim juda oson bo'ldi. Ballar avtomatik chiqadi, qog'ozga yozish kerak emas.",
              },
              {
                name: "Madina R.",
                role: "HR menejer",
                text: "Xodimlar so'rovlari uchun a'lo vosita. Avvallari Google Forms linkini yuborardik, endi bot orqali qulay.",
              },
              {
                name: "Jasur T.",
                role: "Biznes egasi",
                text: "Mijozlardan fikr to'plash juda soddalashdi. Dashboard'da hamma narsa ko'rinib turibdi.",
              },
            ].map((t, i) => (
              <Card key={i} className="border-none shadow-sm bg-white">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-3 text-amber-400">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} size={14} fill="currentColor" />
                    ))}
                  </div>
                  <p className="text-slate-700 text-sm leading-relaxed mb-4">"{t.text}"</p>
                  <div className="flex items-center gap-3 pt-3 border-t border-slate-100">
                    <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                      {t.name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-semibold">{t.name}</p>
                      <p className="text-xs text-slate-500">{t.role}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Mini FAQ teaser */}
      <section className="w-full py-20 bg-white">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-10">
            <Badge variant="outline" className="mb-4 rounded-full px-3 py-1">Savol-javob</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-3">Eng ko'p beriladigan savollar</h2>
          </div>

          <div className="space-y-3">
            {[
              {
                q: "Men dasturchi emasman — foydalanaolamanmi?",
                a: "Albatta. FormBot aynan kod yoza olmaydigan foydalanuvchilar uchun yaratilgan. Telegram'da BotFather orqali bot olib, bizning saytda uni ulang — tamom.",
              },
              {
                q: "Mavjud Google Form'larim ishlaydimi?",
                a: "Ha. Ulanganingizdan keyin akkauntingizdagi barcha formalar ro'yxati chiqadi va xohlaganingizni tanlaysiz. Savollarning barcha turlari qo'llab-quvvatlanadi.",
              },
              {
                q: "Bepul tarifga nima kiradi?",
                a: "3 ta bot, cheksiz javoblar, dashboard, Google Sheets'ga yozish va Excel eksport bepul. Qo'shimcha botlar uchun Pro tarifga o'tishingiz mumkin.",
              },
              {
                q: "Ma'lumotlarim xavfsizmi?",
                a: "Ha. Tokenlar shifrlangan, javoblar Google va Telegram serverlarida qoladi. Biz faqat uzatishni ta'minlaymiz.",
              },
            ].map((f, i) => (
              <details key={i} className="group bg-slate-50 rounded-2xl px-5 py-4 cursor-pointer border border-transparent hover:border-slate-200 transition">
                <summary className="flex items-center justify-between font-semibold text-slate-800 list-none">
                  <span>{f.q}</span>
                  <span className="w-7 h-7 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 group-open:rotate-45 transition-transform text-lg leading-none">
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
                Barcha savollarni ko'rish <ArrowRight size={16} />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="w-full py-16 px-4">
        <div className="container max-w-5xl mx-auto relative overflow-hidden bg-gradient-to-br from-primary via-primary to-blue-700 text-white rounded-[2.5rem] p-10 md:p-16 text-center">
          <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
          <div className="relative z-10 flex flex-col items-center gap-5">
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur px-4 py-1.5 rounded-full text-sm">
              <Clock size={14} /> 2 daqiqada tayyor
            </div>
            <h2 className="text-3xl md:text-5xl font-bold max-w-2xl leading-tight">
              Birinchi botingizni bugun ulang
            </h2>
            <p className="text-white/80 text-base md:text-lg max-w-lg">
              Ro'yxatdan o'ting va bepul tarifda cheklovlarsiz ishlang.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 mt-6">
              <Button size="lg" variant="secondary" asChild className="rounded-full h-14 px-8 text-base font-bold text-primary">
                <Link href={isAuthenticated ? "/dashboard" : "/login"}>
                  {isAuthenticated ? "Dashboard'ga o'tish" : "Ro'yxatdan o'tish"}
                </Link>
              </Button>
              {!isAuthenticated && (
                <Button size="lg" variant="ghost" asChild className="rounded-full h-14 px-8 text-base text-white hover:bg-white/10 hover:text-white">
                  <Link href="/login">Tizimga kirish</Link>
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
