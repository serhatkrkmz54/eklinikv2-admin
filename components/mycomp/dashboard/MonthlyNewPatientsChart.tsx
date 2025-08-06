'use client';

import {Bar, BarChart, XAxis} from 'recharts';
import {useMonthlyNewPatientStats} from '@/hooks/useDashboardStats';
import {Card, CardContent, CardDescription, CardHeader, CardTitle} from '@/components/ui/card';
import {Skeleton} from '@/components/ui/skeleton';
import {BarChart3} from 'lucide-react';
import {ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent,} from "@/components/ui/chart";

const chartConfig = {
    count: {
        label: "Yeni Hasta",
        color: "hsl(var(--primary))",
    },
} satisfies ChartConfig;

export function MonthlyNewPatientsChart() {
    const { chartData, isLoading, error } = useMonthlyNewPatientStats();

    if (isLoading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-muted-foreground" />
                        Aylık Yeni Hasta Kaydı
                    </CardTitle>
                    <CardDescription>Son 6 ayda sisteme eklenen yeni hasta sayılarının grafiği.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Skeleton className="w-full h-[300px]" />
                </CardContent>
            </Card>
        );
    }

    if (error || !chartData) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-muted-foreground" />
                        Aylık Yeni Hasta Kaydı
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="w-full h-[300px] flex items-center justify-center text-muted-foreground">
                        Veri yüklenirken bir hata oluştu.
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-muted-foreground" />
                    Aylık Yeni Hasta Kaydı
                </CardTitle>
                <CardDescription>Son 6 ayda sisteme eklenen yeni hasta sayılarının grafiği.</CardDescription>
            </CardHeader>
            <CardContent>
                <ChartContainer config={chartConfig} className="w-full h-[300px]">
                    <BarChart accessibilityLayer data={chartData}>
                        <XAxis
                            dataKey="month"
                            tickLine={false}
                            tickMargin={10}
                            axisLine={false}
                            tickFormatter={(value) => value.slice(0, 3)}
                        />
                        <ChartTooltip
                            cursor={false}
                            content={<ChartTooltipContent />}
                        />
                        <Bar
                            dataKey="count"
                            fill="var(--color-count)"
                            radius={8}
                        />
                    </BarChart>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
