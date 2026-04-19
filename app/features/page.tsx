import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Bot,
  FileText,
  MessageSquare,
  Award,
  BarChart3,
  Check,
  Database,
  ShieldCheck,
  Zap,
  RefreshCw,
  Download,
  Bell,
  Languages,
  Sparkles,
  ArrowRight,
  ListChecks,
  Calendar,
  Clock,
  Star,
  Image as ImageIcon,
  Type,
} from "lucide-react";

export default function FeaturesPage() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero */}
      <section className="w-full bg-gradient-to-b from-blue-50/40 to-white py-16 md:py-24 text-center px-4">
        <div className="container max-w-4xl mx-auto">
          <Badge variant="outline" className="mb-4 rounded-full px-3 py-1 bg-white">
            <Sparkles size={12} className="mr-1.5" /> Imkoniyatlar
          </Badge>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Gway.uz'ning to'liq imkoniyatlari
          </h1>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto">
            Google Forms + Telegram birikmasidan eng yaxshi foydalaning. Har bir
            imkoniyat siz uchun professional so'rov muhitini ta'minlaydi.
          </p>
          <div className="mt-8">
            <Button size="lg" asChild className="rounded-full h-12 px-6">
              <Link href="/login">
                Bepul boshlash <ArrowRight size={16} className="ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Question types */}
      <section className="w-full py-16 bg-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-2">Barcha savol turlari qo'llab-quvvatlanadi</h2>
            <p className="text-slate-500">Google Forms'dagi hamma savol turlari bot orqali ishlaydi</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
            {[
              { icon: <Type size={18} />, title: "Qisqa javob", desc: "Bir qatorlik matn" },
              { icon: <FileText size={18} />, title: "Uzun matn", desc: "Paragraf" },
              { icon: <ListChecks size={18} />, title: "Bitta tanlov", desc: "Radio" },
              { icon: <ListChecks size={18} />, title: "Ko'p tanlov", desc: "Checkbox" },
              { icon: <ListChecks size={18} />, title: "Dropdown", desc: "Ro'yxatdan tanlash" },
              { icon: <Star size={18} />, title: "Shkala", desc: "1–10 baholash" },
              { icon: <Calendar size={18} />, title: "Sana", desc: "DD.MM.YYYY" },
              { icon: <Clock size={18} />, title: "Vaqt", desc: "HH:MM" },
              { icon: <ImageIcon size={18} />, title: "Fayl yuklash", desc: "Telegram xabar orqali" },
              { icon: <Award size={18} />, title: "Quiz / Test", desc: "Ball bilan" },
            ].map((q, i) => (
              <Card key={i} className="border-slate-200/70 shadow-none">
                <CardContent className="p-4">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-2">
                    {q.icon}
                  </div>
                  <p className="text-sm font-semibold">{q.title}</p>
                  <p className="text-xs text-slate-500">{q.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Main features */}
      <section className="w-full py-16 bg-slate-50">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-2">Asosiy imkoniyatlar</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              {
                icon: <Zap />,
                color: "bg-amber-100 text-amber-700",
                title: "Tezkor ulanish",
                desc: "BotFather tokenini kiriting, Google akkauntga ruxsat bering, formani tanlang — tamom. Hech qanday kod yozilmaydi, hech qanday server sozlanmaydi.",
                points: ["2 daqiqada tayyor", "Webhook avtomatik o'rnatiladi", "Xatolarni biz boshqaramiz"],
              },
              {
                icon: <Award />,
                color: "bg-purple-100 text-purple-700",
                title: "Test/Quiz rejimi",
                desc: "Google Forms'da test sifatida belgilangan formalar avtomatik aniqlanadi. Har bir savoldan keyin javob, oxirida umumiy ball chiqadi.",
                points: ["Avtomatik ball hisobi", "To'g'ri javobni ko'rsatish", "Har bir savolda feedback"],
              },
              {
                icon: <Database />,
                color: "bg-green-100 text-green-700",
                title: "Google Sheets integratsiyasi",
                desc: "Har bir to'ldirilgan javob avtomatik Google Sheets jadvaliga yoziladi. Sarlavhalar formaning savollari tartibida.",
                points: ["Real vaqtda yozish", "Ustun tartibi saqlanadi", "Sheet bevosita sizning Drive'ingizda"],
              },
              {
                icon: <BarChart3 />,
                color: "bg-pink-100 text-pink-700",
                title: "Dashboard va statistika",
                desc: "Barcha botlar, javoblar, savollar va statistika bir ekranda. Javoblarni jadvalda ko'ring, qidiring va eksport qiling.",
                points: ["Jonli javoblar oqimi", "Bugun / haftalik kesim", "Excel va CSV eksport"],
              },
              {
                icon: <RefreshCw />,
                color: "bg-blue-100 text-blue-700",
                title: "Formani yangilash",
                desc: "Google Forms'da savollarni o'zgartirsangiz, dashboard'dan bir tugma bilan sinxronlang. Qayta ulash kerak emas.",
                points: ["Bir tugmada yangilanish", "Bot to'xtatilmaydi", "Savollar tartibi saqlanadi"],
              },
              {
                icon: <MessageSquare />,
                color: "bg-teal-100 text-teal-700",
                title: "Telegram qulayligi",
                desc: "Inline tugmalar, /start, /cancel, /help buyruqlari. Foydalanuvchi qulay bot tajribasini oladi.",
                points: ["Inline keyboard", "HTML formatlash", "Bekor qilish imkoniyati"],
              },
              {
                icon: <ShieldCheck />,
                color: "bg-indigo-100 text-indigo-700",
                title: "Xavfsizlik",
                desc: "Bot tokenlari AES-256 bilan shifrlanadi. Google tokenlari faqat kerakli vaqtda yangilanadi.",
                points: ["AES-256 shifrlash", "Token avtomatik yangilanadi", "HTTPS faqat"],
              },
              {
                icon: <Languages />,
                color: "bg-rose-100 text-rose-700",
                title: "O'zbek tilida interfeys",
                desc: "Platforma to'liq o'zbek tilida. Botlaringiz ham sizning tilingizda mijozlar bilan muloqot qiladi.",
                points: ["UI to'liq o'zbekcha", "Telegram xabarlar ham", "Sana/vaqt O'zbek formatida"],
              },
            ].map((f, i) => (
              <Card key={i} className="border-none shadow-sm bg-white">
                <CardContent className="p-6">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${f.color}`}>
                    {f.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-2">{f.title}</h3>
                  <p className="text-slate-500 text-sm leading-relaxed mb-4">{f.desc}</p>
                  <ul className="space-y-1.5">
                    {f.points.map((p, pi) => (
                      <li key={pi} className="flex items-center gap-2 text-sm text-slate-700">
                        <Check size={14} className="text-green-600 shrink-0" />
                        {p}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Extras */}
      <section className="w-full py-16 bg-white">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-2">Yana qo'shimcha imkoniyatlar</h2>
            <p className="text-slate-500">Kundalik ish uchun foydali funksiyalar</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { icon: <Bell size={18} />, text: "Darhol xabar" },
              { icon: <Download size={18} />, text: "Excel/CSV eksport" },
              { icon: <Bot size={18} />, text: "Bir nechta bot" },
              { icon: <RefreshCw size={18} />, text: "Forma sinxroni" },
              { icon: <ListChecks size={18} />, text: "Javob tarixi" },
              { icon: <BarChart3 size={18} />, text: "Statistika" },
              { icon: <ShieldCheck size={18} />, text: "Token himoyasi" },
              { icon: <Sparkles size={18} />, text: "Yangilanishlar" },
            ].map((x, i) => (
              <div key={i} className="flex items-center gap-2 bg-slate-50 rounded-xl px-4 py-3">
                <div className="text-primary">{x.icon}</div>
                <span className="text-sm font-medium">{x.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="w-full py-16 px-4">
        <div className="container max-w-4xl mx-auto bg-gradient-to-br from-primary to-blue-700 text-white rounded-3xl p-10 md:p-14 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-3">
            Imkoniyatlarni bepul sinab ko'ring
          </h2>
          <p className="text-white/80 mb-7 max-w-lg mx-auto">
            Ro'yxatdan o'tish bepul va tez. Bir necha daqiqada birinchi botingiz ishga tushadi.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" variant="secondary" asChild className="rounded-full h-12 px-6 text-primary font-bold">
              <Link href="/login">Bepul boshlash</Link>
            </Button>
            <Button size="lg" variant="ghost" asChild className="rounded-full h-12 px-6 text-white hover:bg-white/10 hover:text-white">
              <Link href="/pricing">Tariflar</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
