'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { ReactNode } from 'react';
import { UserCog, Shield, Trash2, Hospital } from 'lucide-react';

const settingsNav = [
    {
        group: "Yönetim",
        items: [
            { href: "/admin/settings/passive-users", label: "Pasif Kullanıcılar", icon: Trash2 },
            { href: "/admin/settings/roles", label: "Roller ve İzinler", icon: UserCog },
        ]
    },
    {
        group: "Sistem",
        items: [
            { href: "/admin/settings/clinics", label: "Klinik Yönetimi", icon: Hospital },
            { href: "/admin/settings/security", label: "Güvenlik", icon: Shield },
        ]
    }
];

// Dikey Navigasyon Menüsü Bileşeni
const SettingsNav = () => {
    const pathname = usePathname();
    return (
        <nav className="flex flex-col gap-4">
            {settingsNav.map((group) => (
                <div key={group.group}>
                    <h3 className="mb-2 px-2 text-xs font-semibold uppercase text-muted-foreground">{group.group}</h3>
                    <div className="flex flex-col gap-1">
                        {group.items.map((item) => {
                            const Icon = item.icon;
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                                        isActive
                                            ? "bg-primary/10 text-primary"
                                            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
                                    )}
                                >
                                    <Icon className="h-4 w-4" />
                                    {item.label}
                                </Link>
                            );

                        })}
                    </div>
                </div>
            ))}
        </nav>
    );
};

// Ana Layout Bileşeni
export const SettingsLayout = ({ children }: { children: ReactNode }) => {
    return (
        <div className="p-4 sm:p-6 md:p-8">
            <header className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100">Sistem Ayarları</h1>
                <p className="mt-1 text-md text-gray-500 dark:text-gray-400">Uygulama genelindeki ayarları ve yönetimsel işlemleri buradan yapın.</p>
            </header>
            <div className="flex flex-col md:flex-row gap-8">
                <aside className="w-full md:w-1/4 lg:w-1/5">
                    <SettingsNav />
                </aside>
                <main className="w-full md:w-3/4 lg:w-4/5">
                    {children}
                </main>
            </div>
        </div>
    );
};