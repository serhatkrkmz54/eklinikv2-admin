'use client';

import React, { useState } from 'react';
import { ScheduleFilter, ScheduleViewer } from '@/components/mycomp/dashboard/schedules/ScheduleManagement';

export default function ScheduleManagementPage() {
    const [selectedDoctorId, setSelectedDoctorId] = useState<number | null>(null);
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());

    return (
        <div className="p-4 md:p-8 bg-gray-50 dark:bg-slate-900 min-h-screen">
            <div className="w-full mx-auto space-y-8">
                <header>
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Takvim Yönetimi</h1>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Doktorların günlük çalışma takvimlerini görüntüleyin ve yönetin.</p>
                </header>

                <main>
                    <ScheduleFilter
                        selectedDoctorId={selectedDoctorId}
                        onDoctorChange={setSelectedDoctorId}
                        selectedDate={selectedDate}
                        onDateChange={setSelectedDate}
                    />

                    <ScheduleViewer
                        doctorId={selectedDoctorId}
                        date={selectedDate}
                    />
                </main>
            </div>
        </div>
    );
}
