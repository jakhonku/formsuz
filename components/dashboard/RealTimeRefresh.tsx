"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { RefreshCcw } from "lucide-react";

interface RealTimeRefreshProps {
  intervalMs?: number;
}

export function RealTimeRefresh({ intervalMs = 60000 }: RealTimeRefreshProps) {
  const router = useRouter();
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    const start = () => {
      if (interval) return;
      interval = setInterval(() => {
        if (document.visibilityState !== "visible") return;
        setIsRefreshing(true);
        router.refresh();
        setLastRefresh(new Date());
        setTimeout(() => setIsRefreshing(false), 800);
      }, intervalMs);
    };

    const stop = () => {
      if (interval) {
        clearInterval(interval);
        interval = null;
      }
    };

    const onVisibility = () => {
      if (document.visibilityState === "visible") start();
      else stop();
    };

    if (document.visibilityState === "visible") start();
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      stop();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [router, intervalMs]);

  return (
    <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
      <RefreshCcw size={10} className={`${isRefreshing ? "animate-spin text-primary" : ""}`} />
      <span>
        Avto-yangilanish • {lastRefresh.toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" })}
      </span>
    </div>
  );
}
