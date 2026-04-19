import Link from "next/link";
import { Send, Mail } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-slate-50 py-14">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <img 
                src="/logo.png" 
                alt="Gway.uz Logo" 
                className="h-32 w-auto" 
              />
            </div>
            <p className="text-slate-500 max-w-sm mb-5 text-sm leading-relaxed">
              Google Form'larni Telegram botga ulashning eng oson va tezkor usuli.
              Kodsiz, 2 daqiqada.
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://t.me/Gwayuz_support_bot"
                target="_blank"
                rel="noreferrer"
                className="w-9 h-9 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-slate-500 hover:text-primary hover:border-primary/30 transition"
                aria-label="Telegram"
              >
                <Send size={16} />
              </a>
              <a
                href="mailto:support@gway.uz"
                className="w-9 h-9 bg-white border border-slate-200 rounded-lg flex items-center justify-center text-slate-500 hover:text-primary hover:border-primary/30 transition"
                aria-label="Email"
              >
                <Mail size={16} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-sm text-slate-900">Platforma</h4>
            <ul className="space-y-2.5 text-slate-500 text-sm">
              <li><Link href="/features" className="hover:text-primary transition">Imkoniyatlar</Link></li>
              <li><Link href="/pricing" className="hover:text-primary transition">Tariflar</Link></li>
              <li><Link href="/#how-it-works" className="hover:text-primary transition">Qanday ishlaydi?</Link></li>
              <li><Link href="/login" className="hover:text-primary transition">Boshlash</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-sm text-slate-900">Yordam</h4>
            <ul className="space-y-2.5 text-slate-500 text-sm">
              <li><Link href="/faq" className="hover:text-primary transition">Savol-javob</Link></li>
              <li><Link href="/help" className="hover:text-primary transition">Yordam markazi</Link></li>
              <li>
                <a href="https://t.me/Gwayuz_support_bot" target="_blank" rel="noreferrer" className="hover:text-primary transition">
                  Telegram qo'llab-quvvatlash
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-sm text-slate-900">Huquqiy</h4>
            <ul className="space-y-2.5 text-slate-500 text-sm">
              <li><Link href="/privacy" className="hover:text-primary transition">Maxfiylik siyosati</Link></li>
              <li><Link href="/terms" className="hover:text-primary transition">Foydalanish shartlari</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-3 text-slate-400 text-sm">
          <p>© {new Date().getFullYear()} Gway.uz. Barcha huquqlar himoyalangan.</p>
          <p>Made with care in Uzbekistan</p>
        </div>
      </div>
    </footer>
  );
}
