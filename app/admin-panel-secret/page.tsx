import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, ShieldCheck, Mail, Calendar, Bot, Zap, Clock } from "lucide-react";
import AdminUserRow from "./AdminUserRow"; // Client component for actions
import { AdminReviewList } from "./AdminReviewList";

const ADMIN_EMAILS = ["jakhongirbakhtiyarov0130@gmail.com", "jakhonku@gmail.com"];

export default async function SuperAdminPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
    redirect("/");
  }

  const users = await prisma.user.findMany({
    include: {
      _count: {
        select: { bots: true, forms: true }
      }
    },
    orderBy: { email: "asc" }
  });

  return (
    <div className="container mx-auto py-10 px-4 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 flex items-center gap-3">
             <ShieldCheck size={36} className="text-primary" />
             Super Admin Panel
          </h1>
          <p className="text-slate-500">Platforma foydalanuvchilarini boshqarish va tariflarni tayinlash.</p>
        </div>
        <Badge variant="outline" className="text-[10px] py-1 px-3 border-primary text-primary font-bold">
           SECURE ACCESS
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-none shadow-sm bg-primary text-white">
          <CardHeader className="pb-2">
            <CardDescription className="text-white/70 text-xs font-bold uppercase">Jami Foydalanuvchilar</CardDescription>
            <CardTitle className="text-4xl font-black">{users.length}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-slate-400 text-xs font-bold uppercase">Pro Foydalanuvchilar</CardDescription>
            <CardTitle className="text-4xl font-black">{users.filter(u => u.plan === "PRO").length}</CardTitle>
          </CardHeader>
        </Card>
        <Card className="border-none shadow-sm">
          <CardHeader className="pb-2">
            <CardDescription className="text-slate-400 text-xs font-bold uppercase">Business Foydalanuvchilar</CardDescription>
            <CardTitle className="text-4xl font-black">{users.filter(u => u.plan === "BUSINESS").length}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      <Card className="border-none shadow-xl">
        <CardHeader>
          <CardTitle>Foydalanuvchilar Ro'yxati</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="w-[250px]">Foydalanuvchi</TableHead>
                <TableHead>Holat / Tarif</TableHead>
                <TableHead>Limitlar (Bot/Form)</TableHead>
                <TableHead>Muddati</TableHead>
                <TableHead className="text-right">Amallar</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <AdminUserRow key={user.id} user={user as any} />
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <AdminReviewList />
    </div>
  );
}
