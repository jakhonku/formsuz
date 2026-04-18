"use client";

import { useState } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Loader2, Zap, Save, Calendar as CalendarIcon } from "lucide-react";

interface UserWithCount {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  plan: string;
  planExpiresAt: Date | null;
  _count: { bots: number; forms: number };
}

export default function AdminUserRow({ user }: { user: UserWithCount }) {
  const [plan, setPlan] = useState(user.plan);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      const res = await fetch("/api/admin/update-user", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, plan }),
      });

      if (res.ok) {
        toast.success("Foydalanuvchi tarifi yangilandi");
      } else {
        toast.error("Xatolik yuz berdi");
      }
    } catch (e) {
      toast.error("Xatolik");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <TableRow className="hover:bg-slate-50/50">
      <TableCell>
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.image || ""} />
            <AvatarFallback>{user.name?.substring(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-bold truncate">{user.name || "Noma'lum"}</span>
            <span className="text-[10px] text-slate-500 truncate">{user.email}</span>
          </div>
        </div>
      </TableCell>
      <TableCell>
        <Badge 
          className={
            user.plan === "FREE" ? "bg-slate-100 text-slate-600 border-none" : 
            user.plan === "PRO" ? "bg-primary/10 text-primary border-none" : 
            "bg-orange-100 text-orange-600 border-none"
          }
        >
          {user.plan}
        </Badge>
      </TableCell>
      <TableCell>
        <div className="flex gap-2 text-xs font-medium">
          <span className="flex items-center gap-0.5"><Zap size={10} className="text-yellow-500" /> {user._count.bots} bot</span>
          <span className="text-slate-200">|</span>
          <span>{user._count.forms} form</span>
        </div>
      </TableCell>
      <TableCell>
        <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
           <CalendarIcon size={12} />
           {user.planExpiresAt ? new Date(user.planExpiresAt).toLocaleDateString("uz-UZ") : "Cheksiz"}
        </div>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-2">
          <Select value={plan} onValueChange={setPlan}>
            <SelectTrigger className="w-[120px] h-8 text-xs rounded-lg">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="FREE">FREE</SelectItem>
              <SelectItem value="PRO">PRO</SelectItem>
              <SelectItem value="BUSINESS">BUSINESS</SelectItem>
              <SelectItem value="GWAY">GWAY</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            size="sm" 
            variant="ghost" 
            className="h-8 w-8 p-0 rounded-lg hover:bg-slate-100"
            onClick={handleUpdate}
            disabled={isUpdating || plan === user.plan}
          >
            {isUpdating ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
}
