'use client';

import React, { useState } from 'react';
import { AppointmentList } from '@/components/mycomp/layout/doctor/appointments/AppointmentList';
import { AppointmentDetailView } from '@/components/mycomp/layout/doctor/appointments/AppointmentDetailView';
import { format } from 'date-fns';

export default function DoctorAppointmentsPage() {
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [selectedAppointmentId, setSelectedAppointmentId] = useState<number | null>(null);

    const formattedDate = format(selectedDate, 'yyyy-MM-dd');

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Randevularım</h1>
                <p className="text-muted-foreground mt-1">
                    Günlük randevu akışınızı yönetin ve hasta detaylarını görüntüleyin.
                </p>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-1">
                    <AppointmentList
                        selectedDate={selectedDate}
                        onDateChange={setSelectedDate}
                        selectedAppointmentId={selectedAppointmentId}
                        onAppointmentSelect={setSelectedAppointmentId}
                    />
                </div>
                <div className="lg:col-span-2">
                    <AppointmentDetailView
                        appointmentId={selectedAppointmentId}
                        onAppointmentComplete={() => setSelectedAppointmentId(null)}
                        onSelectAppointment={setSelectedAppointmentId}
                    />
                </div>
            </div>
        </div>
    );
}
