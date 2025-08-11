'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CalendarDays, ChevronDown, Hospital, LayoutDashboard, Settings, Stethoscope, UserCog, Siren } from 'lucide-react';
import { cn } from '@/lib/utils';
import React, { useState } from "react";
import { AnimatePresence, motion } from 'framer-motion';

type GrandchildMenuItem = {
    href: string;
    label: string;
};

type SubMenuItem = {
    href: string;
    label: string;
    icon: React.ElementType;
    isEmergency?: boolean;
    subMenu?: GrandchildMenuItem[];
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
            { href: "/admin/emergency-logs", label: "Acil Durum Kayıtları", icon: Siren, isEmergency: true },
            { href: "/admin/schedules", label: "Randevu Takvim Yönetimi", icon: CalendarDays },
        ]
    },
    {
        group: "YÖNETİM",
        items: [
            { href: "/admin/clinics", label: "Klinik Yönetimi", icon: Hospital },
            { href: "/admin/doctors", label: "Doktor Yönetimi", icon: Stethoscope,
                subMenu: [
                    { href: "/admin/doctors", label: "Doktor Yönetimi"},
                    { href: "/admin/doctors/create-schedules", label: "Randevu Takvimi Oluştur" },
                ]},
            {
                href: "/admin/users",
                label: "Kullanıcılar",
                icon: UserCog,
                subMenu: [
                    { href: "/admin/users/create", label: "Yeni Kullanıcı Ekle" },
                    { href: "/admin/users", label: "Tüm Kullanıcılar" },
                ]
            },
            { href: "/admin/settings", label: "Ayarlar", icon: Settings },
        ]
    }
];

export function Sidebar() {
    const pathname = usePathname();

    const findOpenMenu = () => {
        return menuItems
            .flatMap(g => g.items)
            .find(item => item.subMenu && pathname.startsWith(item.href))?.href || null;
    };

    const [openMenu, setOpenMenu] = useState<string | null>(findOpenMenu());

    const handleMenuClick = (href: string) => {
        setOpenMenu(openMenu === href ? null : href);
    };

    return (
        <nav className="flex h-full flex-col px-3 py-4">
            {menuItems.map((group) => (
                <div key={group.group} className="mb-4">
                    <h2 className="mb-2 px-4 text-md font-semibold tracking-tight text-gray-500 dark:text-gray-400">
                        {group.group}
                    </h2>
                    <div className="space-y-1">
                        {group.items.map((item) => {
                            const Icon = item.icon;
                            const isParentActive = pathname.startsWith(item.href);
                            const isSubMenuOpen = openMenu === item.href;

                            if (item.subMenu) {
                                // Alt menüsü olan öğeler (Değişiklik yok)
                                return (
                                    <div key={item.href}>
                                        <button
                                            onClick={() => handleMenuClick(item.href)}
                                            className={cn(
                                                "group flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-sm font-medium",
                                                "transition-colors duration-200 ease-in-out hover:bg-gray-100 dark:hover:bg-gray-800",
                                                isParentActive ? "text-green-700 dark:text-green-400" : "text-gray-700 dark:text-gray-300"
                                            )}
                                        >
                                            <div className="flex items-center gap-3">
                                                <Icon className={cn("h-5 w-5", isParentActive && "text-green-600 dark:text-green-400")} />
                                                <span>{item.label}</span>
                                            </div>
                                            <ChevronDown className={cn("h-4 w-4 transition-transform duration-300", isSubMenuOpen && "rotate-180")} />
                                        </button>
                                        <AnimatePresence>
                                            {isSubMenuOpen && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: "auto", opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    transition={{ duration: 0.3, ease: "easeInOut" }}
                                                    className="overflow-hidden pl-5"
                                                >
                                                    <div className="flex flex-col space-y-1 py-2">
                                                        {item.subMenu.map((subItem) => {
                                                            const isSubActive = pathname === subItem.href;
                                                            return (
                                                                <Link key={subItem.href} href={subItem.href} className={cn(
                                                                    "group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
                                                                    "transition-colors duration-200 ease-in-out hover:bg-gray-100 dark:hover:bg-gray-800",
                                                                    isSubActive ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "text-gray-600 dark:text-gray-400"
                                                                )}>
                                                                    <div className="h-1.5 w-1.5 rounded-full bg-current opacity-50 group-hover:opacity-100" />
                                                                    <span>{subItem.label}</span>
                                                                </Link>
                                                            );
                                                        })}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                );
                            }

                            const isActive = pathname === item.href;

                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "group relative flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium",
                                        "transition-colors duration-200 ease-in-out hover:bg-gray-100 dark:hover:bg-gray-800",
                                        isActive
                                            ? (item.isEmergency
                                                ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                                                : "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400")
                                            : "text-gray-700 dark:text-gray-300"
                                    )}
                                >
                                     <span className={cn(
                                         "absolute left-0 h-6 w-1 scale-y-0 rounded-r-full",
                                         "transition-transform duration-200 ease-in-out group-hover:scale-y-100",
                                         isActive && "scale-y-100",
                                         isActive && (item.isEmergency ? "bg-red-600" : "bg-green-600")
                                     )} />
                                    <Icon className="h-5 w-5" />
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
