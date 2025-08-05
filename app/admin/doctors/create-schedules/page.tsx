'use client';

import React from 'react';
import { useForm, FormProvider, Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';

import { useGenerateSchedules, ScheduleGenerationRequest, DayOfWeek as ApiDayOfWeek } from '@/hooks/useScheduleService';

import { ScheduleForm } from '@/components/mycomp/dashboard/schedules/ScheduleForm';
import { ScheduleSummary } from '@/components/mycomp/dashboard/schedules/ScheduleSummary';

const scheduleGenerationSchema = z.object({
    doctorId: z.number({ message: "Lütfen bir doktor seçin." }),
    dateRange: z.object({
        from: z.date({ message: "Başlangıç tarihi zorunludur." }),
        to: z.date({ message: "Bitiş tarihi zorunludur." }),
    }),
    workStartTime: z.string({ message: "Başlangıç saati zorunludur." }).regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Geçersiz saat formatı (HH:mm)."),
    workEndTime: z.string({ message: "Bitiş saati zorunludur." }).regex(/^([01]\d|2[0-3]):([0-5]\d)$/, "Geçersiz saat formatı (HH:mm)."),
    workDays: z.array(z.string()).refine((value) => value.length > 0, {
        message: "En az bir çalışma günü seçmelisiniz.",
    }),
    addLunchBreak: z.boolean().default(false),
    lunchStartTime: z.string().optional(),
    lunchEndTime: z.string().optional(),
    slotDurationInMinutes: z.coerce.number().min(5, "Randevu aralığı en az 5 dakika olmalıdır."),
}).refine(data => !data.dateRange.from || !data.dateRange.to || data.dateRange.from <= data.dateRange.to, {
    message: "Bitiş tarihi, başlangıç tarihinden önce olamaz.",
    path: ["dateRange"],
}).refine(data => !data.workStartTime || !data.workEndTime || data.workStartTime < data.workEndTime, {
    message: "Bitiş saati, başlangıç saatinden sonra olmalıdır.",
    path: ["workEndTime"],
}).refine(data => !data.addLunchBreak || (data.lunchStartTime && data.lunchEndTime && data.lunchStartTime < data.lunchEndTime), {
    message: "Mola bitiş saati, başlangıç saatinden sonra olmalıdır.",
    path: ["lunchEndTime"],
});

type FormValues = z.infer<typeof scheduleGenerationSchema>;

export default function ScheduleGenerationPage() {
    const defaultFormValues = {
        addLunchBreak: false,
        workDays: [],
        slotDurationInMinutes: 30,
        doctorId: undefined,
        dateRange: {
            from: undefined,
            to: undefined,
        },
        workStartTime: '',
        workEndTime: '',
        lunchStartTime: '',
        lunchEndTime: '',
    };

    const methods = useForm<FormValues>({
        resolver: zodResolver(scheduleGenerationSchema) as Resolver<FormValues>,
        defaultValues: defaultFormValues,
    });

    const mutation = useGenerateSchedules();

    const onSubmit = (values: FormValues) => {
        const requestPayload: ScheduleGenerationRequest = {
            doctorId: values.doctorId,
            startDate: format(values.dateRange.from, 'yyyy-MM-dd'),
            endDate: format(values.dateRange.to, 'yyyy-MM-dd'),
            workStartTime: values.workStartTime,
            workEndTime: values.workEndTime,
            workDays: values.workDays as ApiDayOfWeek[],
            lunchStartTime: values.addLunchBreak ? values.lunchStartTime || null : null,
            lunchEndTime: values.addLunchBreak ? values.lunchEndTime || null : null,
            slotDurationInMinutes: values.slotDurationInMinutes,
        };

        mutation.mutate(requestPayload, {
            onSuccess: () => {
                methods.reset(defaultFormValues);
            }
        });
    };

    return (
        <div className="p-4 md:p-8 bg-gray-50 dark:bg-slate-900">
            <div className="w-full mx-auto">
                <FormProvider {...methods}>
                    <form onSubmit={methods.handleSubmit(onSubmit)} className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                        <ScheduleForm />

                        <div className="lg:col-span-1 space-y-6">
                            <ScheduleSummary isPending={mutation.isPending} />
                        </div>

                    </form>
                </FormProvider>
            </div>
        </div>
    );
}
