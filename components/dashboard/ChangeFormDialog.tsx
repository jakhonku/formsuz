"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, FileText, Check, RefreshCcw } from "lucide-react";

type FormItem = {
  id: string;
  title: string;
  modifiedTime?: string | null;
};

type Props = {
  botId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onChanged?: () => void;
};

export function ChangeFormDialog({ botId, open, onOpenChange, onChanged }: Props) {
  const [forms, setForms] = useState<FormItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function loadForms() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/forms/list");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Formalarni yuklab bo'lmadi");
      setForms(Array.isArray(data) ? data : []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (open) {
      setSelected(null);
      loadForms();
    }
  }, [open]);

  async function save() {
    if (!selected) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/bot/${botId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ formId: selected }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "O'zgartirishda xatolik");
      toast.success("Forma almashtirildi");
      onChanged?.();
      onOpenChange(false);
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Formani almashtirish</DialogTitle>
          <DialogDescription>
            Bot ulanadigan Google Formani tanlang. Eski javoblar saqlanib qoladi.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[360px] overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12 text-slate-400">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : error ? (
            <div className="text-center py-8 space-y-3">
              <p className="text-sm text-red-600">{error}</p>
              <Button variant="outline" size="sm" onClick={loadForms} className="gap-2">
                <RefreshCcw size={14} />
                Qayta urinish
              </Button>
            </div>
          ) : forms.length === 0 ? (
            <p className="text-center py-10 text-sm text-slate-400">
              Sizning akkauntingizda Google Formalar topilmadi.
            </p>
          ) : (
            <div className="space-y-2">
              {forms.map((f) => {
                const isSelected = selected === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setSelected(f.id)}
                    className={`w-full text-left p-3 rounded-lg border transition flex items-center gap-3 ${
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-slate-200 hover:bg-slate-50"
                    }`}
                  >
                    <div
                      className={`p-2 rounded-lg flex-shrink-0 ${
                        isSelected ? "bg-primary text-white" : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      <FileText size={18} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-medium truncate">{f.title}</p>
                      {f.modifiedTime && (
                        <p className="text-xs text-slate-400">
                          O'zgartirildi: {new Date(f.modifiedTime).toLocaleDateString("uz-UZ")}
                        </p>
                      )}
                    </div>
                    {isSelected && <Check size={18} className="text-primary flex-shrink-0" />}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Bekor qilish
          </Button>
          <Button onClick={save} disabled={!selected || saving}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saqlanmoqda...
              </>
            ) : (
              "Saqlash"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
