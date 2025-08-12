'use client';

import {Card, CardContent, CardHeader, CardTitle} from "@/components/ui/card";
import {Skeleton} from "@/components/ui/skeleton";
import type {LucideIcon} from "lucide-react";

interface DashboardCardProps {
    title: string;
    value: string;
    description: string;
    icon: LucideIcon;
    isLoading?: boolean;
}

export default function DashboardCard({
                                          title,
                                          value,
                                          description,
                                          icon: Icon,
                                          isLoading,
                                      }: DashboardCardProps) {

    const BgIcon = Icon;

    if (isLoading) {
        return (
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">{title}</CardTitle>
                    <Skeleton className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                    <Skeleton className="h-8 w-24 mt-1" />
                    <Skeleton className="h-4 w-full mt-2" />
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="group relative overflow-hidden transition-transform hover:-translate-y-1">
            <BgIcon className="absolute -bottom-4 -right-4 h-28 w-28 text-gray-200 opacity-20 transition-transform duration-300 ease-in-out group-hover:-translate-x-2 group-hover:-translate-y-2 group-hover:rotate-12 dark:text-gray-700" />

            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                    {title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">
                    {value}
                </div>
                <p className="text-xs text-muted-foreground">
                    {description}
                </p>
            </CardContent>
        </Card>
    );
}