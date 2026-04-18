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
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/chat/history/${botId}/${chatId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
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

  const lastUserMsg = [...messages].reverse().find(m => m.sender === "user");
  const displayName = lastUserMsg?.senderName || `Chat #${chatId}`;
  const displayUsername = lastUserMsg?.senderUsername ? `@${lastUserMsg.senderUsername}` : `@${botUsername} orqali`;

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="sm:max-w-md flex flex-col p-0 gap-0">
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
                {displayName}
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
                messages.map((msg, i) => {
                  const isAdmin = msg.sender === "admin";
                  return (
                    <div key={msg.id} className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[85%] flex flex-col ${isAdmin ? "items-end" : "items-start"}`}>
                        <div className={`px-4 py-2 rounded-2xl text-sm shadow-sm ${
                          isAdmin 
                            ? "bg-primary text-white rounded-tr-none" 
                            : "bg-white text-slate-800 rounded-tl-none border border-slate-100"
                        }`}>
                          {msg.type === "text" && <p className="whitespace-pre-wrap">{msg.content}</p>}
                          {msg.type === "image" && (
                            <img src={msg.fileUrl || ""} alt="Media" className="rounded-lg max-h-60 w-auto" />
                          )}
                          {msg.type === "voice" && (
                            <div className="flex items-center gap-2 py-1">
                              <Mic size={14} />
                              <span className="text-xs lowercase">Ovozli habar</span>
                            </div>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 mt-1">
                          {new Date(msg.createdAt).toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit" })}
                        </span>
                      </div>
                    </div>
                  );
                })
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
              {inputValue.trim() ? (
                <Button type="submit" size="icon" className="rounded-full shrink-0 h-9 w-9 bg-primary" disabled={isSending}>
                  <Send size={18} />
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
      </SheetContent>
    </Sheet>
  );
}
