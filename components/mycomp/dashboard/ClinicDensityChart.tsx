'use client';

import { Pie, PieChart, ResponsiveContainer, Cell, Tooltip } from 'recharts';
import { useClinicAppointmentDensity } from '@/hooks/useDashboardStats';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { PieChart as PieChartIcon } from 'lucide-react';

// Grafikteki her bir dilim için renkler
const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#AF19FF", "#FF4560"];

export function ClinicDensityChart() {
    const { densityData, isLoading, error } = useClinicAppointmentDensity();

    // 1. Veri Yüklenirken Gösterilecek Skeleton
    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <PieChartIcon className="h-5 w-5 text-muted-foreground" />
                        Bölümlere Göre Randevu Yoğunluğu
                    </CardTitle>
                    <CardDescription>Bu ayki randevuların polikliniklere göre dağılımı.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Skeleton className="w-full h-[300px]" />
                </CardContent>
            </Card>
        );
    }

    // 2. Hata Durumunda Gösterilecek Mesaj
    if (error) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <PieChartIcon className="h-5 w-5 text-muted-foreground" />
                        Bölümlere Göre Randevu Yoğunluğu
                    </CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-center h-[300px]">
                    <p className="text-sm text-destructive">Veri yüklenirken bir hata oluştu.</p>
                </CardContent>
            </Card>
        )
    }

    // 3. Veri Yoksa Gösterilecek Mesaj
    if (!densityData || densityData.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <PieChartIcon className="h-5 w-5 text-muted-foreground" />
                        Bölümlere Göre Randevu Yoğunluğu
                    </CardTitle>
                    <CardDescription>Bu ayki randevuların polikliniklere göre dağılımı.</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center h-[300px]">
                    <p className="text-sm text-muted-foreground">Bu ay için görüntülenecek randevu verisi bulunamadı.</p>
                </CardContent>
            </Card>
        );
    }

    // 4. Veri Varsa Gösterilecek Grafik
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <PieChartIcon className="h-5 w-5 text-muted-foreground" />
                    Bölümlere Göre Randevu Yoğunluğu
                </CardTitle>
                <CardDescription>Bu ayki randevuların polikliniklere göre dağılımı.</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                        <Tooltip
                            contentStyle={{
                                background: "hsl(var(--background))",
                                border: "1px solid hsl(var(--border))",
                                borderRadius: "var(--radius)",
                            }}
                        />
                        <Pie
                            data={densityData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            outerRadius={110}
                            fill="#8884d8"
                            dataKey="appointmentCount"
                            nameKey="clinicName"
                        >
                            {densityData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                    </PieChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}