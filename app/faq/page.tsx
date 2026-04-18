import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Rocket,
  Bot,
  FileText,
  ShieldCheck,
  CreditCard,
  HelpCircle,
  MessageCircle,
  ArrowRight,
  Send,
} from "lucide-react";

type FAQ = { q: string; a: string };
type Section = { id: string; title: string; icon: React.ReactNode; items: FAQ[] };

const sections: Section[] = [
  {
    id: "boshlash",
    title: "Boshlash",
    icon: <Rocket size={18} />,
    items: [
      {
        q: "FormBot nima va u qanday ishlaydi?",
        a: "FormBot — bu Google Form'ingizni Telegram botga ulab beruvchi platforma. Siz botga savol-javob formaligini bog'laysiz, foydalanuvchi Telegram'da botga /start bersa, bot unga savollarni ketma-ket yuboradi. Har bir javob Google Sheets jadvalga avtomatik yoziladi.",
      },
      {
        q: "Qanday ro'yxatdan o'taman?",
        a: "Bosh sahifadagi 'Bepul boshlash' tugmasini bosing va Google akkauntingiz bilan kiring. Hech qanday parol kiritish yoki karta tasdiqlash shart emas.",
      },
      {
        q: "Birinchi botni qanday ulayman?",
        a: "1) Telegram'da @BotFather orqali yangi bot yarating va API tokenni oling. 2) Dashboard'da 'Yangi bot ulash' tugmasini bosing. 3) Tokenni joylang va ro'yxatdan kerakli Google Form'ni tanlang. Tamom — bot darhol ishlay boshlaydi.",
      },
      {
        q: "Telegram bot tokenni qayerdan olaman?",
        a: "Telegram'da @BotFather chatiga kiring, /newbot buyrug'ini yuboring, bot nomi va foydalanuvchi nomini tanlang. BotFather sizga HTTP API tokenini beradi — shu tokenni FormBot'ga joylashtiring.",
      },
      {
        q: "Kod bilmasam foydalana olamanmi?",
        a: "Ha, albatta. FormBot aynan kod yoza olmaydigan foydalanuvchilar uchun ishlab chiqilgan. Hech qanday dasturlash bilimi talab qilinmaydi.",
      },
    ],
  },
  {
    id: "forma",
    title: "Google Forms bilan ishlash",
    icon: <FileText size={18} />,
    items: [
      {
        q: "Qaysi Google Forms savol turlari qo'llab-quvvatlanadi?",
        a: "Barchasi: qisqa javob, uzun matn (paragraf), bitta tanlov (radio), ko'p tanlov (checkbox), dropdown, shkala (1–10), sana, vaqt va fayl yuklash. Test rejimi uchun ball va to'g'ri javoblar ham avtomatik o'qiladi.",
      },
      {
        q: "Mavjud Google Form'larim ishlaydimi?",
        a: "Ha. Google akkauntga ruxsat bergandan keyin, barcha formalaringiz ro'yxati chiqadi — xohlaganini tanlang.",
      },
      {
        q: "Google Forms'da savollarni o'zgartirsam nima bo'ladi?",
        a: "Bot detal sahifasidagi 'Formani yangilash' tugmasini bosing — savollar avtomatik sinxronlanadi. Qayta ulash kerak emas va bot ishini to'xtatmaydi.",
      },
      {
        q: "Test (Quiz) rejimi qanday ishlaydi?",
        a: "Google Forms'da formani Quiz sifatida sozlasangiz, FormBot buni avtomatik aniqlaydi. Har bir savoldan keyin foydalanuvchiga javob to'g'ri yoki noto'g'riligi ko'rsatiladi, oxirida esa umumiy ball chiqadi.",
      },
      {
        q: "Fayl yuklash savollari qanday ishlaydi?",
        a: "Foydalanuvchi Telegram'ga fayl yuboradi va u saqlanadi. Keyin dashboard'da yoki Sheets'da fayl linki ko'rinadi.",
      },
    ],
  },
  {
    id: "bot",
    title: "Bot va javoblar",
    icon: <Bot size={18} />,
    items: [
      {
        q: "Bir akkauntda nechta bot ula olaman?",
        a: "Bepul tarifda 1 ta bot. Professional tarifda 10 ta botgacha. Biznes tarifda 100 ta botgacha va cheksiz imkoniyatlar.",
      },
      {
        q: "Botni vaqtincha to'xtatish mumkinmi?",
        a: "Ha. Dashboard'da 'So'rovni to'xtatish' tugmasini bosing — bot javob bermay turadi, lekin o'chmaydi. Xohlagan vaqt qayta yoqishingiz mumkin.",
      },
      {
        q: "Javoblarni qayerdan ko'ra olaman?",
        a: "Ikki joydan: 1) Dashboard'dagi bot sahifasida jadvalda, 2) Google Sheets jadvalida. Excel formatiga eksport qilish Professional va undan yuqori tariflarda mavjud.",
      },
      {
        q: "Admin bilan real-vaqtda chat nima?",
        a: "Bu Professional tarifdagi imkoniyat bo'lib, foydalanuvchilar botga yozganida siz platforma orqali ularga darhol javob qaytara olasiz. Bu mijozlarni qo'llab-quvvatlash uchun juda qulay.",
      },
    ],
  },
  {
    id: "xavfsizlik",
    title: "Xavfsizlik va ma'lumotlar",
    icon: <ShieldCheck size={18} />,
    items: [
      {
        q: "Mening ma'lumotlarim xavfsizmi?",
        a: "Ha. Bot tokenlari AES-256-CBC algoritmi bilan shifrlanadi. Google tokenlari faqat zarur bo'lganda yangilanadi va sessiyalar JWT orqali boshqariladi.",
      },
      {
        q: "FormBot mening Google Forms javoblarimni saqlaydimi?",
        a: "Biz faqat bot orqali kelgan javoblarni vaqtinchalik saqlaymiz (dashboard ko'rsatish uchun). Asosiy ma'lumotlar Google Sheets'ingizda qoladi va sizning nazoratingizda.",
      },
      {
        q: "Google akkauntimga qanday ruxsat beraman?",
        a: "FormBot faqat 4 ta ruxsat so'raydi: 1) Drive'dagi formalar ro'yxati, 2) Forma savollari (faqat o'qish), 3) Forma javoblari (faqat o'qish), 4) Sheets'ga yozish. Ruxsatni istalgan vaqt myaccount.google.com orqali olib tashlashingiz mumkin.",
      },
    ],
  },
  {
    id: "tariflar",
    title: "Tariflar va to'lovlar",
    icon: <CreditCard size={18} />,
    items: [
      {
        q: "Bepul tarif haqiqatan bepulmi?",
        a: "Ha, 100% bepul — karta talab qilinmaydi, vaqt cheklovi yo'q. 1 ta bot va 1 ta forma ulash imkoniyati mavjud.",
      },
      {
        q: "Professional tarif qanchaga tushadi?",
        a: "Oyiga 99 000 so'm. 10 ta botgacha, real-vaqtda chat, Excel eksport va prioritet qo'llab-quvvatlash kiradi.",
      },
      {
        q: "Gway.uz bilan tarifi nima?",
        a: "Bu bizning investorlarimiz va strategik hamkorlarimiz uchun maxsus tarif. Unda barcha limitlar olib tashlangan. Ushbu tarifga o'tish uchun admin bilan bog'lanish lozim.",
      },
      {
        q: "Qanday to'lov qila olaman?",
        a: "Click, Payme va bank karta orqali. Shuningdek, Telegram Admin orqali hisobni to'ldirish va tarifni faollashtirish mumkin.",
      },
    ],
  },
];

