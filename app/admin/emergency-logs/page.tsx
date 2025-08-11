// app/dashboard/emergency-logs/page.tsx
'use client';

import React from 'react';
import { useEmergencyCallLogs } from '@/hooks/useEmergencyService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Siren, MapPin, User, Clock } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';

export default function EmergencyLogsPage() {
    const { logs, isLoading, error } = useEmergencyCallLogs();

    return (
        <div className="p-4 md:p-8 space-y-6">
            <header>
                <h1 className="text-3xl font-bold tracking-tight">Acil Durum Çağrı Kayıtları</h1>
                <p className="text-muted-foreground mt-1">Sistem üzerinden yapılan tüm acil durum çağrılarının listesi.</p>
            </header>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Siren className="h-5 w-5" />
                        Çağrı Geçmişi
                    </CardTitle>
                    <CardDescription>En son yapılan çağrılar en üstte gösterilir.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Çağrı Zamanı</TableHead>
                                <TableHead>Çağıran Kişi</TableHead>
                                <TableHead>Bildirilen Adres</TableHead>
                                <TableHead className="text-right">Konum</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                [...Array(5)].map((_, i) => (
                                    <TableRow key={i}>
                                        <TableCell colSpan={4}><Skeleton className="h-8 w-full" /></TableCell>
                                    </TableRow>
                                ))
                            ) : error ? (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center text-destructive">
                                        Kayıtlar yüklenirken bir hata oluştu.
                                    </TableCell>
                                </TableRow>
                            ) : logs && logs.length > 0 ? (
                                logs.map((log) => (
                                    <TableRow key={log.id}>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-mono">{format(parseISO(log.callTime), 'HH:mm:ss')}</span>
                                                <span className="text-xs text-muted-foreground">{format(parseISO(log.callTime), 'dd MMMM yyyy', { locale: tr })}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <User className="h-4 w-4 text-muted-foreground" />
                                                <span className="font-medium">{log.callerName}</span>
                                                {!log.patient && <Badge variant="outline">Giriş Yapılmamış</Badge>}
                                            </div>
                                        </TableCell>
                                        <TableCell className="max-w-xs truncate">{log.address || "Adres belirtilmedi"}</TableCell>
                                        <TableCell className="text-right">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => window.open(`https://www.google.com/maps?q=${log.latitude},${log.longitude}`, "_blank")}
                                            >
                                                <MapPin className="h-4 w-4 mr-2" />
                                                Haritada Göster
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={4} className="h-24 text-center">
                                        Henüz acil durum çağrısı yapılmamış.
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