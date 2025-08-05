'use client';

import React from 'react';
import { useFormContext } from 'react-hook-form';
import { useDoctorsForScheduling } from '@/hooks/useScheduleService';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Info, Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';

const daysOfWeek = [
    { id: 'MONDAY', label: 'Pazartesi' }, { id: 'TUESDAY', label: 'Salı' },
    { id: 'WEDNESDAY', label: 'Çarşamba' }, { id: 'THURSDAY', label: 'Perşembe' },
    { id: 'FRIDAY', label: 'Cuma' }, { id: 'SATURDAY', label: 'Cumartesi' },
    { id: 'SUNDAY', label: 'Pazar' },
] as const;

interface ScheduleSummaryProps {
    isPending: boolean;
}

export function ScheduleSummary({ isPending }: ScheduleSummaryProps) {
    const { watch } = useFormContext();
    const watchedValues = watch();
    const { data: doctors } = useDoctorsForScheduling();

    const selectedDaysText = watchedValues.workDays?.map((dayId: string) => daysOfWeek.find(d => d.id === dayId)?.label).join(', ') || 'Hiçbiri';

    return (
        <Card className="bg-card sticky top-8">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Info className="h-5 w-5"/>Takvim Özeti</CardTitle>
                <CardDescription>Oluşturulacak takvimin önizlemesi.</CardDescription>
            </CardHeader>
            <CardContent className="text-sm space-y-4">
                <div>
                    <h4 className="font-semibold">Doktor:</h4>
                    <p className="text-muted-foreground">{watchedValues.doctorId ? doctors?.find(d => d.doctorId === watchedValues.doctorId)?.user.firstName + ' ' + doctors?.find(d => d.doctorId === watchedValues.doctorId)?.user.lastName : 'Seçilmedi'}</p>
                </div>
                <div>
                    <h4 className="font-semibold">Tarih Aralığı:</h4>
                    <p className="text-muted-foreground">{watchedValues.dateRange?.from && watchedValues.dateRange?.to ? `${format(watchedValues.dateRange.from, 'dd LLL y', {locale: tr})} - ${format(watchedValues.dateRange.to, 'dd LLL y', {locale: tr})}` : 'Seçilmedi'}</p>
                </div>
                <div>
                    <h4 className="font-semibold">Çalışma Günleri:</h4>
                    <p className="text-muted-foreground">{selectedDaysText}</p>
                </div>
                <div>
                    <h4 className="font-semibold">Çalışma Saatleri:</h4>
                    <p className="text-muted-foreground">{watchedValues.workStartTime || '--:--'} - {watchedValues.workEndTime || '--:--'}</p>
                </div>
                {watchedValues.addLunchBreak && (
                    <div>
                        <h4 className="font-semibold">Öğle Molası:</h4>
                        <p className="text-muted-foreground">{watchedValues.lunchStartTime || '--:--'} - {watchedValues.lunchEndTime || '--:--'}</p>
                    </div>
                )}
                <div>
                    <h4 className="font-semibold">Randevu Aralığı:</h4>
                    <p className="text-muted-foreground">{watchedValues.slotDurationInMinutes ? `${watchedValues.slotDurationInMinutes} Dakika` : 'Seçilmedi'}</p>
                </div>
            </CardContent>
            <CardFooter>
                <Button type="submit" className="w-full" disabled={isPending}>
                    {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin"/>}
                    Takvimi Oluştur
                </Button>
            </CardFooter>
        </Card>
    );
}
