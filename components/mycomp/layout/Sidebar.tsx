'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard,
    Users,
    Stethoscope,
    CalendarDays,
    Settings,
    UserCog,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import React from "react";

type SubMenuItem = {
    href: string;
    label: string;
    icon: React.ElementType;
};

type MenuItem = {
    group: string;
    items: SubMenuItem[];
};

const menuItems: MenuItem[] = [
    {
        group: "KONTROL PANELİ",
        items: [
            { href: "/admin", label: "Anasayfa", icon: LayoutDashboard },
            { href: "/admin/appointments", label: "Randevular", icon: CalendarDays },
        ]
    },
    {
        group: "YÖNETİM",
        items: [
            { href: "/admin/patients", label: "Hastalar", icon: Users },
            { href: "/admin/doctors", label: "Doktorlar", icon: Stethoscope },
            { href: "/admin/users", label: "Kullanıcılar", icon: UserCog },
            { href: "/admin/settings", label: "Ayarlar", icon: Settings },
        ]
    }
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <nav className="flex h-full flex-col px-3 py-4">
            {menuItems.map((group) => (
                <div key={group.group} className="mb-4">
                    {/* Grup Başlığı */}
                    <h2 className="mb-2 px-4 text-md font-semibold tracking-tight text-gray-500 dark:text-gray-400">
                        {group.group}
                    </h2>
                    <div className="space-y-1">
                        {group.items.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-gray-700 dark:text-gray-300",
                                        "transition-colors duration-200 ease-in-out hover:bg-gray-100 dark:hover:bg-gray-800",
                                        isActive && "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                    )}
                                >
                                    <span className={cn(
                                        "absolute left-0 h-6 w-1 scale-y-0 rounded-r-full bg-green-600",
                                        "transition-transform duration-200 ease-in-out group-hover:scale-y-100",
                                        isActive && "scale-y-100"
                                    )} />

                                    <Icon className={cn("h-5 w-5", isActive && "text-green-600 dark:text-green-400")} />
                                    <span>{item.label}</span>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            ))}
        </nav>
    );
}