export default function FaqPage() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero */}
      <section className="w-full bg-gradient-to-b from-blue-50/40 to-white py-16 md:py-20 text-center px-4">
        <div className="container max-w-3xl mx-auto">
          <Badge variant="outline" className="mb-4 rounded-full px-3 py-1 bg-white">
            <HelpCircle size={12} className="mr-1.5" /> Savol-javob
          </Badge>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
            Tez-tez so'raladigan savollar
          </h1>
          <p className="text-slate-500 text-lg">
            FormBot'dan qanday foydalanish haqida to'liq yo'riqnoma. Kerakli savolni
            pastdagi ro'yxatdan toping yoki to'g'ridan-to'g'ri qidiring.
          </p>
        </div>
      </section>

      {/* Quick nav */}
      <section className="w-full bg-white py-6 border-b border-slate-100 sticky top-16 z-30 backdrop-blur bg-white/90">
        <div className="container max-w-5xl mx-auto px-4">
          <div className="flex flex-wrap gap-2 justify-center">
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-slate-50 border border-slate-200 text-sm font-medium text-slate-700 hover:bg-primary hover:text-white hover:border-primary transition"
              >
                <span className="text-primary group-hover:text-white">{s.icon}</span>
                {s.title}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Sections */}
      <section className="w-full py-14 bg-white">
        <div className="container max-w-4xl mx-auto px-4 space-y-12">
          {sections.map((sec) => (
            <div key={sec.id} id={sec.id} className="scroll-mt-32">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                  {sec.icon}
                </div>
                <h2 className="text-2xl font-bold">{sec.title}</h2>
              </div>

              <div className="space-y-2">
                {sec.items.map((f, i) => (
                  <details
                    key={i}
                    className="group bg-slate-50 hover:bg-slate-100/70 rounded-2xl px-5 py-4 cursor-pointer border border-transparent open:border-slate-200 open:bg-white open:shadow-sm transition"
                  >
                    <summary className="flex items-center justify-between gap-3 font-semibold text-slate-800 list-none">
                      <span>{f.q}</span>
                      <span className="w-7 h-7 shrink-0 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-500 group-open:rotate-45 transition-transform text-lg leading-none">
                        +
                      </span>
                    </summary>
                    <p className="text-slate-500 text-[15px] mt-3 leading-relaxed">{f.a}</p>
                  </details>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Still have questions */}
      <section className="w-full py-16 bg-slate-50">
        <div className="container max-w-5xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-none shadow-sm bg-white">
              <CardContent className="p-7">
                <div className="w-11 h-11 rounded-xl bg-blue-100 text-primary flex items-center justify-center mb-4">
                  <MessageCircle size={20} />
                </div>
                <h3 className="text-xl font-bold mb-2">Javob topolmadingizmi?</h3>
                <p className="text-slate-500 text-sm mb-5 leading-relaxed">
                  Telegram qo'llab-quvvatlash guruhiga qo'shiling — jamoa va mutaxassislar
                  darhol yordam beradi.
                </p>
                <Button asChild className="rounded-full gap-2 bg-green-600 hover:bg-green-700">
                  <a href="https://t.me/formbot_support" target="_blank" rel="noreferrer">
                    <Send size={16} /> Telegram guruhi
                  </a>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-none shadow-sm bg-white">
              <CardContent className="p-7">
                <div className="w-11 h-11 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-4">
                  <Rocket size={20} />
                </div>
                <h3 className="text-xl font-bold mb-2">Hoziroq sinab ko'ring</h3>
                <p className="text-slate-500 text-sm mb-5 leading-relaxed">
                  Yozishdan ko'ra amalda ko'rish oson. Bepul tarifda birinchi botingizni
                  bir necha daqiqada ulang.
                </p>
                <Button asChild className="rounded-full gap-2">
                  <Link href="/login">
                    Bepul boshlash <ArrowRight size={16} />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
