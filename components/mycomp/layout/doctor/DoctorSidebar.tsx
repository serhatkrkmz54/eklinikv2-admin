'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
    LayoutGrid,
    Calendar,
    Users,
    ClipboardList,
    MessageSquare,
    Pill,
    HelpCircle,
    Settings,
    Stethoscope,
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';

const menuItems = [
    { href: "/doctor", label: "Genel Bakış", icon: LayoutGrid },
    { href: "/doctor/appointments", label: "Randevular", icon: Calendar },
    { href: "/doctor/patients", label: "Hastalar", icon: Users },
    { href: "/doctor/schedule", label: "Takvimim", icon: ClipboardList },
    { href: "/doctor/messages", label: "Mesajlar", icon: MessageSquare, badge: 3 },
    { href: "/doctor/medications", label: "İlaçlar", icon: Pill },
];

const footerMenuItems = [
    { href: "/doctor/help", label: "Yardım", icon: HelpCircle },
    { href: "/doctor/settings", label: "Ayarlar", icon: Settings },
];

export function DoctorSidebar() {
    const pathname = usePathname();

    return (
        <div className="flex h-full max-h-screen flex-col gap-2">
            <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                <Link href="/doctor" className="flex items-center gap-2 font-semibold">
                    <Stethoscope className="h-6 w-6 text-primary" />
                    <span className="">Doktor Paneli</span>
                </Link>
            </div>
            <div className="flex-1">
                <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.label}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary",
                                    isActive && "bg-muted text-primary"
                                )}
                            >
                                <item.icon className="h-4 w-4" />
                                {item.label}
                                {item.badge && (
                                    <Badge className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full">
                                        {item.badge}
                                    </Badge>
                                )}
                            </Link>
                        );
                    })}
                </nav>
            </div>
            <div className="mt-auto p-4 border-t">
                <nav className="grid items-start text-sm font-medium">
                    {footerMenuItems.map((item) => (
                        <Link
                            key={item.label}
                            href={item.href}
                            className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary"
                        >
                            <item.icon className="h-4 w-4" />
                            {item.label}
                        </Link>
                    ))}
                </nav>
            </div>
        </div>
    );
}