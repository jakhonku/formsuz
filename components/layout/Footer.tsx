import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t bg-slate-50 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center text-white font-bold">
                F
              </div>
              <span className="text-xl font-bold tracking-tight">FormBot</span>
            </div>
            <p className="text-slate-500 max-w-xs">
              Google Form'larni Telegram botga ulashning eng oson va tezkor usuli.
            </p>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Platforma</h4>
            <ul className="space-y-2 text-slate-500">
              <li><Link href="/#how-it-works">Qanday ishlaydi?</Link></li>
              <li><Link href="/#features">Xususiyatlar</Link></li>
              <li><Link href="/#pricing">Narxlar</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold mb-4">Bog'lanish</h4>
            <ul className="space-y-2 text-slate-500">
              <li><Link href="/help">Yordam markazi</Link></li>
              <li><a href="https://t.me/formbot_support" target="_blank" rel="noreferrer">Telegram yordam</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t text-center text-slate-400 text-sm">
          © {new Date().getFullYear()} FormBot. Barcha huquqlar himoyalangan.
        </div>
      </div>
    </footer>
  );
}
