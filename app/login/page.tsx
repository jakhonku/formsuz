"use client";

import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Rocket, Loader2 } from "lucide-react";

const ERROR_MESSAGES: Record<string, string> = {
  OAuthCallback: "Google bilan bog'liq muammo. Database ulanishini tekshiring.",
  OAuthSignin: "Google OAuth sozlamasida xato. Client ID / Secret ni tekshiring.",
  Callback: "Server xatosi. DATABASE_URL yoki DIRECT_URL Vercel'da to'g'ri sozlanganmi?",
  Configuration: "NextAuth sozlamasi xato. NEXTAUTH_SECRET to'g'rimi?",
  AccessDenied: "Kirish rad etildi.",
  Verification: "Token muddati o'tgan.",
  Default: "Kirishda xato yuz berdi. Qayta urinib ko'ring.",
};

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  useEffect(() => {
    if (status === "authenticated") {
      router.push("/dashboard");
    }
  }, [status, router]);

  if (status === "loading" || status === "authenticated") {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }
  return (
    <div className="flex items-center justify-center min-h-[80vh] px-4">
      <Card className="w-full max-w-md border-none shadow-2xl shadow-primary/10">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/30">
              <Rocket size={32} />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight">Xush kelibsiz!</CardTitle>
          <CardDescription className="text-lg">
            Gway.uz platformasidan foydalanish uchun Google akkauntingiz orqali kiring.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-6 pt-6 pb-10">
          {error && (
            <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {ERROR_MESSAGES[error] ?? ERROR_MESSAGES.Default}
            </div>
          )}
          <Button
            size="lg"
            className="w-full h-14 rounded-full text-lg font-semibold gap-3"
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          >
            <svg className="h-6 w-6" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Google bilan kirish
          </Button>
          <p className="text-center text-sm text-slate-400">
            Tizimga kirish orqali siz bizning xizmat ko'rsatish shartlarimizga rozilik bildirasiz.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
