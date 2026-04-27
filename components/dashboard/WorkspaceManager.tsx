"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  HardDrive, 
  FolderPlus, 
  Folder, 
  File, 
  ChevronRight, 
  ChevronLeft, 
  Loader2, 
  ExternalLink,
  CheckCircle2,
  Calendar as CalendarIcon,
  Plus
} from "lucide-react";
import { toast } from "sonner";

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink: string;
  iconLink?: string;
}

export function WorkspaceManager({ botId, botType, config: initialConfig }: any) {
  const [config, setConfig] = useState<any>(initialConfig || {});
  const [loading, setLoading] = useState(true);
  const [files, setFiles] = useState<DriveFile[]>([]);
  const [path, setPath] = useState<{id: string, name: string}[]>([{id: 'root', name: 'Mening Drive-im'}]);
  const [newFolderName, setNewFolderName] = useState("");
  const [creating, setCreating] = useState(false);

  const currentFolder = path[path.length - 1];

  useEffect(() => {
    fetchFiles(currentFolder.id);
  }, [currentFolder.id]);

  async function fetchFiles(folderId: string) {
    setLoading(true);
    try {
      const res = await fetch(`/api/bot/${botId}/workspace-manager?service=drive&folderId=${folderId}`);
      const data = await res.json();
      if (res.ok) {
        setFiles(data.files || []);
      }
    } catch (e) {
      toast.error("Fayllarni yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  }

  async function createFolder() {
    if (!newFolderName) return;
    setCreating(true);
    try {
      const res = await fetch(`/api/bot/${botId}/workspace-manager`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          service: "drive",
          action: "createFolder",
          data: { name: newFolderName, parentId: currentFolder.id }
        })
      });
      if (res.ok) {
        toast.success("Papka yaratildi");
        setNewFolderName("");
        fetchFiles(currentFolder.id);
      }
    } catch (e) {
      toast.error("Xatolik");
    } finally {
      setCreating(false);
    }
  }

  async function selectFolder(id: string) {
    const next = { ...config, folderId: id };
    setConfig(next);
    try {
      await fetch(`/api/bot/${botId}/workspace-config`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workspaceConfig: next }),
      });
      toast.success("Bot uchun ushbu papka tanlandi");
    } catch (e) {
      toast.error("Saqlashda xatolik");
    }
  }

  const isSelected = (id: string) => config.folderId === id || (id === 'root' && !config.folderId);

  return (
    <div className="space-y-6">
      {/* Drive Section */}
      <Card className="border-none shadow-sm overflow-hidden">
        <CardHeader className="bg-slate-50/50 border-b border-slate-100">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                <HardDrive size={20} />
              </div>
              <div>
                <CardTitle className="text-base">Google Drive Boshqaruvchisi</CardTitle>
                <CardDescription className="text-xs">
                  Bot fayllarni qayerga yuklashini va saqlashini shu yerdan boshqaring.
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Input 
                placeholder="Yangi papka nomi..." 
                className="h-9 w-40 text-xs" 
                value={newFolderName}
                onChange={(e) => setNewFolderName(e.target.value)}
              />
              <Button size="sm" variant="outline" className="h-9 gap-1" onClick={createFolder} disabled={creating || !newFolderName}>
                {creating ? <Loader2 size={14} className="animate-spin" /> : <FolderPlus size={14} />}
                Yaratish
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-1 p-3 border-b border-slate-50 text-xs font-medium text-slate-500 overflow-x-auto">
            {path.map((p, i) => (
              <div key={p.id} className="flex items-center shrink-0">
                {i > 0 && <ChevronRight size={12} className="mx-1 text-slate-300" />}
                <button 
                  onClick={() => setPath(path.slice(0, i + 1))}
                  className={`hover:text-primary ${i === path.length - 1 ? "text-primary font-bold" : ""}`}
                >
                  {p.name}
                </button>
              </div>
            ))}
          </div>

          {/* Files List */}
          <div className="min-h-[300px] max-h-[500px] overflow-y-auto">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-2">
                <Loader2 className="animate-spin" />
                <span className="text-xs">Fayllar o'qilmoqda...</span>
              </div>
            ) : files.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-400 gap-2">
                <Folder size={32} strokeWidth={1.5} className="opacity-20" />
                <span className="text-xs">Bu papka bo'sh</span>
              </div>
            ) : (
              <div className="divide-y divide-slate-50">
                {files.map((file) => (
                  <div key={file.id} className="group flex items-center justify-between p-3 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      {file.mimeType === 'application/vnd.google-apps.folder' ? (
                        <Folder size={18} className="text-blue-500 shrink-0" />
                      ) : (
                        <File size={18} className="text-slate-400 shrink-0" />
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-700 truncate">{file.name}</p>
                        <p className="text-[10px] text-slate-400 truncate">{file.mimeType.split('.').pop()}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {file.mimeType === 'application/vnd.google-apps.folder' && (
                        <>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-8 text-xs gap-1"
                            onClick={() => setPath([...path, {id: file.id, name: file.name}])}
                          >
                            Ochish
                          </Button>
                          <Button 
                            size="sm" 
                            variant={isSelected(file.id) ? "default" : "outline"}
                            className="h-8 text-xs gap-1"
                            onClick={() => selectFolder(file.id)}
                          >
                            {isSelected(file.id) ? <CheckCircle2 size={14} /> : <Plus size={14} />}
                            {isSelected(file.id) ? "Tanlangan" : "Botga ulash"}
                          </Button>
                        </>
                      )}
                      <a href={file.webViewLink} target="_blank" rel="noreferrer" className="p-2 text-slate-400 hover:text-primary">
                        <ExternalLink size={14} />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
        <div className="bg-slate-50 p-3 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Tanlangan jild:</span>
            <Badge variant="outline" className="bg-white text-emerald-700 border-emerald-200">
              {files.find(f => f.id === config.folderId)?.name || (config.folderId === 'root' || !config.folderId ? 'Mening Drive-im' : 'Noma\'lum jild')}
            </Badge>
          </div>
          {isSelected(currentFolder.id) ? (
            <Badge className="bg-emerald-500 hover:bg-emerald-500 gap-1">
              <CheckCircle2 size={12} /> Hozirgi jild ulangan
            </Badge>
          ) : (
            <Button size="sm" onClick={() => selectFolder(currentFolder.id)}>Hozirgi jildni botga ulash</Button>
          )}
        </div>
      </Card>

      {/* Calendar Section - Placeholder for now but UI ready */}
      <Card className="border-none shadow-sm">
        <CardHeader>
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                <CalendarIcon size={20} />
              </div>
              <div>
                <CardTitle className="text-base">Google Kalendar</CardTitle>
                <CardDescription className="text-xs">
                  Sizning rejalaringiz va uchrashuvlaringiz.
                </CardDescription>
              </div>
          </div>
        </CardHeader>
        <CardContent className="py-10 text-center">
           <p className="text-sm text-slate-400">Kalendar ko'rinishi tez orada qo'shiladi...</p>
        </CardContent>
      </Card>
    </div>
  );
}
