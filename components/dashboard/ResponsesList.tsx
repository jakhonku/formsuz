"use client";

import { useState } from "react";
import Link from "next/link";
import { MessageSquare, ExternalLink } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChatSheet } from "./ChatSheet";

interface ResponsesListProps {
  responses: any[];
  bot: any;
}

export function ResponsesList({ responses, bot }: ResponsesListProps) {
  const [activeChat, setActiveChat] = useState<{ chatId: string } | null>(null);

  return (
    <div className="space-y-3">
      {responses.map((resp) => (
        <Card key={resp.id} className="border-none shadow-sm hover:shadow-md transition-all">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                <MessageSquare size={18} />
              </div>
              <div className="min-w-0">
                <p className="font-medium text-sm">
                  Chat ID: <code className="text-xs bg-slate-100 px-2 py-0.5 rounded">{resp.chatId || "—"}</code>
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {new Date(resp.createdAt).toLocaleString("uz-UZ")}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="rounded-lg gap-1.5 border-primary/20 hover:bg-primary/5 text-primary"
                onClick={() => setActiveChat({ chatId: resp.chatId })}
              >
                <MessageSquare size={14} />
                Chat ochish
              </Button>
              <Button variant="ghost" size="sm" asChild className="rounded-lg gap-1.5 h-9">
                <Link href={`/dashboard/bot/${bot.id}/response/${resp.id}`}>
                  <ExternalLink size={14} />
                  Batafsil
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      {activeChat && (
        <ChatSheet
          isOpen={!!activeChat}
          onClose={() => setActiveChat(null)}
          botId={bot.id}
          chatId={activeChat.chatId}
          botUsername={bot.telegramBotUsername || "bot"}
        />
      )}
    </div>
  );
}
