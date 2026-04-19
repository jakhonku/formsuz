"use client";

import { useEffect, useState, useRef } from "react";
import { 
  Send, 
  Paperclip, 
  Mic, 
  X, 
  User2, 
  Bot as BotIcon,
  Image as ImageIcon,
  File as FileIcon,
  Loader2,
  MoreVertical
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription 
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { getPlanLimit, PLANS } from "@/lib/plans";
import { Lock, ArrowRight, ShieldAlert, Check } from "lucide-react";
import Link from "next/link";

interface Message {
  id: string;
  botId: string;
  chatId: string;
  content: string | null;
  type: string;
  fileUrl: string | null;
  sender: "admin" | "user";
  senderName?: string | null;
  senderUsername?: string | null;
  senderPhoto?: string | null;
  createdAt: string;
}

interface ChatSheetProps {
  isOpen: boolean;
  onClose: () => void;
  botId: string;
  chatId: string;
  botUsername: string;
}

export function ChatSheet({ isOpen, onClose, botId, chatId, botUsername }: ChatSheetProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [debugCount, setDebugCount] = useState<number>(0);
  const [userInfo, setUserInfo] = useState<{ name: string | null; username: string | null } | null>(null);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchHistory = async () => {
    try {
      const res = await fetch(`/api/chat/history/${botId}/${chatId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
        setDebugCount(data.debugCount || 0);
        if (data.user) setUserInfo(data.user);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchHistory();
      const interval = setInterval(fetchHistory, 3000); // Poll every 3 seconds
      return () => clearInterval(interval);
    }
  }, [isOpen, botId, chatId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!inputValue.trim() || isSending) return;

    const text = inputValue.trim();
    setInputValue("");
    setIsSending(true);

    try {
      const res = await fetch("/api/chat/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          botId,
          chatId,
          content: text,
          type: "text"
        })
      });

      if (res.ok) {
        const newMessage = await res.json();
        setMessages(prev => [...prev, newMessage]);
      } else {
        toast.error("Xabar yuborishda xatolik");
      }
    } catch (e) {
      toast.error("Xatolik yuz berdi");
    } finally {
      setIsSending(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || isSending) return;

    setIsSending(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("botId", botId);
    formData.append("chatId", chatId);
    
    // Determine type
    const type = file.type.startsWith("image/") ? "image" : "file";
    formData.append("type", type);

    try {
      const res = await fetch("/api/chat/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const newMessage = await res.json();
        setMessages(prev => [...prev, newMessage]);
        toast.success("Fayl yuborildi");
      } else {
        toast.error("Fayl yuborishda xatolik");
      }
    } catch (e) {
      toast.error("Xatolik yuz berdi");
    } finally {
      setIsSending(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const { data: session } = useSession();
  const userPlan = session?.user?.plan || "FREE";
  const isChatLocked = !getPlanLimit(userPlan).chatEnabled;

  const lastUserMsg = [...messages].reverse().find(m => m.sender === "user");
  const displayName = lastUserMsg?.senderName || userInfo?.name || `Chat #${chatId}`;
  const displayUsername = lastUserMsg?.senderUsername 
    ? `@${lastUserMsg.senderUsername}` 
    : (userInfo?.username ? `@${userInfo.username}` : `@${botUsername} orqali`);

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-md flex flex-col p-0 gap-0 overflow-hidden">
        {isChatLocked ? (
          <div className="flex flex-col h-full bg-slate-50">
            <SheetHeader className="p-4 border-b bg-white flex-row items-center gap-3 space-y-0">
               <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center">
                 <Lock size={18} className="text-slate-400" />
               </div>
               <div className="text-left flex-1">
                 <SheetTitle className="text-sm font-bold">Chat Cheklangan</SheetTitle>
                 <SheetDescription className="text-[10px]">Professional tarif talab qilinadi</SheetDescription>
               </div>
               <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full w-8 h-8">
                 <X size={16} />
               </Button>
            </SheetHeader>
            
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center space-y-6">
              <div className="w-20 h-20 rounded-3xl bg-primary/10 flex items-center justify-center text-primary relative">
                <ShieldAlert size={40} />
                <div className="absolute -top-2 -right-2 bg-yellow-400 text-black px-2 py-0.5 rounded-full text-[10px] font-black border-2 border-slate-50">
                  PRO
                </div>
              </div>
              
              <div className="space-y-2">
                <h3 className="text-xl font-black text-slate-900 leading-tight">
                  Mijozlar bilan jonli muloqot qiling!
                </h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Bepul tarifda faqat xabarlarni qabul qilishingiz mumkin. 
                  Foydalanuvchilarga javob yozish va media fayllar yuborish uchun **Professional** tarifga o'ting.
                </p>
              </div>

              <div className="w-full space-y-3 bg-white p-4 rounded-2xl border border-slate-200">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest text-left px-2">PRO Imkoniyatlar:</p>
                <ul className="space-y-2.5 text-left">
                  {PLANS.PRO.features.slice(2, 6).map((f, i) => (
                    <li key={i} className="text-xs flex items-center gap-2 text-slate-600">
                      <div className="w-4 h-4 rounded-full bg-green-100 text-green-600 flex items-center justify-center shrink-0">
                        <Check size={10} strokeWidth={3} />
                      </div>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>

              <Button asChild className="w-full h-12 rounded-xl text-md font-bold shadow-lg shadow-primary/25 bg-primary hover:bg-primary/90">
                <Link href="/pricing" onClick={onClose}>
                  Tarifni yangilash <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              
              <p className="text-[10px] text-slate-400">
                * Ma'lumotlaringiz xavfsizligi kafolatlanadi
              </p>
            </div>
          </div>
        ) : (
          <>
            <SheetHeader className="p-4 border-b bg-slate-50 flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center overflow-hidden">
              {lastUserMsg?.senderPhoto ? (
                <img src={lastUserMsg.senderPhoto} alt="" className="w-full h-full object-cover" />
              ) : (
                <User2 size={20} />
              )}
            </div>
            <div className="text-left">
              <SheetTitle className="text-sm font-bold truncate max-w-[200px]">
                {displayName} ({debugCount} ta xabar)
              </SheetTitle>
              <SheetDescription className="text-[10px] truncate max-w-[150px]">
                {displayUsername}
              </SheetDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="rounded-full w-8 h-8">
              <MoreVertical size={16} />
            </Button>
          </div>
        </SheetHeader>

        <div className="flex-1 overflow-hidden relative bg-slate-50/30">
          <ScrollArea className="h-full p-4">
            <div className="space-y-4">
              {isLoading && messages.length === 0 ? (
                <div className="flex justify-center py-10">
                  <Loader2 className="animate-spin text-slate-300" />
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-10">
                  <BotIcon size={32} className="mx-auto text-slate-200 mb-2" />
                  <p className="text-xs text-slate-400">Hali xabarlar yo'q. Birinchi xabarni yuboring.</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${msg.sender === "admin" ? "items-end" : "items-start"}`}
                  >
                    <div className={`max-w-[85%] p-3 rounded-2xl shadow-sm ${
                      msg.sender === "admin" 
                        ? "bg-primary text-white rounded-tr-none" 
                        : "bg-slate-200 text-slate-900 rounded-tl-none border border-slate-300"
                    }`}>
                      {msg.content?.startsWith("WEBHOOK HIT") ? (
                        <p className="text-[10px] opacity-50 italic">Sistemali xabar: {msg.content}</p>
                      ) : (
                        <>
                          {msg.type === "text" && <p className="text-sm whitespace-pre-wrap">{msg.content}</p>}
                          {msg.type === "image" && (
                            <div className="flex flex-col gap-1">
                              <div className="flex items-center gap-2 mb-1">
                                <ImageIcon size={16} />
                                <span className="text-xs font-medium">Rasm</span>
                              </div>
                              {msg.content && <p className="text-sm">{msg.content}</p>}
                              {msg.fileUrl && (
                                <img src={msg.fileUrl} alt="Media" className="rounded-lg max-h-60 w-auto mt-2 shadow-inner" />
                              )}
                            </div>
                          )}
                          {msg.type === "file" && (
                            <div className="flex items-center gap-2 bg-black/5 p-2 rounded-lg border border-black/10">
                              <FileIcon size={20} className="shrink-0" />
                              <div className="min-w-0">
                                <p className="text-xs font-medium truncate max-w-[150px]">
                                  {msg.content || "Fayl"}
                                </p>
                                <p className="text-[10px] opacity-60">Hujjat</p>
                              </div>
                            </div>
                          )}
                          {msg.type === "voice" && (
                            <div className="flex items-center gap-2">
                              <Mic size={16} />
                              <span className="text-xs">Ovozli xabar</span>
                            </div>
                          )}
                        </>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 px-1">
                      {new Date(msg.createdAt).toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                ))
              )}
              
              {isSending && (
                <div className="flex flex-col items-end animate-pulse">
                  <div className="bg-primary/50 text-white p-3 rounded-2xl rounded-tr-none flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin" />
                    <span className="text-xs font-medium">Fayl yuklanmoqda...</span>
                  </div>
                </div>
              )}
              
              <div ref={scrollRef} />
            </div>
          </ScrollArea>
        </div>

        <div className="p-4 border-t bg-white">
          <input 
            type="file" 
            className="hidden" 
            ref={fileInputRef} 
            onChange={handleFileChange}
          />
          <form onSubmit={handleSend} className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <Button 
                type="button" 
                variant="ghost" 
                size="icon" 
                className="rounded-full shrink-0 h-9 w-9 text-slate-400"
                onClick={() => fileInputRef.current?.click()}
              >
                <Paperclip size={18} />
              </Button>
              <Input
                placeholder="Xabar yozing..."
                className="flex-1 rounded-full bg-slate-100 border-none focus-visible:ring-primary/20"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              {inputValue.trim() || isSending ? (
                <Button type="submit" size="icon" className="rounded-full shrink-0 h-9 w-9 bg-primary" disabled={isSending}>
                  {isSending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                </Button>
              ) : (
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="icon" 
                  className="rounded-full shrink-0 h-9 w-9 text-slate-400"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImageIcon size={18} />
                </Button>
              )}
            </div>
            <div className="flex items-center gap-4 px-2">
              <button 
                type="button" 
                onClick={() => fileInputRef.current?.click()}
                className="text-[10px] text-slate-400 flex items-center gap-1 hover:text-primary transition"
              >
                <ImageIcon size={10} /> Rasm / Fayl
              </button>
            </div>
          </form>
        </div>
      </>
    )}
  </SheetContent>
</Sheet>
  );
}
