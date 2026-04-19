"use client";

import { useEffect, useState } from "react";
import { Star, MessageSquarePlus, Loader2, User2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useSession } from "next-auth/react";

interface Review {
  id: string;
  content: string;
  rating: number;
  user: {
    name: string | null;
    image: string | null;
  };
}

export function ReviewSection() {
  const { data: session } = useSession();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newContent, setNewContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchReviews = async () => {
    try {
      const res = await fetch("/api/reviews");
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
    fetchReviews();
  }, []);

  const handleSubmit = async () => {
    if (!newContent.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating: newRating, content: newContent })
      });

      if (res.ok) {
        toast.success("Fikringiz yuborildi!", {
          description: "Admin tasdiqlaganidan so'ng sahifada paydo bo'ladi."
        });
        setIsModalOpen(false);
        setNewContent("");
        setNewRating(5);
      } else {
        toast.error("Xatolik yuz berdi");
      }
    } catch (e) {
      toast.error("Xatolik");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="w-full py-20 bg-slate-50">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col md:flex-row items-end justify-between mb-14 gap-6">
          <div className="text-left">
            <Badge variant="outline" className="mb-4 rounded-full px-3 py-1 bg-white">Fikr-mulohazalar</Badge>
            <h2 className="text-3xl md:text-5xl font-black mb-3">Foydalanuvchilar nima deydi?</h2>
            <p className="text-slate-500 max-w-xl">
              Platformamiz foydalanuvchilari tomonidan qoldirilgan real fikrlar va tajribalar.
            </p>
          </div>
          <Button 
            onClick={() => session ? setIsModalOpen(true) : toast.error("Oldin tizimga kiring")}
            className="rounded-full gap-2 shadow-lg shadow-primary/20"
          >
            <MessageSquarePlus size={18} />
            Fikr qoldirish
          </Button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="animate-spin text-primary" size={32} />
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[2rem] border border-dashed border-slate-200">
             <p className="text-slate-400">Hozircha fikrlar yo'q. Birinchi bo'lib fikr qoldiring!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {reviews.map((t) => (
              <Card key={t.id} className="border-none shadow-sm bg-white hover:shadow-md transition-all rounded-[2rem]">
                <CardContent className="p-8">
                  <div className="flex gap-1 mb-4 text-amber-400">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} size={16} fill={j < t.rating ? "currentColor" : "none"} stroke="currentColor" />
                    ))}
                  </div>
                  <p className="text-slate-700 text-sm leading-relaxed mb-6 italic">"{t.content}"</p>
                  <div className="flex items-center gap-4 pt-4 border-t border-slate-50">
                    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm overflow-hidden">
                      {t.user.image ? (
                        <img src={t.user.image} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <User2 size={18} />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-bold">{t.user.name || "Foydalanuvchi"}</p>
                      <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">Mijoz</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px] rounded-[2rem]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-black">Fikr qoldirish</DialogTitle>
            <DialogDescription>
              Platforma haqidagi fikrlaringiz biz uchun muhim.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex justify-center gap-2">
              {[1, 2, 3, 4, 5].map((s) => (
                <button
                  key={s}
                  onClick={() => setNewRating(s)}
                  className="transition-transform hover:scale-125 focus:outline-none"
                >
                  <Star 
                    size={32} 
                    fill={s <= newRating ? "#fbbf24" : "none"} 
                    stroke={s <= newRating ? "#fbbf24" : "#cbd5e1"} 
                  />
                </button>
              ))}
            </div>
            <Textarea
              placeholder="Fikringizni shu yerga yozing..."
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              className="min-h-[120px] rounded-2xl border-slate-200"
            />
          </div>
          <DialogFooter>
            <Button 
                onClick={handleSubmit} 
                disabled={isSubmitting || !newContent.trim()}
                className="w-full rounded-xl h-12 font-bold"
            >
              {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : "Yuborish"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
