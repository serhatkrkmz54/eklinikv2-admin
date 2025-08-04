// app/admin/layout.tsx

"use client"; // State ve hook kullanacağımız için client component olmalı

import { useState } from "react";
import { Navbar } from "@/components/mycomp/layout/Navbar";
import { Sidebar } from "@/components/mycomp/layout/Sidebar";
import { useMediaQuery } from "@/hooks/use-media-query";
import {Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

export default function AdminLayout({
                                        children,
                                    }: {
    children: React.ReactNode;
}) {
    // 768px (Tailwind'in md breakpoint'i) ve üstü ise desktop olarak kabul edelim
    const isDesktop = useMediaQuery("(min-width: 768px)");
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // Desktop Görünümü
    if (isDesktop) {
        return (
            <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900">
                <Navbar />
                <div className="flex flex-1 overflow-hidden">
                    <aside className="w-64 flex-shrink-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
                        <Sidebar />
                    </aside>
                    <main className="flex-1 overflow-y-auto">
                        {children}
                    </main>
                </div>
            </div>
        );
    }

    // Mobil Görünümü
    return (
        <div className="flex flex-col h-screen bg-gray-100 dark:bg-gray-900 p-6">
            <Navbar
                mobileMenuButton={
                    <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                        <SheetTrigger asChild>
                            <Button variant="outline" size="icon" className="md:hidden">
                                <Menu className="h-5 w-5" />
                                <span className="sr-only">Menüyü Aç</span>
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="p-0 w-64">
                            <SheetHeader className="sr-only">
                                <SheetTitle>Ana Menü</SheetTitle>
                            </SheetHeader>
                            <Sidebar/>
                        </SheetContent>
                    </Sheet>
                }
            />
            <main className="flex-1 p-4 overflow-y-auto">
                {children}
            </main>
        </div>
    );
}