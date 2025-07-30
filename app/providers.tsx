// app/providers.tsx
"use client";

import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import type { ReactNode } from "react";
import React, { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";

export function Providers({ children }: { children: ReactNode }) {
    // YENİ: React Query client'ı oluşturuyoruz.
    const [queryClient] = useState(() => new QueryClient({
        defaultOptions: {
            queries: {
                staleTime: 1000 * 60 * 5, // 5 dakika
                refetchOnWindowFocus: false,
            },
        },
    }));

    return (
        // YENİ: Her şeyi QueryClientProvider ile sarmalıyoruz.
        <QueryClientProvider client={queryClient}>
            <ThemeProvider
                attribute="class"
                defaultTheme="system"
                enableSystem
                disableTransitionOnChange
            >
                <SessionProvider>{children}</SessionProvider>
            </ThemeProvider>

            {/* YENİ: Geliştirme ortamı için hata ayıklama aracı */}
            <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
    );
}