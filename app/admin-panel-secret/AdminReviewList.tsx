"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Check, Trash2, Loader2, User as UserIcon } from "lucide-react";
import { toast } from "sonner";

interface Review {
  id: string;
  content: string;
  rating: number;
  isApproved: boolean;
  createdAt: string;
  user: {
    name: string | null;
    email: string | null;
  };
}

export function AdminReviewList() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchItems = async () => {
    try {
      const res = await fetch("/api/admin/reviews");
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleAction = async (id: string, action: "approve" | "delete") => {
    try {
      const res = await fetch("/api/admin/reviews", {
        method: action === "approve" ? "PATCH" : "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewId: id })
      });

      if (res.ok) {
        toast.success(action === "approve" ? "Tasdiqlandi" : "O'chirildi");
        setReviews(prev => prev.filter(r => r.id !== id));
      }
    } catch (e) {
      toast.error("Xatolik");
    }
  };

  if (isLoading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin" /></div>;

  return (
    <Card className="border-none shadow-xl">
      <CardHeader>
        <CardTitle>Fikrlar Moderatsiyasi ({reviews.length})</CardTitle>
      </CardHeader>
      <CardContent>
        {reviews.length === 0 ? (
          <p className="text-center py-10 text-slate-400">Yangi fikrlar yo'q.</p>
        ) : (
          <div className="space-y-4">
            {reviews.map((r) => (
              <div key={r.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex gap-0.5 text-amber-400">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} size={12} fill={i < r.rating ? "currentColor" : "none"} />
                      ))}
                    </div>
                    <span className="text-xs text-slate-400">
                      {new Date(r.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 italic mb-3">"{r.content}"</p>
                  <div className="flex items-center gap-2">
                    <UserIcon size={12} className="text-slate-400" />
                    <span className="text-xs font-bold text-slate-600">{r.user.name || "Nomsiz"}</span>
                    <span className="text-[10px] text-slate-400">({r.user.email})</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <Button 
                    size="sm" 
                    variant="default" 
                    className="h-8 rounded-lg bg-green-600 hover:bg-green-700"
                    onClick={() => handleAction(r.id, "approve")}
                  >
                    <Check size={14} className="mr-1" /> Tasdiqlash
                  </Button>
                  <Button 
                    size="sm" 
                    variant="ghost" 
                    className="h-8 rounded-lg text-red-500 hover:bg-red-50 hover:text-red-600"
                    onClick={() => handleAction(r.id, "delete")}
                  >
                    <Trash2 size={14} className="mr-1" /> O'chirish
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
