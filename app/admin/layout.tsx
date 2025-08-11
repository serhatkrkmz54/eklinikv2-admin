"use client";

import React, { useState } from "react";
import { Navbar } from "@/components/mycomp/layout/Navbar";
import { Sidebar } from "@/components/mycomp/layout/Sidebar";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { EmergencyNotification } from "@/components/mycomp/layout/EmergencyNotification";

export default function AdminLayout({
                                        children,
                                    }: {
    children: React.ReactNode;
}) {
    const isDesktop = useMediaQuery("(min-width: 768px)");
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
            {isDesktop && (
                <aside className="w-64 flex-shrink-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
                    <Sidebar />
                </aside>
            )}

            <div className="flex flex-col flex-1 overflow-hidden">
                <Navbar
                    mobileMenuButton={!isDesktop && (
                        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                            <SheetTrigger asChild>
                                <Button variant="outline" size="icon">
                                    <Menu className="h-5 w-5" />
                                    <span className="sr-only">Menüyü Aç</span>
                                </Button>
                            </SheetTrigger>
                            <SheetContent side="left" className="p-0 w-64">
                                <SheetHeader className="sr-only">
                                    <SheetTitle>Ana Menü</SheetTitle>
                                </SheetHeader>
                                <Sidebar />
                            </SheetContent>
                        </Sheet>
                    )}
                />
                <main className="flex-1 overflow-y-auto ">
                    {children}
                </main>
            </div>
            <EmergencyNotification />
        </div>
    );
}