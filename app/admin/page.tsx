"use client";

import DashboardCard from "@/components/mycomp/dashboard/DashboardCard";
import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Skeleton} from "@/components/ui/skeleton";
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from "@/components/ui/table";
import {Building2, CalendarDays, Stethoscope, Users} from "lucide-react";
import {
    useClinicCount,
    useDailyAppointmentCount,
    useDoctorCount,
    usePatientCount,
    useUpcomingAppointments
} from "@/hooks/useDashboardStats";
import {MonthlyNewPatientsChart} from "@/components/mycomp/dashboard/MonthlyNewPatientsChart";
import {ClinicDensityChart} from "@/components/mycomp/dashboard/ClinicDensityChart";
import {format, parseISO} from 'date-fns';

export default function AdminDashboardPage() {
    const { count: clinicCount, isLoading: isClinicLoading } = useClinicCount();
    const { count: doctorCount, isLoading: isDoctorLoading } = useDoctorCount();
    const { count: patientCount, isLoading: isPatientLoading } = usePatientCount();
    const { count: dailyAppointmentCount, isLoading: isDailyAppointmentLoading } = useDailyAppointmentCount();
    const { upcomingAppointments, isLoading: isUpcomingLoading } = useUpcomingAppointments();


    return (
        <div className="space-y-6 p-6">
            <h1 className="text-3xl font-bold tracking-tight">Genel Bakış</h1>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                <DashboardCard title="Toplam Hasta" value={patientCount?.toString() ?? '0'} description="Sisteme kayıtlı toplam hasta sayısı" icon={Users} isLoading={isPatientLoading} />
                <DashboardCard title="Toplam Doktor" value={doctorCount?.toString() ?? '0'} description="Klinikte görevli doktor sayısı" icon={Stethoscope} isLoading={isDoctorLoading} />
                <DashboardCard title="Bugünkü Randevular" value={dailyAppointmentCount?.toString() ?? '0'} description="Bugün için planlanan randevular" icon={CalendarDays} isLoading={isDailyAppointmentLoading} />
                <DashboardCard title="Toplam Klinik" value={clinicCount?.toString() ?? '0'} description="Sistemdeki poliklinik sayısı" icon={Building2} isLoading={isClinicLoading} />
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <MonthlyNewPatientsChart />
                <ClinicDensityChart />
            </div>

            <Card>
                <CardHeader><CardTitle>Yaklaşan Randevular</CardTitle></CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Hasta</TableHead>
                                <TableHead>Doktor</TableHead>
                                <TableHead>Bölüm</TableHead>
                                <TableHead className="text-right">Saat</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isUpcomingLoading ? (
                                // Yüklenirken gösterilecek iskelet yapısı
                                [...Array(4)].map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                                        <TableCell className="text-right"><Skeleton className="h-4 w-12 ml-auto" /></TableCell>
                                    </TableRow>
                                ))
                            ) : upcomingAppointments && upcomingAppointments.length > 0 ? (
                                // Veri geldiğinde gösterilecek satırlar
                                upcomingAppointments.map((apt) => (
                                    <TableRow key={apt.appointmentId}>
                                        <TableCell className="font-medium">{apt.patientFullName}</TableCell>
                                        <TableCell>{apt.doctorFullName}</TableCell>
                                        <TableCell>{apt.clinicName}</TableCell>
                                        <TableCell className="text-right font-mono">
                                            {format(parseISO(apt.appointmentTime), 'HH:mm')}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                        Yaklaşan randevu bulunmamaktadır.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
