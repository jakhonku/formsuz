"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LayoutDashboard, LogOut, Settings } from "lucide-react";

export function Navbar() {
  const { data: session, status } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <img 
            src="/logo.png" 
            alt="FormBot Logo" 
            className="h-20 w-auto" 
          />
        </Link>

        <div className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
          <Link href="/features" className="hover:text-primary transition">Imkoniyatlar</Link>
          <Link href="/pricing" className="hover:text-primary transition">Tariflar</Link>
          <Link href="/faq" className="hover:text-primary transition">Savol-javob</Link>
          <Link href="/help" className="hover:text-primary transition">Yordam</Link>
        </div>

        <div className="flex items-center gap-4">
          {status === "loading" ? (
            <div className="w-8 h-8 bg-slate-100 animate-pulse rounded-full" />
          ) : session ? (
            <div className="flex items-center gap-4">
              <Button variant="ghost" asChild className="hidden md:flex">
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => setMenuOpen((v) => !v)}
                  className="relative h-10 w-10 rounded-full p-0 hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-primary/40"
                  aria-haspopup="menu"
                  aria-expanded={menuOpen}
                >
                  <Avatar className="h-10 w-10 border-2 border-primary/10">
                    <AvatarImage src={session.user?.image || ""} alt={session.user?.name || ""} />
                    <AvatarFallback className="bg-primary/5 text-primary text-xs">
                      {session.user?.name?.substring(0, 2).toUpperCase() || "FB"}
                    </AvatarFallback>
                  </Avatar>
                </button>

                {menuOpen && (
                  <div
                    role="menu"
                    className="absolute right-0 mt-2 w-56 rounded-lg bg-white shadow-lg ring-1 ring-slate-200 p-1 z-50"
                  >
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{session.user?.name}</p>
                        <p className="text-xs leading-none text-slate-500">
                          {session.user?.email}
                        </p>
                      </div>
                    </div>
                    <div className="h-px bg-slate-200 my-1" />
                    <Link
                      href="/dashboard"
                      onClick={() => setMenuOpen(false)}
                      className="flex w-full items-center rounded-md px-2 py-1.5 text-sm hover:bg-slate-100"
                    >
                      <LayoutDashboard className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                    <Link
                      href="/dashboard/settings"
                      onClick={() => setMenuOpen(false)}
                      className="flex w-full items-center rounded-md px-2 py-1.5 text-sm hover:bg-slate-100"
                    >
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Sozlamalar</span>
                    </Link>
                    <div className="h-px bg-slate-200 my-1" />
                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        signOut({ callbackUrl: "/" });
                      }}
                      className="flex w-full items-center rounded-md px-2 py-1.5 text-sm text-red-600 hover:bg-red-50 cursor-pointer"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Chiqish</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Button variant="ghost" asChild>
                <Link href="/login">Kirish</Link>
              </Button>
              <Button asChild className="rounded-full px-6">
                <Link href="/login">Boshlash</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
