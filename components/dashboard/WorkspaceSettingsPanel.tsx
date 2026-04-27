"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { HardDrive, CheckSquare, Calendar, Sparkles, Loader2, Save } from "lucide-react";

interface WorkspaceConfig {
  folderId?: string;
  taskListId?: string;
  calendarId?: string;
  defaultDuration?: number;
}

export function WorkspaceSettingsPanel({
  botId,
  botType,
  initialConfig,
}: {
  botId: string;
  botType: string;
  initialConfig: WorkspaceConfig;
}) {
  const [config, setConfig] = useState<WorkspaceConfig>(initialConfig || {});
  const [loading, setLoading] = useState(false);

  async function saveConfig() {
    setLoading(true);
    try {
      const res = await fetch(`/api/bot/${botId}/workspace-config`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceConfig: config }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Saqlashda xatolik");
      }

      toast.success("Sozlamalar saqlandi");
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  }

  const isUniversal = botType === "UNIVERSAL";
  const isDrive = botType === "DRIVE" || isUniversal;
  const isTasks = botType === "TASKS" || isUniversal;
  const isCalendar = botType === "CALENDAR" || isUniversal;

  return (
    <div className="space-y-6">
      <Card className="border-none shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-2">
            <SettingsIcon type={botType} />
            <div>
              <CardTitle className="text-lg">Workspace Sozlamalari</CardTitle>
              <CardDescription>
                {botType} botingiz uchun maxsus parametrlarni sozlang.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {isDrive && (
            <div className="space-y-2">
              <Label htmlFor="folderId" className="flex items-center gap-2">
                <HardDrive size={14} className="text-emerald-600" />
                Google Drive Jild (Folder ID)
              </Label>
              <Input
                id="folderId"
                placeholder="Masalan: 1AbC2dEfG3hI... (bo'sh bo'lsa Asosiy jildga tushadi)"
                value={config.folderId || ""}
                onChange={(e) => setConfig({ ...config, folderId: e.target.value })}
              />
              <p className="text-[10px] text-slate-400">
                Fayllar yuklanadigan maxsus jildning ID raqami. Brauzer manzillar qatoridan olishingiz mumkin.
              </p>
            </div>
          )}

          {isTasks && (
            <div className="space-y-2">
              <Label htmlFor="taskListId" className="flex items-center gap-2">
                <CheckSquare size={14} className="text-purple-600" />
                Google Tasks Ro'yxati (List ID)
              </Label>
              <Input
                id="taskListId"
                placeholder="Masalan: @default yoki maxsus ID"
                value={config.taskListId || ""}
                onChange={(e) => setConfig({ ...config, taskListId: e.target.value })}
              />
              <p className="text-[10px] text-slate-400">
                Vazifalar qo'shiladigan ro'yxat. Standart holatda "@default" ishlatiladi.
              </p>
            </div>
          )}

          {isCalendar && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="calendarId" className="flex items-center gap-2">
                  <Calendar size={14} className="text-blue-600" />
                  Kalendar ID
                </Label>
                <Input
                  id="calendarId"
                  placeholder="primary"
                  value={config.calendarId || ""}
                  onChange={(e) => setConfig({ ...config, calendarId: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="duration" className="flex items-center gap-2">
                  Standart davomiylik (minut)
                </Label>
                <Input
                  id="duration"
                  type="number"
                  placeholder="60"
                  value={config.defaultDuration || ""}
                  onChange={(e) => setConfig({ ...config, defaultDuration: parseInt(e.target.value) })}
                />
              </div>
            </div>
          )}

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <Button onClick={saveConfig} disabled={loading} className="gap-2">
              {loading ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <Save size={16} />
              )}
              Sozlamalarni saqlash
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-amber-200 bg-amber-50/30">
        <CardContent className="p-4 flex gap-3">
          <div className="w-8 h-8 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0">
            <Sparkles size={16} />
          </div>
          <p className="text-xs text-amber-800 leading-relaxed">
            <strong>Maslahat:</strong> Google mahsulotlarining ID raqamlarini ularni brauzerda ochganingizda URL manzilidan olishingiz mumkin. Masalan, Drive jildining URL manzili oxiridagi harflar uning ID raqami hisoblanadi.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

function SettingsIcon({ type }: { type: string }) {
  switch (type) {
    case "DRIVE":
      return <HardDrive size={20} className="text-emerald-600" />;
    case "TASKS":
      return <CheckSquare size={20} className="text-purple-600" />;
    case "CALENDAR":
      return <Calendar size={20} className="text-blue-600" />;
    default:
      return <Sparkles size={20} className="text-primary" />;
  }
}
