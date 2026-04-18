import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";

import { Providers } from "@/components/Providers";

import { TooltipProvider } from "@/components/ui/tooltip";

import { Toaster } from "@/components/ui/sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "FormBot - Google Form'ni Telegram botga 2 daqiqada ulang",
  description: "FormBot orqali Google Form javoblarini Telegram botingizga avtomatik tarzda qabul qiling.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="uz">
      <body className={`${inter.className} antialiased selection:bg-primary/10 selection:text-primary`}>
        <Providers>
          <TooltipProvider>
            <div className="flex flex-col min-h-screen">
              <Navbar />
              <main className="flex-grow">
                {children}
              </main>
              <Footer />
            </div>
            <Toaster position="top-center" richColors />
          </TooltipProvider>
        </Providers>
      </body>
    </html>
  );
}
