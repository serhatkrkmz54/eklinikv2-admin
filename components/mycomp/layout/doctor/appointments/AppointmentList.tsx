'use client';

import { useDoctorAppointments } from '@/hooks/doctor/useAppointmentService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { format, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';

interface AppointmentListProps {
    selectedDate: Date;
    onDateChange: (date: Date) => void;
    selectedAppointmentId: number | null;
    onAppointmentSelect: (id: number | null) => void;
}

export function AppointmentList({ selectedDate, onDateChange, selectedAppointmentId, onAppointmentSelect }: AppointmentListProps) {
    const formattedDate = format(selectedDate, 'yyyy-MM-dd');
    const { appointments, isLoading, isError } = useDoctorAppointments(formattedDate);

    return (
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle>Randevu Takvimi</CardTitle>
            </CardHeader>
            <CardContent>
                <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={(date) => date && onDateChange(date)}
                    className="rounded-md border p-4"
                    classNames={{
                        day: "mx-3 my-1",
                        cell: "p-0",
                        table: "border-separate border-spacing-x-2 border-spacing-y-2"
                    }}
                    locale={tr}
                />
                <div className="mt-4 space-y-2">
                    <h3 className="font-semibold text-lg">{format(selectedDate, 'd MMMM yyyy', { locale: tr })}</h3>
                    {isLoading ? (
                        <div className="space-y-2 pt-2">
                            <Skeleton className="h-16 w-full" />
                            <Skeleton className="h-16 w-full" />
                            <Skeleton className="h-16 w-full" />
                        </div>
                    ) : isError ? (
                        <p className="text-sm text-destructive">Randevular yüklenemedi.</p>
                    ) : appointments && appointments.length > 0 ? (
                        appointments.map(apt => (
                            <button
                                key={apt.appointmentId}
                                onClick={() => onAppointmentSelect(apt.appointmentId)}
                                className={cn(
                                    "w-full text-left p-3 rounded-lg border transition-colors",
                                    selectedAppointmentId === apt.appointmentId
                                        ? "bg-primary text-primary-foreground"
                                        : "hover:bg-muted"
                                )}
                            >
                                <p className="font-semibold">{apt.patientInfo.firstName} {apt.patientInfo.lastName}</p>
                                <p className={cn("text-sm", selectedAppointmentId === apt.appointmentId ? "text-primary-foreground/80" : "text-muted-foreground")}>
                                    {format(parseISO(apt.appointmentTime), 'HH:mm')} - {apt.status}
                                </p>
                            </button>
                        ))
                    ) : (
                        <p className="text-sm text-muted-foreground pt-2">Bu tarih için planlanmış randevu bulunmamaktadır.</p>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
