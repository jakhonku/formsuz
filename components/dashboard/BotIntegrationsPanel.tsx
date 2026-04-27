"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
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
  CheckCircle2,
  XCircle,
} from "lucide-react";

type Service = "calendar" | "docs" | "slides" | "drive" | "gmail" | "meet" | "tasks";

type IntegrationsConfig = Partial<
  Record<Service, { enabled?: boolean; to?: string }>
>;

type Log = {
  id: string;
  service: string;
  success: boolean;
  resultUrl: string | null;
  error: string | null;
  createdAt: string;
};

const SERVICE_META: Record<
  Service,
  { name: string; description: string; icon: any; color: string; needsConfig?: "to" }
> = {
  calendar: {
    name: "Google Calendar",
    description: "Har bir javob keladi → kalendarda voqea yaratish.",
    icon: Calendar,
    color: "bg-blue-100 text-blue-700",
  },
  docs: {
    name: "Google Docs",
    description: "Har bir javobdan avtomatik hisobot hujjati yaratish.",
    icon: FileText,
    color: "bg-indigo-100 text-indigo-700",
  },
  slides: {
    name: "Google Slides",
    description: "Javoblardan slayd-prezentatsiya generatsiya qilish.",
    icon: Presentation,
    color: "bg-amber-100 text-amber-700",
  },
  drive: {
    name: "Google Drive",
    description: "Javoblar matnli fayl ko'rinishida Drive'ga saqlanadi.",
    icon: HardDrive,
    color: "bg-emerald-100 text-emerald-700",
  },
  gmail: {
    name: "Gmail",
    description: "Yangi javob keladi — sizga email orqali yuborish.",
    icon: Mail,
    color: "bg-rose-100 text-rose-700",
    needsConfig: "to",
  },
  meet: {
    name: "Google Meet",
    description: "Javob keladi → avtomatik Meet uchrashuv havolasi.",
    icon: Video,
    color: "bg-cyan-100 text-cyan-700",
  },
  tasks: {
    name: "Google Tasks",
    description: "Yangi javob — Tasks ro'yxatiga vazifa sifatida qo'shiladi.",
    icon: CheckSquare,
    color: "bg-purple-100 text-purple-700",
  },
};

const SERVICES: Service[] = ["calendar", "docs", "slides", "drive", "gmail", "meet", "tasks"];

export function BotIntegrationsPanel({ botId, ownerEmail }: { botId: string; ownerEmail?: string | null }) {
  const [config, setConfig] = useState<IntegrationsConfig>({});
  const [logs, setLogs] = useState<Log[]>([]);
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [emailDraft, setEmailDraft] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const [cfgRes, logsRes] = await Promise.all([
          fetch(`/api/bot/${botId}/integrations`),
          fetch(`/api/bot/${botId}/integration-logs`),
        ]);
        const cfgData = await cfgRes.json();
        const logsData = await logsRes.json();
        const c = (cfgData?.integrations || {}) as IntegrationsConfig;
        setConfig(c);
        setEmailDraft(c.gmail?.to || ownerEmail || "");
        setLogs(logsData?.logs || []);
      } catch (e) {
        toast.error("Sozlamalar yuklanmadi");
      } finally {
        setLoading(false);
      }
    })();
  }, [botId, ownerEmail]);

  async function patch(next: IntegrationsConfig, label: string, key: string) {
    setSaving((s) => ({ ...s, [key]: true }));
    try {
      const res = await fetch(`/api/bot/${botId}/integrations`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ integrations: next }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Xato");
      setConfig(data.integrations || {});
      toast.success(label);
    } catch (e: any) {
      toast.error(e?.message || "Saqlanmadi");
    } finally {
      setSaving((s) => ({ ...s, [key]: false }));
    }
  }

  function toggle(svc: Service, enabled: boolean) {
    const cur = config[svc] || {};
    const nextSvc: any = { ...cur, enabled };
    if (svc === "gmail" && enabled) {
      nextSvc.to = emailDraft || ownerEmail || "";
    }
    patch({ [svc]: nextSvc }, enabled ? `${SERVICE_META[svc].name} yoqildi` : `${SERVICE_META[svc].name} o'chirildi`, svc);
  }

  function saveGmailTo() {
    patch({ gmail: { ...(config.gmail || {}), to: emailDraft } }, "Gmail manzil saqlandi", "gmail-to");
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-blue-200 bg-blue-50/50">
        <CardContent className="p-4 text-sm text-blue-900">
          <strong>Qanday ishlaydi?</strong> Quyidagi xizmatlardan birini yoqsangiz, botingizga javob
          tugaganda u xizmat <strong>avtomatik</strong> ishga tushadi va natijasi pastdagi loglarda ko'rinadi.
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SERVICES.map((svc) => {
          const meta = SERVICE_META[svc];
          const Icon = meta.icon;
          const cur = config[svc] || {};
          const isOn = !!cur.enabled;
          const isSaving = !!saving[svc];
          return (
            <Card key={svc} className={`border-2 ${isOn ? "border-primary/30" : "border-slate-100"}`}>
              <CardContent className="p-5 space-y-3">
                <div className="flex items-start gap-4">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${meta.color}`}>
                    <Icon size={20} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-bold">{meta.name}</h3>
                      {isSaving ? (
                        <Loader2 size={16} className="animate-spin text-primary" />
                      ) : (
                        <Switch checked={isOn} onCheckedChange={(v) => toggle(svc, v)} />
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{meta.description}</p>
                  </div>
                </div>

                {svc === "gmail" && isOn && (
                  <div className="flex items-center gap-2">
                    <Input
                      type="email"
                      placeholder="email@example.com"
                      value={emailDraft}
                      onChange={(e) => setEmailDraft(e.target.value)}
                      className="h-9"
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={saveGmailTo}
                      disabled={!!saving["gmail-to"] || !emailDraft}
                    >
                      {saving["gmail-to"] ? <Loader2 size={14} className="animate-spin" /> : "Saqlash"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border-none shadow-sm">
        <CardHeader>
          <CardTitle className="text-base">Oxirgi ishga tushishlar</CardTitle>
          <CardDescription>Bot javoblari kelganda integratsiyalar bajargan amallar.</CardDescription>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <p className="text-sm text-slate-400 py-6 text-center">
              Hali log yo'q. Bot javoblari kelganda bu yerda ko'rinadi.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {logs.map((log) => (
                <li key={log.id} className="flex items-center gap-3 py-2.5">
                  {log.success ? (
                    <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
                  ) : (
                    <XCircle size={16} className="text-rose-500 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px] uppercase">
                        {log.service}
                      </Badge>
                      <span className="text-xs text-slate-400">
                        {new Date(log.createdAt).toLocaleString("uz-UZ", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    {log.error && <p className="text-xs text-rose-600 mt-0.5 truncate">{log.error}</p>}
                  </div>
                  {log.resultUrl && (
                    <a
                      href={log.resultUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-primary font-semibold hover:underline flex items-center gap-1 shrink-0"
                    >
                      Ochish <ExternalLink size={11} />
                    </a>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
