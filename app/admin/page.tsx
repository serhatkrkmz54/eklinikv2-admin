"use client";

import DashboardCard from "@/components/mycomp/dashboard/DashboardCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Users,
    Stethoscope,
    CalendarDays,
    Building2,
    BarChart3,
    PieChart
} from "lucide-react";
import { useClinicCount,useDoctorCount, usePatientCount  } from "@/hooks/useDashboardStats";

export default function AdminDashboardPage() {
    const { count: clinicCount, isLoading: isClinicLoading } = useClinicCount();
    const { count: doctorCount, isLoading: isDoctorLoading } = useDoctorCount();
    const { count: patientCount, isLoading: isPatientLoading } = usePatientCount();

    const totalPatients = "1,245";
    const totalDoctors = "32";
    const todaysAppointments = "78";

    const upcomingAppointments = [
        { id: 1, patient: "Ayşe Yılmaz", doctor: "Dr. Mehmet Öztürk", time: "14:00", department: "Kardiyoloji" },
        { id: 2, patient: "Fatma Kaya", doctor: "Dr. Elif Güneş", time: "14:15", department: "Nöroloji" },
        { id: 3, patient: "Ahmet Çelik", doctor: "Dr. Caner Yıldız", time: "14:30", department: "Dahiliye" },
        { id: 4, patient: "Zeynep Arslan", doctor: "Dr. Pınar Aksoy", time: "14:45", department: "Pediatri" },
    ];

    return (
        <div className="space-y-6 p-6">
            <h1 className="text-3xl font-bold tracking-tight">Genel Bakış</h1>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <DashboardCard
                    title="Toplam Hasta"
                    value={patientCount?.toString() ?? '0'}
                    description="Sisteme kayıtlı toplam hasta sayısı"
                    icon={Users}
                    isLoading={isPatientLoading}
                />
                <DashboardCard
                    title="Toplam Doktor"
                    value={doctorCount?.toString() ?? '0'}
                    description="Klinikte görevli doktor sayısı"
                    icon={Stethoscope}
                    isLoading={isDoctorLoading}
                />
                <DashboardCard
                    title="Bugünkü Randevular"
                    value={todaysAppointments}
                    description="Bugün için planlanan randevular"
                    icon={CalendarDays}
                />
                <DashboardCard
                    title="Toplam Klinik"
                    value={clinicCount?.toString() ?? '0'}
                    description="Sistemdeki poliklinik sayısı"
                    icon={Building2}
                    isLoading={isClinicLoading}
                />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><BarChart3 className="h-5 w-5 text-muted-foreground" />Aylık Yeni Hasta Kaydı</CardTitle></CardHeader>
                    <CardContent><p className="text-sm text-muted-foreground mb-4">Son 6 ayda sisteme eklenen yeni hasta sayılarının grafiği.</p><Skeleton className="w-full h-[300px]" /></CardContent>
                </Card>
                <Card>
                    <CardHeader><CardTitle className="flex items-center gap-2"><PieChart className="h-5 w-5 text-muted-foreground" />Bölümlere Göre Randevu Yoğunluğu</CardTitle></CardHeader>
                    <CardContent><p className="text-sm text-muted-foreground mb-4">Bu ayki randevuların polikliniklere göre dağılımı.</p><Skeleton className="w-full h-[300px]" /></CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader><CardTitle>Yaklaşan Randevular</CardTitle></CardHeader>
                <CardContent>
                    <Table><TableHeader><TableRow><TableHead>Hasta</TableHead><TableHead>Doktor</TableHead><TableHead>Bölüm</TableHead><TableHead className="text-right">Saat</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {upcomingAppointments.map((apt) => (
                                <TableRow key={apt.id}><TableCell className="font-medium">{apt.patient}</TableCell><TableCell>{apt.doctor}</TableCell><TableCell>{apt.department}</TableCell><TableCell className="text-right">{apt.time}</TableCell></TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}