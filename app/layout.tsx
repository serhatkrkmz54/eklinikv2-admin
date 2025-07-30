import type { Metadata } from "next";
import { Ubuntu } from "next/font/google";
import "./globals.css";
import React from "react";
import {Providers} from "@/app/providers";
import {Toaster} from "@/components/ui/sonner";

const ubuntu = Ubuntu({
    variable: '--font-ubuntu',
    subsets: ['latin'],
    weight: ['400'],
});

export const metadata: Metadata = {
    title: "E-Klinik Admin",
    description: "E-Klinik Yönetim Paneli",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${ubuntu.className} antialiased`}
      >
      <Providers>{children}
          <Toaster position="top-right" richColors />
      </Providers>
      </body>
    </html>
  );
}
