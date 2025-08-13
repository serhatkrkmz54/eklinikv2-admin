'use client';

import Link from "next/link";
import { CircleUser, Menu, Hospital, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { DoctorSidebar } from "./DoctorSidebar";
import { useMyProfile } from "@/hooks/doctor/useProfileService";
import { Skeleton } from "@/components/ui/skeleton";
import { signOut } from "next-auth/react";
import {useNotification} from "@/context/NotificationContext";
import { formatRelative } from "date-fns";
import {tr} from "date-fns/locale";

export function DoctorHeader() {
    const { profile, isLoading } = useMyProfile();
    const { notifications, unreadCount, markAllAsRead } = useNotification();

    return (
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
            <Sheet>
                <SheetTrigger asChild>
                    <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                        <Menu className="h-5 w-5" />
                        <span className="sr-only">Navigasyon menüsünü aç/kapat</span>
                    </Button>
                </SheetTrigger>
                <SheetContent side="left" className="flex flex-col p-0">
                    <DoctorSidebar />
                </SheetContent>
            </Sheet>

            <div className="w-full flex-1">
                {isLoading ? (
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-6 w-[200px]" />
                    </div>
                ) : (
                    <div className="flex items-center gap-3">
                        <Hospital className="h-5 w-5 text-muted-foreground" />
                        <span className="text-md font-semibold text-foreground">
                            {profile?.doctorInfo?.clinicName || 'Poliklinik Bilgisi Yok'} Servisi
                        </span>
                    </div>
                )}
            </div>

            <DropdownMenu onOpenChange={(open) => {
                if (!open) {
                    markAllAsRead();
                }
            }}>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full relative">
                        <Bell className="h-5 w-5" />
                        {unreadCount > 0 && (
                            <span className="absolute top-1 right-1 flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                            </span>
                        )}
                        <span className="sr-only">Bildirimler</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[350px]">
                    <DropdownMenuLabel>Bildirimler ({unreadCount} yeni)</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                        {notifications.length > 0 ? (
                            notifications.slice(0, 5).map(notification => ( // Son 5 bildirimi göster
                                <DropdownMenuItem key={notification.id} className="flex flex-col items-start gap-1 p-3">
                                    <p className="font-semibold">{notification.title}</p>
                                    <p className="text-sm text-muted-foreground">{notification.description}</p>
                                    <p className="text-xs text-muted-foreground self-end">
                                        {formatRelative(notification.date, new Date(), { locale: tr })}
                                    </p>
                                </DropdownMenuItem>
                            ))
                        ) : (
                            <DropdownMenuItem disabled>Yeni bildirim yok.</DropdownMenuItem>
                        )}
                    </DropdownMenuGroup>
                </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="secondary" size="icon" className="rounded-full">
                        <CircleUser className="h-5 w-5" />
                        <span className="sr-only">Kullanıcı menüsü</span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>
                        {isLoading ? (
                            <div className="space-y-1">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-3 w-20" />
                            </div>
                        ) : (
                            <div>
                                <p className="font-medium">{profile?.firstName} {profile?.lastName}</p>
                                <p className="text-xs text-muted-foreground">{profile?.doctorInfo?.title || 'Doktor'}</p>
                            </div>
                        )}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild><Link href="/doctor/profile">Profil Ayarları</Link></DropdownMenuItem>
                    <DropdownMenuItem asChild><Link href="/doctor/help">Yardım</Link></DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => signOut({ callbackUrl: '/login' })}>
                        Çıkış Yap
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </header>
    );
}