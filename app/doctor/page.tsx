'use client';

import { ArrowRight, CalendarCheck, Clock, Users } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useMyProfile } from "@/hooks/doctor/useProfileService";
import { Skeleton } from "@/components/ui/skeleton";
import { DashboardCalendar } from "@/components/mycomp/layout/doctor/dashboard/DashboardCalendar";

export default function DoctorDashboardPage() {
    const { profile, isLoading } = useMyProfile();

    // Örnek Yaklaşan Randevu Verisi
    const upcomingAppointments = [
        { id: 1, name: 'Ayşe Yılmaz', time: '10:30', reason: 'Kontrol', avatar: '/avatars/01.png', status: 'Onaylandı' },
        { id: 2, name: 'Mehmet Öztürk', time: '11:00', reason: 'Diş Ağrısı', avatar: '/avatars/02.png', status: 'Onaylandı' },
        { id: 3, name: 'Fatma Kaya', time: '12:15', reason: 'Yeni Hasta', avatar: '/avatars/03.png', status: 'Beklemede' },
    ];

    if (isLoading) {
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
                    {/* Geliştirilmiş Bilgi Kartları */}
                    <div className="grid gap-6 md:grid-cols-2">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Bugünkü Randevular</CardTitle>
                                <div className="p-2 bg-primary/10 rounded-md">
                                    <CalendarCheck className="h-5 w-5 text-primary" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">12</div>
                                <p className="text-xs text-muted-foreground">3 tanesi tamamlandı</p>
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

                    {/* Geliştirilmiş Yaklaşan Randevular Kartı */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Yaklaşan Randevular</CardTitle>
                            <CardDescription>Bugün sizi bekleyen hastalarınız.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {upcomingAppointments.map((appointment) => (
                                <div key={appointment.id} className="flex items-center space-x-4 p-2 hover:bg-muted/50 rounded-lg transition-colors">
                                    <Avatar className="h-9 w-9">
                                        <AvatarImage src={appointment.avatar} alt="Avatar" />
                                        <AvatarFallback>{appointment.name.substring(0, 2)}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium leading-none">{appointment.name}</p>
                                        <p className="text-sm text-muted-foreground">{appointment.reason}</p>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Clock className="h-4 w-4" />
                                        <span>{appointment.time}</span>
                                    </div>
                                    <Badge variant={appointment.status === 'Onaylandı' ? 'default' : 'secondary'}>
                                        {appointment.status}
                                    </Badge>
                                </div>
                            ))}
                        </CardContent>
                        <CardFooter>
                            <Button variant="outline" className="w-full">
                                Tüm Randevuları Görüntüle <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </CardFooter>
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

// --- TASARIMA UYGUN YENİ İSKELET EKRANI ---
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