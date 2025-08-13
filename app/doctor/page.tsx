'use client';

import { CalendarCheck, Clock, Users } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useMyProfile } from "@/hooks/doctor/useProfileService";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardCalendar } from "@/components/mycomp/layout/doctor/dashboard/DashboardCalendar";
import { AppointmentStatus, useDoctorAppointments, useUpcomingAppointments } from "@/hooks/doctor/useAppointmentService";
import { format } from "date-fns";
import React from "react";

export default function DoctorDashboardPage() {
    const { profile, isLoading: isLoadingProfile } = useMyProfile();
    const { upcomingAppointments, isLoading: isLoadingAppointments } = useUpcomingAppointments();

    const todayString = format(new Date(), 'yyyy-MM-dd');
    const { appointments: todayAppointments, isLoading: isLoadingToday } = useDoctorAppointments(todayString);

    const scheduledTodayCount = todayAppointments?.filter(app => app.status === 'SCHEDULED').length || 0;
    const completedTodayCount = todayAppointments?.filter(app => app.status === 'COMPLETED').length || 0;
    const cancelledTodayCount = todayAppointments?.filter(app => app.status === 'CANCELLED').length || 0;
    const missedTodayCount = todayAppointments?.filter(app => app.status === 'MISSED').length || 0;

    const mainDisplayCount = scheduledTodayCount;

    const getStatusProps = (status: AppointmentStatus) => {
        switch (status) {
            case 'SCHEDULED':
                return { text: 'Onaylandı', variant: 'default' as const };
            case 'CANCELLED':
                return { text: 'İptal Edildi', variant: 'destructive' as const };
            case 'COMPLETED':
                return { text: 'Tamamlandı', variant: 'secondary' as const };
            case 'MISSED':
                return { text: 'Kaçırıldı', variant: 'outline' as const };
            default:
                return { text: 'Bilinmiyor', variant: 'outline' as const };
        }
    };

    if (isLoadingProfile || isLoadingAppointments || isLoadingToday) {
        return <DashboardSkeleton />;
    }

    return (
        <div className="flex-1 space-y-4 p-2 md:p-3">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl mb-2 font-bold tracking-tight">
                        Hoş geldiniz, {profile?.doctorInfo?.title || 'Dr.'} {profile?.firstName} 👋
                    </h2>
                    <p className="text-muted-foreground">
                        İşte kliniğinizin bugünkü genel durumu.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Sol Taraf: Ana İçerik */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Bilgi Kartları */}
                    <div className="grid gap-6 md:grid-cols-2">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Bekleyen Randevu Sayısı</CardTitle>
                                <div className="p-2 bg-primary/10 rounded-md">
                                    <CalendarCheck className="h-5 w-5 text-primary" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{mainDisplayCount}</div>
                                {/* KART İÇERİĞİ GÜNCELLENDİ */}
                                <p className="text-xs text-muted-foreground">
                                    {completedTodayCount} tamamlandı, {missedTodayCount} kaçırıldı, {cancelledTodayCount} iptal
                                </p>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Aktif Hasta Sayısı</CardTitle>
                                <div className="p-2 bg-primary/10 rounded-md">
                                    <Users className="h-5 w-5 text-primary" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">+235</div>
                                <p className="text-xs text-muted-foreground">+12 yeni hasta bu ay</p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Yaklaşan Randevular Kartı */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Yaklaşan Randevular</CardTitle>
                            <CardDescription>Bugün sizi bekleyen hastalarınız.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {upcomingAppointments && upcomingAppointments.length > 0 ? (
                                upcomingAppointments.map((appointment) => {
                                    const statusProps = getStatusProps(appointment.status);
                                    return (
                                        <div key={appointment.appointmentId} className="flex items-center space-x-4 p-2 hover:bg-muted/50 rounded-lg transition-colors">
                                            <Avatar className="h-9 w-9">
                                                <AvatarFallback>{appointment.patientFullName.substring(0, 2).toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1">
                                                <p className="text-sm font-medium leading-none">{appointment.patientFullName}</p>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Clock className="h-4 w-4" />
                                                <span>{format(new Date(appointment.appointmentTime), 'HH:mm')}</span>
                                            </div>
                                            <Badge variant={statusProps.variant}>
                                                {statusProps.text}
                                            </Badge>
                                        </div>
                                    );
                                })
                            ) : (
                                <p className="text-sm text-muted-foreground text-center">Yaklaşan randevunuz bulunmamaktadır.</p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Sağ Taraf: Takvim */}
                <div className="lg:col-span-1">
                    <DashboardCalendar />
                </div>
            </div>
        </div>
    );
}

// İskelet Ekranı (Değişiklik yok)
const DashboardSkeleton = () => (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="space-y-2">
            <Skeleton className="h-8 w-1/2" />
            <Skeleton className="h-5 w-1/3" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <Skeleton className="h-4 w-2/5" />
                            <Skeleton className="h-9 w-9 rounded-md" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-7 w-1/4" />
                            <Skeleton className="h-4 w-2/5 mt-1" />
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <Skeleton className="h-4 w-2/5" />
                            <Skeleton className="h-9 w-9 rounded-md" />
                        </CardHeader>
                        <CardContent>
                            <Skeleton className="h-7 w-1/4" />
                            <Skeleton className="h-4 w-2/5 mt-1" />
                        </CardContent>
                    </Card>
                </div>
                <Card>
                    <CardHeader>
                        <Skeleton className="h-6 w-1/3" />
                        <Skeleton className="h-4 w-2/4 mt-2" />
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center space-x-4">
                                <Skeleton className="h-9 w-9 rounded-full" />
                                <div className="space-y-2 flex-1">
                                    <Skeleton className="h-4 w-3/5" />
                                    <Skeleton className="h-4 w-2/5" />
                                </div>
                                <Skeleton className="h-6 w-20 rounded-full" />
                            </div>
                        ))}
                    </CardContent>
                    <CardFooter>
                        <Skeleton className="h-10 w-full" />
                    </CardFooter>
                </Card>
            </div>
            <div className="lg:col-span-1">
                <Skeleton className="h-[550px] w-full" />
            </div>
        </div>
    </div>
);
