import type { Metadata } from "next";
import Link from "next/link";
import { Shield, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Maxfiylik siyosati — FormBot",
  description:
    "FormBot foydalanuvchi ma'lumotlarini qanday to'playdi, ishlatadi va himoya qiladi.",
};

const LAST_UPDATED = "19-aprel, 2026";

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <div className="flex flex-col gap-2 mb-8 border-b pb-8 border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
            <Shield size={20} />
          </div>
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">Maxfiylik siyosati</h1>
            <p className="text-xs text-slate-400 font-medium uppercase tracking-wider">
              Oxirgi yangilangan: {LAST_UPDATED}
            </p>
          </div>
        </div>
      </div>

      <div className="prose prose-slate max-w-none">
        <p className="text-slate-600 text-base leading-relaxed">
          Ushbu Maxfiylik siyosati <b>FormBot</b> (keyingi o'rinlarda "Xizmat", "Biz") tomonidan foydalanuvchilarning shaxsiy ma'lumotlarini qanday to'planishi, ishlatilishi va himoya qilinishini belgilaydi. Platforma rasmiy ravishda <b>Gway.uz</b> loyihasi hisoblanadi.
        </p>

        <Section title="1. To'planadigan ma'lumotlar">
          <p>Biz xizmat ko'rsatish davomida quyidagi ma'lumotlarni to'playmiz:</p>
          <ul className="list-disc list-inside space-y-2 mt-3">
            <li><span className="font-bold text-slate-800">Profil ma'lumotlari:</span> Google akkauntingiz orqali olingan ism, elektron pochta manzili va profil rasmi.</li>
            <li><span className="font-bold text-slate-800">Google Forms:</span> Siz ulagan formalarning tuzilishi (savollar) va ularga kelgan javoblar.</li>
            <li><span className="font-bold text-slate-800">Telegram:</span> Siz ulaydigan Telegram bot tokenlari (barcha tokenlar bazada AES-256 algoritmi bilan shifrlangan holda saqlanadi).</li>
            <li><span className="font-bold text-slate-800">To'lovlar:</span> Click va Payme orqali amalga oshirilgan to'lovlar tarixi.</li>
          </ul>
        </Section>

        <Section title="2. Ma'lumotlardan foydalanish maqsadi">
          <p>Sizning ma'lumotlaringizdan faqat quyidagi maqsadlarda foydalaniladi:</p>
          <ul className="list-disc list-inside space-y-2 mt-3">
            <li>Platformaning barcha funksiyalarini (formadan botga uzatish) ta'minlash.</li>
            <li>Mijozlarni qo'llab-quvvatlash va texnik xatoliklarni bartaraf etish.</li>
            <li>Xizmat sifatini oshirish va yangi funksiyalarni joriy etish.</li>
          </ul>
        </Section>

        <Section title="3. Ma'lumotlar xavfsizligi">
          <p>
            Biz foydalanuvchi ma'lumotlarini himoya qilish uchun zamonaviy xavfsizlik choralaridan foydalanamiz. Bot tokenlari va maxfiy ma'lumotlar shifrlangan. Ma'lumotlar bazasi <b>Supabase</b> (Yaponiya serverlari) platformasida joylashgan va dunyo standartlariga muvofiq himoyalangan.
          </p>
        </Section>

        <Section title="4. Uchinchi tomonga ma'lumot berish">
          <p>
            Biz sizning shaxsiy ma'lumotlaringizni hech qachon sotmaymiz va uchinchi tomonlarga marketing maqsadida bermaymiz. Ma'lumotlar faqat Google, Telegram va to'lov tizimlari (Click/Payme) kabi zaruriy xizmatlar bilan integratsiya doirasida almashiladi.
          </p>
        </Section>

        <Section title="5. Sizning huquqlaringiz">
          <p>Siz har qanday vaqtda quyidagi huquqlarga egasiz:</p>
          <ul className="list-disc list-inside space-y-2 mt-3">
            <li>O'z ma'lumotlaringizni ko'rish va ularni o'zgartirish.</li>
            <li>FormBot platformasidan o'z hisobingizni butunlay o'chirish.</li>
            <li>Google akkauntingizga berilgan ruxsatnomalarni bekor qilish.</li>
          </ul>
        </Section>

        <Section title="6. Biz bilan bog'lanish">
          <p>Ushbu siyosat bo'yicha savollaringiz bo'lsa, quyidagi manzillarga murojaat qiling:</p>
          <div className="mt-5 flex flex-col gap-3">
            <a href="https://t.me/Gwayuz_support_bot" className="flex items-center gap-2 text-primary font-bold hover:underline">
              <Mail size={16} /> Telegram: @Gwayuz_support_bot
            </a>
            <a href="mailto:support@gway.uz" className="flex items-center gap-2 text-primary font-bold hover:underline">
              <Mail size={16} /> support@gway.uz
            </a>
          </div>
        </Section>
      </div>

      <div className="mt-20 pt-10 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-slate-500">
        <p>© {new Date().getFullYear()} FormBot (Gway.uz). Barcha huquqlar himoyalangan.</p>
        <Link href="/terms" className="text-primary font-bold hover:underline flex items-center gap-1">
          Foydalanish shartlari
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
