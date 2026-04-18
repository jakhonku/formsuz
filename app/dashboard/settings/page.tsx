import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { SignOutButton } from "@/components/dashboard/SignOutButton";
import { User, Mail, Bot, FileText, Calendar } from "lucide-react";

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

      <Card className="border-red-100 border-2 shadow-md bg-red-50/20">
        <CardHeader>
          <CardTitle className="text-red-600">Hisobdan chiqish</CardTitle>
          <CardDescription>Keyin qaytadan Google bilan kirishingiz mumkin.</CardDescription>
        </CardHeader>
        <CardContent>
          <SignOutButton />
        </CardContent>
      </Card>
    </div>
  );
}
