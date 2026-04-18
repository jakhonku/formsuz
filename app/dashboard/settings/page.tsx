import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, Mail, Bot, FileText, Calendar, Zap, Check, ArrowRight } from "lucide-react";
import Link from "next/link";
import { getPlanLimit } from "@/lib/plans";

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);

  const [user, botCount, formCount] = await Promise.all([
    prisma.user.findUnique({ where: { id: session?.user?.id } }),
    prisma.bot.count({ where: { userId: session?.user?.id } }),
    prisma.form.count({ where: { userId: session?.user?.id } }),
  ]);

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Sozlamalar</h1>
        <p className="text-slate-500 text-lg">Profil ma'lumotlari va hisob holati.</p>
      </div>

      <Card className="border-none shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="text-primary" size={20} />
            Profil
          </CardTitle>
          <CardDescription>Google akkauntingizdan olingan ma'lumotlar.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-6">
            <Avatar className="h-20 w-20 border-2 border-primary/10">
              <AvatarImage src={user?.image || session?.user?.image || ""} alt={user?.name || ""} />
              <AvatarFallback className="bg-primary/5 text-primary text-xl">
                {user?.name?.substring(0, 2).toUpperCase() || "FB"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <p className="text-xl font-bold">{user?.name || "—"}</p>
              <p className="text-slate-500 flex items-center gap-2">
                <Mail size={14} />
                {user?.email || "—"}
              </p>
              {user?.emailVerified && (
                <Badge variant="secondary" className="mt-2 rounded-full">
                  Tasdiqlangan email
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardDescription className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
              <Bot size={14} />
              Botlar
            </CardDescription>
            <CardTitle className="text-3xl font-bold">{botCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardDescription className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
              <FileText size={14} />
              Formalar
            </CardDescription>
            <CardTitle className="text-3xl font-bold">{formCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardDescription className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
              <Calendar size={14} />
              Qo'shilgan
            </CardDescription>
            <CardTitle className="text-base font-semibold">
              {user?.emailVerified
                ? new Date(user.emailVerified).toLocaleDateString("uz-UZ")
                : "—"}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card className="border-none shadow-md overflow-hidden">
        <div className="bg-primary/5 p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20">
              <Zap size={24} fill="currentColor" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-widest">Sizning tarifingiz</p>
              <h3 className="text-2xl font-black text-slate-900">{user?.plan || "FREE"}</h3>
            </div>
          </div>
          
          <div className="flex flex-col items-center md:items-end gap-1">
            <p className="text-sm font-medium text-slate-500">
              Tugash sanasi: <span className="text-slate-900">{user?.planExpiresAt ? new Date(user.planExpiresAt).toLocaleDateString("uz-UZ") : "Cheksiz"}</span>
            </p>
            <Link href="/pricing" className="text-xs text-primary font-bold hover:underline flex items-center gap-1">
              Tarifni o'zgartirish <ArrowRight size={10} />
            </Link>
          </div>
        </div>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Imkoniyatlar</p>
              <ul className="space-y-2">
                {getPlanLimit(user?.plan || "FREE").features.map((f, i) => (
                  <li key={i} className="text-sm flex items-center gap-2 text-slate-600">
                    <Check size={14} className="text-green-500 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-slate-50 rounded-2xl p-4 flex flex-col justify-center text-center">
              <p className="text-xs font-bold text-slate-400 uppercase mb-2">Botlar limiti</p>
              <div className="text-2xl font-black text-primary">
                {botCount} / {getPlanLimit(user?.plan || "FREE").maxBots}
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Siz {getPlanLimit(user?.plan || "FREE").maxBots} tagacha bot ulashingiz mumkin.</p>
            </div>
          </div>
        </CardContent>
      </Card>
      
    </div>
  );
}
