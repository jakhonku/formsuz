import type { Metadata } from "next";
import Link from "next/link";
import { Shield, ScrollText, ArrowRight, Gavel } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Huquqiy ma'lumotlar — FormBot",
  description: "FormBot platformasining huquqiy hujjatlari va qoidalari.",
};

export default function LegalPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-20">
      <div className="text-center mb-16">
        <div className="w-16 h-16 rounded-3xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-6">
          <Gavel size={32} />
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 mb-4">
          Huquqiy ma'lumotlar
        </h1>
        <p className="text-slate-500 text-lg max-w-2xl mx-auto">
          FormBot platformasidan foydalanish qoidalari va xavfsizlik siyosati bilan tanishing.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link href="/privacy">
          <Card className="hover:shadow-xl transition-all border-none shadow-md group h-full">
            <CardContent className="p-8">
              <Shield className="text-primary mb-4 group-hover:scale-110 transition-transform" size={40} />
              <h2 className="text-2xl font-bold mb-3 flex items-center justify-between">
                Maxfiylik siyosati
                <ArrowRight size={20} className="text-slate-300 group-hover:text-primary transition-colors" />
              </h2>
              <p className="text-slate-500 leading-relaxed">
                Ma'lumotlaringizni qanday to'plashimiz, saqlashimiz va himoya qilishimiz haqida ma'lumot.
              </p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/terms">
          <Card className="hover:shadow-xl transition-all border-none shadow-md group h-full">
            <CardContent className="p-8">
              <ScrollText className="text-primary mb-4 group-hover:scale-110 transition-transform" size={40} />
              <h2 className="text-2xl font-bold mb-3 flex items-center justify-between">
                Foydalanish shartlari
                <ArrowRight size={20} className="text-slate-300 group-hover:text-primary transition-colors" />
              </h2>
              <p className="text-slate-500 leading-relaxed">
                Platformadan foydalanishda rioya qilinishi kerak bo'lgan asosiy qoidalar va shartlar.
              </p>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="mt-20 p-8 rounded-[2.5rem] bg-slate-50 border border-slate-100 text-center">
        <h3 className="text-xl font-bold mb-2">Savollaringiz bormi?</h3>
        <p className="text-slate-500 mb-6">Huquqiy masalalar bo'yicha biz bilan bog'laning.</p>
        <a 
            href="mailto:support@gway.uz" 
            className="inline-flex items-center gap-2 text-primary font-black hover:underline text-lg"
        >
          support@gway.uz
        </a>
      </div>
    </div>
  );
}
