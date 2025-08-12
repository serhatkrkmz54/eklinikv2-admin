'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Badge } from '@/components/ui/badge';
import { CalendarDays } from 'lucide-react';
import { format, getDayOfYear, getDaysInYear } from 'date-fns';
import { tr } from 'date-fns/locale';

export function DashboardCalendar() {
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        return () => {
            clearInterval(timer);
        };
    }, []);

    const dayOfYear = getDayOfYear(currentTime);
    const totalDaysInYear = getDaysInYear(currentTime);
    const yearProgress = (dayOfYear / totalDaysInYear) * 100;

    const formatShortWeekdayName = (day: Date) => {
        return format(day, 'EEE', { locale: tr });
    };

    return (
        <Card className="w-full shadow-lg">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 px-6">
                <div className="flex items-center gap-x-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <CalendarDays className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                        <CardTitle className="text-base font-semibold">Takvim & Zaman</CardTitle>
                        <CardDescription className="text-xs mt-1">
                            Günün özeti ve zaman akışı
                        </CardDescription>
                    </div>
                </div>
                <Badge variant="outline" className="text-sm font-mono tracking-wider">
                    {format(currentTime, 'HH:mm:ss')}
                </Badge>
            </CardHeader>

            <CardContent className="p-4 md:p-6">
                <div className="text-center mb-4">
                    <p className="text-2xl font-bold text-primary">
                        {format(currentTime, 'd MMMM yyyy', { locale: tr })}
                    </p>
                    <p className="text-lg text-muted-foreground">
                        {format(currentTime, 'EE', { locale: tr })}
                    </p>
                </div>

                <div className="rounded-md border">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        locale={tr}
                        className="p-3"
                        formatters={{ formatWeekdayName: formatShortWeekdayName }}
                        classNames={{
                            months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
                            month: "space-y-4",
                            caption: "flex justify-center pt-1 relative items-center",
                            caption_label: "text-base font-semibold text-primary",
                            nav: "space-x-1 flex items-center",
                            nav_button: "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                            table: "w-full rdp-spacing-fix",
                            day: "h-9 w-9 p-0 font-normal aria-selected:opacity-100 rdp-day-spacing",
                            head_cell: "text-muted-foreground rounded-md font-normal text-[0.8rem]",
                            cell: "p-0",
                            day_selected: "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground rounded-full",
                            day_today: "bg-accent text-accent-foreground rounded-full",
                            day_outside: "text-muted-foreground opacity-50",
                            day_disabled: "text-muted-foreground opacity-50",
                            day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
                            day_hidden: "invisible",
                        }}
                    />
                </div>

                <div className="w-full mt-6">
                    <div className="flex justify-between mb-1">
                        <p className="text-xs font-medium text-muted-foreground">Yıl İlerlemesi</p>
                        <p className="text-xs font-semibold text-primary">{`${Math.round(yearProgress)}%`}</p>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                        <div
                            className="bg-primary h-2 rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${yearProgress}%` }}
                        ></div>
                    </div>
                    <p className="text-right text-xs text-muted-foreground mt-1">({dayOfYear}/{totalDaysInYear})</p>
                </div>
            </CardContent>
        </Card>
    );
}