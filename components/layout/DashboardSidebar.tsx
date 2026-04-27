"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  FileText,
  Bot,
  Settings,
  LogOut,
  User2,
  ShieldCheck,
  Vote,
  Sparkles,
  Globe
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";

const ADMIN_EMAILS = ["jakhongirbakhtiyarov0130@gmail.com", "jakhonku@gmail.com"];
const VOTING_PLANS = ["PRO", "BUSINESS", "GWAY"];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAdmin = session?.user?.email && ADMIN_EMAILS.includes(session.user.email);
  const userPlan = session?.user?.plan || "FREE";
  const hasVotingAccess = VOTING_PLANS.includes(userPlan);

  const menuItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Sizning botlaringiz", href: "/dashboard/bots", icon: Bot },
    {
      name: "Konkurs botlari",
      href: "/dashboard/voting-bots",
      icon: Vote,
      badge: hasVotingAccess ? undefined : "PRO",
    },
    { name: "Google Formlar", href: "/dashboard/forms", icon: FileText },
    { name: "Sozlamalar", href: "/dashboard/settings", icon: Settings },
    { name: "Dasturchi haqida", href: "/dashboard/about", icon: User2 },
  ];

  return (
    <aside className="w-64 border-r bg-white h-[calc(100vh-64px)] overflow-y-auto flex flex-col">
      <div className="p-4 flex-grow">
        <div className="space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                pathname === item.href || pathname.startsWith(item.href + "/")
                  ? "bg-primary/10 text-primary"
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <item.icon className="h-4 w-4" />
              <span className="flex-1">{item.name}</span>
              {item.badge && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-700">
                  {item.badge}
                </span>
              )}
            </Link>
          ))}

          {isAdmin && (
            <Link
              href="/admin-panel-secret"
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors mt-4 bg-slate-100/50 border border-slate-200",
                pathname === "/admin-panel-secret"
                  ? "bg-slate-900 text-white"
                  : "text-slate-900 hover:bg-slate-200"
              )}
            >
              <ShieldCheck className="h-4 w-4" />
              Super Admin
            </Link>
          )}
        </div>
      </div>
      <div className="p-4 border-t">
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors w-full"
        >
          <LogOut className="h-4 w-4" />
          Chiqish
        </button>
      </div>
    </aside>
  );
}
