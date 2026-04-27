"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Calendar,
  FileText,
  Presentation,
  HardDrive,
  Mail,
  Video,
  CheckSquare,
  ExternalLink,
  Loader2,
} from "lucide-react";

type Integration = {
  key: string;
  name: string;
  description: string;
  icon: any;
  color: string;
  endpoint: string;
  method: "GET" | "POST";
  actionLabel: string;
  resultLabel?: string;
};

const INTEGRATIONS: Integration[] = [
  {
    key: "calendar",
    name: "Google Calendar",
    description: "Forma javoblariga asoslangan voqealar va eslatmalar yarating.",
    icon: Calendar,
    color: "bg-blue-100 text-blue-700",
    endpoint: "/api/google/calendar",
    method: "POST",
    actionLabel: "Test voqea yaratish",
    resultLabel: "Calendar'da ko'rish",
  },
  {
    key: "docs",
    name: "Google Docs",
    description: "Javoblardan avtomatik hisobot yoki sertifikat hujjati.",
    icon: FileText,
    color: "bg-indigo-100 text-indigo-700",
    endpoint: "/api/google/docs",
    method: "POST",
    actionLabel: "Test hujjat yaratish",
    resultLabel: "Hujjatni ochish",
  },
  {
    key: "slides",
    name: "Google Slides",
    description: "Test natijalaridan slayd-prezentatsiya generatsiyasi.",
    icon: Presentation,
    color: "bg-amber-100 text-amber-700",
    endpoint: "/api/google/slides",
    method: "POST",
    actionLabel: "Test prezentatsiya",
    resultLabel: "Prezentatsiyani ochish",
  },
  {
    key: "drive",
    name: "Google Drive",
    description: "Botga yuborilgan fayllarni avtomatik Drive'da saqlash.",
    icon: HardDrive,
    color: "bg-emerald-100 text-emerald-700",
    endpoint: "/api/google/drive",
    method: "POST",
    actionLabel: "Test fayl yuklash",
    resultLabel: "Faylni ochish",
  },
  {
    key: "gmail",
    name: "Gmail",
    description: "Javob kelganda email yuborish, sertifikat email orqali jo'natish.",
    icon: Mail,
    color: "bg-rose-100 text-rose-700",
    endpoint: "/api/google/gmail",
    method: "POST",
    actionLabel: "O'zimga test xat yuborish",
  },
  {
    key: "meet",
    name: "Google Meet",
    description: "Forma to'ldirgan kishiga avtomatik Meet havolasi yaratish.",
    icon: Video,
    color: "bg-cyan-100 text-cyan-700",
    endpoint: "/api/google/meet",
    method: "POST",
    actionLabel: "Test Meet havolasi",
    resultLabel: "Meet'ni ochish",
  },
  {
    key: "tasks",
    name: "Google Tasks",
    description: "Yangi javob — vazifa sifatida Tasks ro'yxatiga qo'shiladi.",
    icon: CheckSquare,
    color: "bg-purple-100 text-purple-700",
    endpoint: "/api/google/tasks",
    method: "POST",
    actionLabel: "Test vazifa qo'shish",
  },
];

export function IntegrationsClient() {
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [results, setResults] = useState<Record<string, { ok: boolean; url?: string; text?: string }>>({});

  const run = async (it: Integration) => {
    setLoading((s) => ({ ...s, [it.key]: true }));
    try {
      const res = await fetch(it.endpoint, {
        method: it.method,
        headers: { "Content-Type": "application/json" },
        body: it.method === "POST" ? JSON.stringify({}) : undefined,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Xato yuz berdi");

      // Extract a useful URL based on integration type
      let url: string | undefined;
      let text: string | undefined;
      if (it.key === "calendar") {
        url = data.event?.htmlLink;
        text = `Voqea yaratildi${data.event?.meetLink ? " (Meet havolasi bilan)" : ""}`;
      } else if (it.key === "docs") {
        url = data.doc?.url;
        text = "Hujjat yaratildi";
      } else if (it.key === "slides") {
        url = data.presentation?.url;
        text = "Prezentatsiya yaratildi";
      } else if (it.key === "drive") {
        url = data.file?.webViewLink;
        text = "Fayl yuklandi";
      } else if (it.key === "gmail") {
        text = "Test xat yuborildi (Gmail'ingizni tekshiring)";
      } else if (it.key === "meet") {
        url = data.meet?.meetLink;
        text = "Meet havolasi yaratildi";
      } else if (it.key === "tasks") {
        text = "Vazifa qo'shildi (Google Tasks)";
      }

      setResults((s) => ({ ...s, [it.key]: { ok: true, url, text } }));
      toast.success(`${it.name} — muvaffaqiyatli`);
    } catch (e: any) {
      setResults((s) => ({ ...s, [it.key]: { ok: false, text: e?.message || "Xato" } }));
      toast.error(`${it.name}: ${e?.message || "Xato"}`);
    } finally {
      setLoading((s) => ({ ...s, [it.key]: false }));
    }
  };

  return (
    <div className="space-y-4">
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="p-4 text-sm text-amber-900">
          <strong>Eslatma:</strong> Integratsiyalardan foydalanish uchun Google
          akkauntingizdan barcha ruxsatlarga rozilik berishingiz kerak. Agar
          quyidagi tugmalar 401/403 xato bersa, tizimdan chiqib qaytadan kiring.
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {INTEGRATIONS.map((it) => {
          const Icon = it.icon;
          const r = results[it.key];
          const isLoading = !!loading[it.key];
          return (
            <Card key={it.key} className="border-slate-200 hover:shadow-md transition-shadow">
              <CardContent className="p-5">
                <div className="flex items-start gap-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${it.color}`}>
                    <Icon size={22} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-bold text-slate-900">{it.name}</h3>
                      <Badge variant="outline" className="text-[10px]">Ulangan</Badge>
                    </div>
                    <p className="text-sm text-slate-500 leading-relaxed mb-3">{it.description}</p>

                    <div className="flex items-center gap-2 flex-wrap">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => run(it)}
                        disabled={isLoading}
                        className="rounded-full"
                      >
                        {isLoading && <Loader2 size={14} className="mr-2 animate-spin" />}
                        {it.actionLabel}
                      </Button>
                      {r?.url && (
                        <a
                          href={r.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                        >
                          {it.resultLabel || "Ochish"} <ExternalLink size={12} />
                        </a>
                      )}
                    </div>

                    {r?.text && (
                      <p className={`text-xs mt-2 ${r.ok ? "text-emerald-600" : "text-rose-600"}`}>
                        {r.ok ? "✓" : "✗"} {r.text}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
