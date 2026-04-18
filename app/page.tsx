import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Zap, ShieldCheck, Rocket, CheckCircle2 } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full py-20 lg:py-32 bg-white flex flex-col items-center text-center px-4">
        <div className="container flex flex-col items-center gap-6">
          <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/5 px-3 py-1 text-sm font-medium text-primary mb-4 animate-in fade-in slide-in-from-bottom-3 duration-500">
            <Rocket className="mr-2 h-4 w-4" />
            <span>Yangi: 10 soniyada ulanish imkoniyati</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-slate-900 max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-700">
            Google Form'ni Telegram botga <span className="text-primary italic">2 daqiqada</span> ulang
          </h1>
          <p className="text-xl text-slate-500 max-w-2xl animate-in fade-in slide-in-from-bottom-5 duration-1000">
            Google akkauntingiz orqali kiring, botingizni ulang va javoblarni bir zumda Telegram'da qabul qiling. Hech qanday kod yozish shart emas.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 mt-8 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            <Button size="lg" asChild className="rounded-full h-14 px-8 text-lg font-semibold shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all">
              <Link href="/login">
                <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                  <path
                    fill="currentColor"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="currentColor"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                  />
                  <path
                    fill="currentColor"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Bepul boshlash
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="rounded-full h-14 px-8 text-lg">
              <Link href="/#how-it-works">Qanday ishlaydi?</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="w-full py-24 bg-slate-50">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-16 underline decoration-primary decoration-4 underline-offset-8">Afzalliklarimiz</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="pt-10 flex flex-col items-center">
                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-6 text-primary">
                  <Zap size={32} />
                </div>
                <h3 className="text-xl font-bold mb-2">Tez ulanish</h3>
                <p className="text-slate-500">
                  Kod yozmasdan, 2 daqiqa ichida Google Form'ni botga ulang. Hammasi avtomatik.
                </p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="pt-10 flex flex-col items-center">
                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mb-6 text-green-600">
                  <ShieldCheck size={32} />
                </div>
                <h3 className="text-xl font-bold mb-2">Xavfsizlik</h3>
                <p className="text-slate-500">
                  Ma'lumotlaringiz Google ekotizimida xavfsiz saqlanadi. Biz faqat uzatishni ta'minlaymiz.
                </p>
              </CardContent>
            </Card>
            <Card className="border-none shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="pt-10 flex flex-col items-center">
                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-6 text-purple-600">
                  <Rocket size={32} />
                </div>
                <h3 className="text-xl font-bold mb-2">Bepul boshlash</h3>
                <p className="text-slate-500">
                  Dastlabki 3 ta formani mutlaqo bepul ulashingiz mumkin. Kredit karta shart emas.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How it works Section */}
      <section id="how-it-works" className="w-full py-24 bg-white">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-3xl font-bold text-center mb-16">Qanday ishlaydi?</h2>
          <div className="space-y-12">
            {[
              { step: "1", title: "Kirish", desc: "Google akkauntingiz orqali platformaga kiring." },
              { step: "2", title: "Botni ulash", desc: "Telegram bot tokenni kiritib, botingizni ro'yxatdan o'tkazing." },
              { step: "3", title: "Formani tanlash", desc: "Telegram'ga kelishi kerak bo'lgan Google Formani tanlang." }
            ].map((item, index) => (
              <div key={index} className="flex gap-6 items-start">
                <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold flex-shrink-0">
                  {item.step}
                </div>
                <div>
                  <h3 className="text-2xl font-bold mb-2">{item.title}</h3>
                  <p className="text-slate-500 text-lg">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-24 bg-primary text-white text-center rounded-[3rem] mb-20 mx-4 container overflow-hidden relative">
        <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/2 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 translate-y-1/2 -translate-x-1/2 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex flex-col items-center gap-6">
          <h2 className="text-3xl md:text-5xl font-bold">Hoziroq boshlang!</h2>
          <p className="text-white/80 text-lg max-w-md">
            Telegram botingizni professional darajaga ko'taring va javoblarni yo'qotib qo'ymang.
          </p>
          <Button size="lg" variant="secondary" asChild className="rounded-full h-14 px-10 text-lg font-bold text-primary">
            <Link href="/login">Hoziroq boshlash</Link>
          </Button>
        </div>
      </section>
    </div>
  );
}
