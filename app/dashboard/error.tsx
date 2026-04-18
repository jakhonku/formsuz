"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, RefreshCcw } from "lucide-react";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-6">
        <AlertTriangle size={40} />
      </div>
      <h2 className="text-3xl font-bold tracking-tight mb-2">Nimadir noto'g'ri bajarildi</h2>
      <p className="text-slate-500 max-w-md mb-8">
        Kutilmagan xatolik yuz berdi. Iltimos, sahifani yangilang yoki birozdan so'ng qayta urinib ko'ring.
      </p>
      <div className="flex flex-col sm:flex-row gap-4">
        <Button onClick={() => reset()} className="rounded-full gap-2 px-8 h-12">
          <RefreshCcw size={18} />
          Qayta urinish
        </Button>
        <Button variant="outline" asChild className="rounded-full px-8 h-12">
          <Link href="/dashboard">Dashboardga qaytish</Link>
        </Button>
      </div>
    </div>
  );
}
