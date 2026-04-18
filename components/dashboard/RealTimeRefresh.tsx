"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCcw } from "lucide-react";

interface RealTimeRefreshProps {
  intervalMs?: number;
}

export function RealTimeRefresh({ intervalMs = 15000 }: RealTimeRefreshProps) {
  const router = useRouter();
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsRefreshing(true);
      router.refresh();
      setLastRefresh(new Date());
      
      // Reset animation state after a brief moment
      setTimeout(() => setIsRefreshing(false), 1000);
    }, intervalMs);

    return () => clearInterval(interval);
  }, [router, intervalMs]);

  return (
    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
      <RefreshCcw size={10} className={`${isRefreshing ? "animate-spin text-primary" : ""}`} />
      <span>
        Avto-yangilanish faol • {lastRefresh.toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
      </span>
    </div>
  );
}
