import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HelpCircle, MessageCircle, PlayCircle, BookOpen } from "lucide-react";

const faqs = [
  {
    question: "FormBot qanday ishlaydi?",
    answer: "FormBot sizning Google Formangizni Telegram botga webhook orqali ulaydi. Har safar kimdir formani to'ldirsa, bot sizga darhol xabar yuboradi va javobni Google Sheets jadvaliga ham saqlaydi."
  },
  {
    question: "Telegram bot tokenni qayerdan olaman?",
    answer: "Telegram'da @BotFather botini qidiring, /newbot buyrug'ini bering va ko'rsatmalarga amal qiling. Yakunda sizga berilgan API tokenni nusxalab FormBot dashboardiga kiriting."
  },
  {
    question: "Xizmatdan foydalanish bepulmi?",
    answer: "Ha, dastlabki 3 ta formani ulash mutlaqo bepul. Ko'proq formalar va qo'shimcha imkoniyatlar uchun maxsus tariflarimiz mavjud."
  },
  {
    question: "Ma'lumotlarim xavfsizligi qanday ta'minlanadi?",
    answer: "Biz sizning Google Formangizdagi ma'lumotlarni saqlamaymiz, faqat ularni uzatamiz. Barcha ma'lumotlar Google ekotizimida va Telegram serverlarida qoladi."
  }
];

export default function HelpPage() {
  return (
    <div className="container mx-auto px-4 py-16 max-w-4xl">
      <div className="text-center mb-16">
        <h1 className="text-4xl font-bold tracking-tight mb-4">Yordam Markazi</h1>
        <p className="text-slate-500 text-lg">
          FormBot bilan ishlashda savollaringiz bormi? Biz sizga yordam beramiz.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
        <Card className="border-none shadow-md bg-blue-50/50">
          <CardHeader>
            <PlayCircle className="text-primary h-10 w-10 mb-2" />
            <CardTitle>Video Qo'llanmalar</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 mb-6">
              Platformani 2 daqiqada qanday sozlashni video orqali o'rganing.
            </p>
            <Button variant="outline" className="rounded-full gap-2">
              Tomosha qilish
            </Button>
          </CardContent>
        </Card>

        <Card className="border-none shadow-md bg-green-50/50">
          <CardHeader>
            <MessageCircle className="text-green-600 h-10 w-10 mb-2" />
            <CardTitle>Telegram Yordam</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-600 mb-6">
              Mutaxassislarimiz bilan bog'laning va savollaringizga javob oling.
            </p>
            <Button className="rounded-full gap-2 bg-green-600 hover:bg-green-700 h-10">
              Guruhga qo'shilish
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-8">
        <div className="flex items-center gap-2 mb-6">
          <HelpCircle className="text-primary" />
          <h2 className="text-2xl font-bold">Tez-tez so'raladigan savollar</h2>
        </div>
        
        <Card className="border-none shadow-md px-6 py-4">
          <Accordion className="w-full">
            {faqs.map((faq, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-b last:border-none">
                <AccordionTrigger className="text-left font-semibold hover:no-underline text-lg py-6">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-slate-500 text-base pb-6 leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Card>
      </div>

      <div className="mt-20 p-10 bg-slate-900 rounded-3xl text-white text-center">
        <BookOpen className="h-12 w-12 mx-auto mb-6 text-primary" />
        <h3 className="text-2xl font-bold mb-4">Hali ham savollaringiz bormi?</h3>
        <p className="text-slate-400 mb-8 max-w-md mx-auto">
          Bizning hujjatlar bo'limida har bir funksiya haqida batafsil ma'lumot topishingiz mumkin.
        </p>
        <Button variant="secondary" className="rounded-full px-8 h-12 font-bold">
          To'liq yo'riqnoma
        </Button>
      </div>
    </div>
  );
}
