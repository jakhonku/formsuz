"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function SignOutButton() {
  return (
    <Button
      variant="destructive"
      className="gap-2 rounded-full h-11 px-6"
      onClick={() => signOut({ callbackUrl: "/" })}
    >
      <LogOut size={16} />
      Chiqish
    </Button>
  );
}
