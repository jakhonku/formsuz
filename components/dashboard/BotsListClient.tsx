"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { PlusCircle, Search, Bot, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { BotCard, BotCardData } from "./BotCard";

type Props = { bots: BotCardData[] };

type FilterValue = "all" | "active" | "inactive";

export function BotsListClient({ bots }: Props) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterValue>("all");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return bots.filter((b) => {
      if (filter !== "all" && b.status !== filter) return false;
      if (!q) return true;
      return (
        b.telegramBotUsername?.toLowerCase().includes(q) ||
        b.name.toLowerCase().includes(q) ||
        b.formTitle.toLowerCase().includes(q)
      );
    });
  }, [bots, query, filter]);

  const totalActive = bots.filter((b) => b.status === "active").length;

  return (
    <div className="flex flex-col h-full gap-5">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Sizning botlaringiz</h1>
          <p className="text-slate-500 text-sm">
            Jami {bots.length} ta bot · {totalActive} aktiv
          </p>
        </div>
        <Button asChild size="sm" className="rounded-full h-10 gap-2 shadow-md shadow-primary/20">
          <Link href="/dashboard/new">
            <PlusCircle size={16} />
            Yangi bot ulash
          </Link>
        </Button>
      </div>

      {bots.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Bot nomi yoki forma bo'yicha qidirish"
              className="h-10 pl-9 rounded-xl bg-white border-slate-200"
            />
          </div>
          <div className="inline-flex bg-slate-100 rounded-xl p-1 gap-1">
            <FilterChip active={filter === "all"} onClick={() => setFilter("all")}>
              Hammasi
            </FilterChip>
            <FilterChip active={filter === "active"} onClick={() => setFilter("active")}>
              Aktiv
            </FilterChip>
            <FilterChip active={filter === "inactive"} onClick={() => setFilter("inactive")}>
              Tohtatilgan
            </FilterChip>
          </div>
        </div>
      )}

      {bots.length === 0 ? (
        <Card className="border-dashed border-2 bg-transparent flex-1">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center h-full">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <Bot className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-xl font-semibold mb-1">Hali botlar yo'q</h3>
            <p className="text-slate-500 text-sm max-w-sm mb-6">
              Birinchi Telegram botingizni ulab, Google Form javoblarini qabul qilishni boshlang.
            </p>
            <Button asChild className="rounded-full">
              <Link href="/dashboard/new">Yangi bot ulash</Link>
            </Button>
          </CardContent>
        </Card>
      ) : filtered.length === 0 ? (
        <Card className="border-dashed border-2 bg-transparent">
          <CardContent className="py-12 text-center text-slate-500 text-sm">
            <Filter className="mx-auto mb-2 text-slate-300" />
            Qidiruv yoki filter bo'yicha botlar topilmadi.
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {filtered.map((bot) => (
            <BotCard key={bot.id} bot={bot} />
          ))}
        </div>
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 h-8 rounded-lg text-xs font-medium transition ${
        active
          ? "bg-white text-primary shadow-sm"
          : "text-slate-500 hover:text-slate-700"
      }`}
    >
      {children}
    </button>
  );
}
