import type { Metadata } from "next";
import Link from "next/link";
import { ScrollText, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Foydalanish shartlari — FormBot",
  description:
    "FormBot xizmatidan foydalanishning shartlari, cheklovlari va javobgarliklari.",
};

const LAST_UPDATED = "19-aprel, 2026";

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <div className="flex flex-col gap-2 mb-8 border-b pb-8 border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
            <ScrollText size={20} />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">Foydalanish shartlari</h1>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">
              Oxirgi yangilangan: {LAST_UPDATED}
            </p>
          </div>
        </div>
      </div>

      <div className="prose prose-slate max-w-none">
        <p className="text-slate-600 text-base leading-relaxed">
          FormBot platformasidan foydalanganingiz uchun rahmat. Ushbu shartlar <b>FormBot</b> ("Xizmat") va Siz ("Foydalanuvchi") o'rtasidagi munosabatlarni tartibga soladi. Platforma <b>Gway.uz</b> tomonidan boshqariladi.
        </p>

        <Section title="1. Xizmat tavsifi">
          <p>
            FormBot — Google Forms'dagi savollarni Telegram bot orqali yuborish, javoblarni yig'ish va ularni tahlil qilish imkonini beruvchi no-code platformadir.
          </p>
        </Section>

        <Section title="2. Hisob va xavfsizlik">
          <ul className="list-disc list-inside space-y-2 mt-3 text-slate-600 text-[15px]">
            <li>Ro'yxatdan o'tish uchun Google akkaunti talab qilinadi.</li>
            <li>Siz o'z hisobingiz va parolingiz xavfsizligi uchun shaxsan javobgarsiz.</li>
            <li>Shubhali faoliyat aniqlansa, hisobni vaqtincha yoki butunlay cheklash huquqiga egamiz.</li>
          </ul>
        </Section>

        <Section title="3. Tariflar va to'lovlar">
          <ul className="list-disc list-inside space-y-2 mt-3 text-slate-600 text-[15px]">
            <li>FREE tarifi bepul taqdim etiladi va 1 ta bot bilan cheklangan.</li>
            <li>Professional va Biznes tariflari oylik obuna asosida ishlaydi.</li>
            <li>To'lovlar Click va Payme tizimlari orqali amalga oshiriladi.</li>
            <li>Agar xizmatda texnik muammo bo'lmasa, to'langan summalar qaytarilmaydi.</li>
          </ul>
        </Section>

        <Section title="4. Taqiqlangan faoliyat">
          <p>Platformadan quyidagi maqsadlarda foydalanish qat'iyan man etiladi:</p>
          <ul className="list-disc list-inside space-y-2 mt-3 text-slate-600 text-[15px]">
            <li>Spam xabarlar yuborish yoki firibgarlik (fishing).</li>
            <li>O'zbekiston Respublikasi qonunchiligiga zid kontent tarqatish.</li>
            <li>Tizimga hujum qilish yoki boshqa foydalanuvchilar ishiga xalaqit berish.</li>
          </ul>
        </Section>

        <Section title="5. Javobgarlikning cheklanishi">
          <p>
            Biz platformaning 24/7 ishlashiga harakat qilamiz, ammo Google yoki Telegram tomonidagi uzilishlar uchun javobgar emasmiz. Xizmat "boricha" (as is) tamoyili asosida taqdim etiladi.
          </p>
        </Section>

        <Section title="6. Biz bilan bog'lanish">
          <p>Savollaringiz bo'lsa, Telegram orqali murojaat qilishingiz mumkin:</p>
          <div className="mt-5 flex flex-col gap-3">
            <a href="https://t.me/Gwayuz_support_bot" className="flex items-center gap-2 text-primary font-bold hover:underline">
              <Mail size={16} /> @Gwayuz_support_bot
            </a>
          </div>
        </Section>
      </div>

      <div className="mt-20 pt-10 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
        <p>© {new Date().getFullYear()} FormBot (Gway.uz). Barcha huquqlar himoyalangan.</p>
        <Link href="/privacy" className="text-primary font-bold hover:underline flex items-center gap-1">
          Maxfiylik siyosati
        </Link>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-12">
      <h2 className="text-xl font-black text-slate-900 mb-4">{title}</h2>
      <div className="text-slate-600 text-[15px] leading-relaxed">
        {children}
      </div>
    </section>
  );
}
