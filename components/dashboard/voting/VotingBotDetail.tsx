"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import {
  ArrowLeft,
  Bot,
  ExternalLink,
  Loader2,
  Plus,
  Power,
  Trash2,
  Trophy,
  User,
  Users,
  Vote,
} from "lucide-react";

type Candidate = {
  id: string;
  name: string;
  description: string | null;
  photoUrl: string | null;
  order: number;
  votesCount: number;
};

type VoteItem = {
  id: string;
  candidateId: string;
  candidateName: string;
  chatId: string;
  voterName: string | null;
  voterUsername: string | null;
  createdAt: string;
};

type Props = {
  bot: {
    id: string;
    name: string;
    title: string;
    description: string | null;
    telegramBotUsername: string | null;
    status: string;
    oneVotePerUser: boolean;
    totalVotes: number;
    candidates: Candidate[];
  };
  recentVotes: VoteItem[];
};

export function VotingBotDetail({ bot, recentVotes }: Props) {
  const router = useRouter();
  const [candidates, setCandidates] = useState(bot.candidates);
  const [addOpen, setAddOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newPhoto, setNewPhoto] = useState("");
  const [adding, setAdding] = useState(false);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState(bot.status);
  const [oneVotePerUser, setOneVotePerUser] = useState(bot.oneVotePerUser);

  const sorted = useMemo(
    () => [...candidates].sort((a, b) => b.votesCount - a.votesCount),
    [candidates]
  );
  const total = useMemo(
    () => candidates.reduce((sum, c) => sum + c.votesCount, 0),
    [candidates]
  );
  const leader = sorted[0];

  async function handleAddCandidate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim()) {
      toast.error("Nomzod nomini kiriting");
      return;
    }
    setAdding(true);
    try {
      const res = await fetch(`/api/voting-bot/${bot.id}/candidates`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName.trim(),
          description: newDesc.trim(),
          photoUrl: newPhoto.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Qo'shishda xatolik");
      setCandidates((prev) => [
        ...prev,
        { ...data, votesCount: 0, order: data.order ?? prev.length },
      ]);
      setNewName("");
      setNewDesc("");
      setNewPhoto("");
      setAddOpen(false);
      toast.success("Nomzod qo'shildi");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setAdding(false);
    }
  }

  async function handleDeleteCandidate(id: string, name: string) {
    if (!confirm(`"${name}" nomzodini o'chirishni xohlaysizmi? Uning barcha ovozlari ham o'chadi.`)) {
      return;
    }
    try {
      const res = await fetch(`/api/voting-bot/${bot.id}/candidates/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "O'chirishda xatolik");
      setCandidates((prev) => prev.filter((c) => c.id !== id));
      toast.success("Nomzod o'chirildi");
      router.refresh();
    } catch (error: any) {
      toast.error(error.message);
    }
  }

  async function handleToggleStatus() {
    setBusy(true);
    const next = status === "active" ? "inactive" : "active";
    try {
      const res = await fetch(`/api/voting-bot/${bot.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Xatolik");
      setStatus(next);
      toast.success(next === "active" ? "Bot faollashtirildi" : "Bot to'xtatildi");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleToggleOneVote(checked: boolean) {
    setOneVotePerUser(checked);
    try {
      const res = await fetch(`/api/voting-bot/${bot.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oneVotePerUser: checked }),
      });
      if (!res.ok) throw new Error();
      toast.success("Sozlama saqlandi");
    } catch {
      setOneVotePerUser(!checked);
      toast.error("Saqlashda xatolik");
    }
  }

  async function handleDeleteBot() {
    if (!confirm("Bu botni butunlay o'chirishni xohlaysizmi? Barcha nomzodlar va ovozlar yo'qoladi.")) {
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(`/api/voting-bot/${bot.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Bot o'chirildi");
      router.push("/dashboard/voting-bots");
      router.refresh();
    } catch {
      toast.error("O'chirishda xatolik");
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="sm" className="rounded-full">
          <Link href="/dashboard/voting-bots">
            <ArrowLeft size={16} className="mr-1" />
            Orqaga
          </Link>
        </Button>
      </div>

      {/* Header */}
      <Card className="border-none shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div className="flex items-start gap-4 min-w-0">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
                <Vote size={24} />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl font-bold truncate">{bot.title}</h1>
                {bot.description && (
                  <p className="text-sm text-slate-500 mt-1 line-clamp-2">
                    {bot.description}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  {bot.telegramBotUsername && (
                    <a
                      href={`https://t.me/${bot.telegramBotUsername}`}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-primary flex items-center gap-1 hover:underline"
                    >
                      <Bot size={12} />
                      @{bot.telegramBotUsername}
                      <ExternalLink size={10} />
                    </a>
                  )}
                  <Badge
                    variant={status === "active" ? "default" : "outline"}
                    className="text-xs"
                  >
                    {status === "active" ? "Aktiv" : "Nofaol"}
                  </Badge>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                className="rounded-full"
                onClick={handleToggleStatus}
                disabled={busy}
              >
                <Power size={14} className="mr-1" />
                {status === "active" ? "To'xtatish" : "Faollashtirish"}
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="rounded-full text-red-600 hover:bg-red-50"
                onClick={handleDeleteBot}
                disabled={busy}
              >
                <Trash2 size={14} />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <StatCard
          icon={<Users size={18} />}
          label="Nomzodlar"
          value={candidates.length}
        />
        <StatCard
          icon={<Vote size={18} />}
          label="Jami ovozlar"
          value={total}
          accent
        />
        <StatCard
          icon={<Trophy size={18} />}
          label="Yetakchi"
          text={leader?.name || "—"}
          hint={leader ? `${leader.votesCount} ovoz` : ""}
        />
        <Card className="border-none shadow-sm">
          <CardContent className="p-3 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center flex-shrink-0">
              <User size={18} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-slate-500">
                1 user — 1 ovoz
              </p>
              <div className="flex items-center gap-2 mt-1">
                <Switch
                  checked={oneVotePerUser}
                  onCheckedChange={handleToggleOneVote}
                />
                <span className="text-xs text-slate-500">
                  {oneVotePerUser ? "Yoqilgan" : "O'chiq"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Candidates list */}
        <div className="lg:col-span-2 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-800">
              Nomzodlar & natijalar
            </h2>
            <Dialog open={addOpen} onOpenChange={setAddOpen}>
              <DialogTrigger
                render={
                  <Button size="sm" className="rounded-full gap-1">
                    <Plus size={14} />
                    Nomzod qo'shish
                  </Button>
                }
              />
              <DialogContent>
                <form onSubmit={handleAddCandidate}>
                  <DialogHeader>
                    <DialogTitle>Yangi nomzod</DialogTitle>
                    <DialogDescription>
                      Nomzod botda ovoz berish ro'yxatida ko'rinadi.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="cand-name">Ism / Nomi *</Label>
                      <Input
                        id="cand-name"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="Masalan: Ali Valiyev"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cand-desc">Tavsif</Label>
                      <textarea
                        id="cand-desc"
                        value={newDesc}
                        onChange={(e) => setNewDesc(e.target.value)}
                        rows={2}
                        className="w-full rounded-md border border-slate-200 p-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cand-photo">Rasm URL (ixtiyoriy)</Label>
                      <Input
                        id="cand-photo"
                        value={newPhoto}
                        onChange={(e) => setNewPhoto(e.target.value)}
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setAddOpen(false)}
                      disabled={adding}
                    >
                      Bekor
                    </Button>
                    <Button type="submit" disabled={adding}>
                      {adding ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Qo'shish"
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {candidates.length === 0 ? (
            <Card className="border-dashed border-2 bg-transparent">
              <CardContent className="py-10 text-center">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-3">
                  <Users className="h-6 w-6 text-slate-400" />
                </div>
                <h3 className="text-sm font-semibold mb-1">
                  Hali nomzodlar yo'q
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Konkurs ishlashi uchun kamida 2 nomzod qo'shing. Bot /start
                  buyrug'ida nomzodlar ro'yxatini chiqaradi.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {sorted.map((c, idx) => {
                const pct = total > 0 ? (c.votesCount / total) * 100 : 0;
                const medal =
                  idx === 0 ? "🥇" : idx === 1 ? "🥈" : idx === 2 ? "🥉" : null;
                return (
                  <Card key={c.id} className="border-none shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center text-base font-bold flex-shrink-0">
                          {medal || idx + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="font-semibold truncate">{c.name}</p>
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-primary">
                                {c.votesCount}
                              </span>
                              <span className="text-xs text-slate-400">
                                ovoz
                              </span>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="h-7 w-7 p-0 text-red-500 hover:bg-red-50"
                                onClick={() =>
                                  handleDeleteCandidate(c.id, c.name)
                                }
                              >
                                <Trash2 size={13} />
                              </Button>
                            </div>
                          </div>
                          {c.description && (
                            <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                              {c.description}
                            </p>
                          )}
                          <div className="mt-2">
                            <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                              <div
                                className="h-full bg-primary transition-all"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                            <p className="text-xs text-slate-400 mt-1">
                              {pct.toFixed(1)}%
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent votes */}
        <div>
          <Card className="border-none shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Vote size={16} className="text-primary" />
                Oxirgi ovozlar
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2">
              {recentVotes.length === 0 ? (
                <div className="text-center py-8 text-sm text-slate-400">
                  Hali ovozlar yo'q
                </div>
              ) : (
                <ul className="divide-y divide-slate-100 max-h-[460px] overflow-y-auto">
                  {recentVotes.map((v) => (
                    <li key={v.id} className="p-2 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 flex-shrink-0">
                        {(v.voterName || v.voterUsername || v.chatId)
                          .slice(0, 2)
                          .toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {v.voterName ||
                            (v.voterUsername && `@${v.voterUsername}`) ||
                            `ID ${v.chatId.slice(-6)}`}
                        </p>
                        <p className="text-xs text-slate-400 truncate">
                          → {v.candidateName}
                        </p>
                      </div>
                      <span className="text-xs text-slate-400 flex-shrink-0">
                        {new Date(v.createdAt).toLocaleString("uz-UZ", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  text,
  hint,
  accent = false,
}: {
  icon: React.ReactNode;
  label: string;
  value?: number;
  text?: string;
  hint?: string;
  accent?: boolean;
}) {
  return (
    <Card
      className={`border-none shadow-sm ${
        accent ? "bg-primary text-white" : "bg-white"
      }`}
    >
      <CardContent className="p-3 flex items-center gap-3">
        <div
          className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
            accent ? "bg-white/20 text-white" : "bg-primary/10 text-primary"
          }`}
        >
          {icon}
        </div>
        <div className="min-w-0">
          <p
            className={`text-xs font-medium ${
              accent ? "text-white/80" : "text-slate-500"
            }`}
          >
            {label}
          </p>
          {text !== undefined ? (
            <p className="text-sm font-bold leading-tight truncate">{text}</p>
          ) : (
            <p className="text-xl font-bold leading-tight">{value}</p>
          )}
          {hint && (
            <p
              className={`text-xs ${
                accent ? "text-white/70" : "text-slate-400"
              }`}
            >
              {hint}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
