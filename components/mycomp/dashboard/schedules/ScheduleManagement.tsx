'use client';

import React, { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSchedulesForDoctor, useDeleteScheduleSlot, ScheduleResponse, ScheduleStatus } from '@/hooks/useScheduleService';
import { useDoctorsForScheduling } from '@/hooks/useScheduleService';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { cn } from '@/lib/utils';
import { CalendarIcon, Check, ChevronsUpDown, Clock, Trash2, Loader2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { tr } from 'date-fns/locale';
// WebSocket için gerekli kütüphaneler
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

// --- Filtreleme Bileşeni (Değişiklik yok) ---
interface ScheduleFilterProps {
    selectedDoctorId: number | null;
    onDoctorChange: (id: number | null) => void;
    selectedDate: Date;
    onDateChange: (date: Date) => void;
}
export function ScheduleFilter({ selectedDoctorId, onDoctorChange, selectedDate, onDateChange }: ScheduleFilterProps) {
    const { data: doctors, isLoading } = useDoctorsForScheduling();
    return (
        <Card>
            <CardHeader>
                <CardTitle>Takvim Görüntüle</CardTitle>
                <CardDescription>Bir doktor ve tarih seçerek o güne ait çalışma takvimini görüntüleyin.</CardDescription>
            </CardHeader>
            <CardContent className="grid sm:grid-cols-2 gap-4">
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant="outline" role="combobox" className={cn("w-full justify-between", !selectedDoctorId && "text-muted-foreground")}>
                            {selectedDoctorId ? doctors?.find(d => d.doctorId === selectedDoctorId)?.user.firstName + ' ' + doctors?.find(d => d.doctorId === selectedDoctorId)?.user.lastName : "Bir doktor seçin"}
                            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[--radix-popover-trigger-width] p-0"><Command><CommandInput placeholder="Doktor ara..." />
                        <CommandList><CommandEmpty>Doktor bulunamadı.</CommandEmpty><CommandGroup>
                            {isLoading ? <p className="p-2 text-sm">Yükleniyor...</p> : doctors?.map(doctor => (
                                <CommandItem value={`${doctor.user.firstName} ${doctor.user.lastName}`} key={doctor.doctorId} onSelect={() => onDoctorChange(doctor.doctorId)}>
                                    <Check className={cn("mr-2 h-4 w-4", selectedDoctorId === doctor.doctorId ? "opacity-100" : "opacity-0")} />
                                    {doctor.user.firstName} {doctor.user.lastName}
                                </CommandItem>
                            ))}
                        </CommandGroup></CommandList>
                    </Command></PopoverContent>
                </Popover>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !selectedDate && "text-muted-foreground")}>
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {selectedDate ? format(selectedDate, 'dd MMMM yyyy', { locale: tr }) : <span>Tarih Seçin</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={selectedDate} onSelect={(date) => date && onDateChange(date)} initialFocus /></PopoverContent>
                </Popover>
            </CardContent>
        </Card>
    );
}

// --- Takvim Görüntüleme Bileşeni (WebSocket Hata Ayıklama Eklendi) ---
interface ScheduleViewerProps {
    doctorId: number | null;
    date: Date | null;
}
export function ScheduleViewer({ doctorId, date }: ScheduleViewerProps) {
    const queryClient = useQueryClient();
    const dateString = date ? format(date, 'yyyy-MM-dd') : null;
    const { data: schedules, isLoading, error } = useSchedulesForDoctor(doctorId, dateString);

    useEffect(() => {
        if (!doctorId || !dateString) {
            return;
        }

        const topic = `/topic/slots/${doctorId}/${dateString}`;

        // DÜZELTME: Hata ayıklama logları eklendi.
        const stompClient = new Client({
            webSocketFactory: () => new SockJS('http://localhost:8080/ws'),

            // Konsolda detaylı STOMP loglarını görmek için
            debug: (str) => {
                console.log('STOMP DEBUG:', str);
            },

            reconnectDelay: 5000, // 5 saniyede bir yeniden bağlanmayı dene

            onConnect: () => {
                console.log(`✅ WebSocket bağlantısı BAŞARILI. Konu dinleniyor: ${topic}`);
                stompClient.subscribe(topic, (message) => {
                    try {
                        const updatedSlot: ScheduleResponse = JSON.parse(message.body);
                        console.log('✅ Anlık güncelleme MESAJI ALINDI:', updatedSlot);

                        queryClient.setQueryData<ScheduleResponse[]>(
                            ['schedules', doctorId, dateString],
                            (oldData) => {
                                if (!oldData) {
                                    console.log('Önbellek boştu, yeni veri eklendi.');
                                    return [updatedSlot];
                                }
                                const newData = oldData.map(slot =>
                                    slot.id === updatedSlot.id ? updatedSlot : slot
                                );
                                console.log('Önbellek güncellendi.');
                                return newData;
                            }
                        );
                    } catch (e) {
                        console.error('❌ Gelen WebSocket mesajı işlenemedi:', e);
                    }
                });
            },

            // Bağlantı sırasında STOMP seviyesinde bir hata olursa
            onStompError: (frame) => {
                console.error('❌ STOMP protokol hatası:', frame.headers['message']);
                console.error('Detaylar:', frame.body);
            },

            // Daha alt seviye WebSocket bağlantı hatası olursa
            onWebSocketError: (event) => {
                console.error('❌ WebSocket bağlantı hatası:', event);
            },

            // Bağlantı kesildiğinde
            onDisconnect: () => {
                console.log('🔌 WebSocket bağlantısı KESİLDİ.');
            }
        });

        stompClient.activate();

        return () => {
            if (stompClient.connected) {
                stompClient.deactivate();
            }
        };
    }, [doctorId, dateString, queryClient]);


    if (!doctorId || !date) {
        return <Card className="mt-8"><CardContent className="p-8 text-center text-muted-foreground">Lütfen bir doktor ve tarih seçin.</CardContent></Card>;
    }
    if (isLoading) {
        return <Card className="mt-8"><CardContent className="p-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">{[...Array(8)].map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}</CardContent></Card>;
    }
    if (error) {
        return <Card className="mt-8"><CardContent className="p-8 text-center text-destructive">Takvim yüklenirken bir hata oluştu.</CardContent></Card>;
    }
    if (schedules?.length === 0) {
        return <Card className="mt-8"><CardContent className="p-8 text-center text-muted-foreground">Seçili tarih için oluşturulmuş bir takvim bulunamadı.</CardContent></Card>;
    }

    return (
        <Card className="mt-8">
            <CardHeader>
                <CardTitle>{format(date, 'dd MMMM yyyy, EEEE', { locale: tr })} Takvimi</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {schedules?.map(slot => <ScheduleSlot key={slot.id} slot={slot} />)}
            </CardContent>
        </Card>
    );
}

// --- Tek Bir Zaman Dilimi Bileşeni (Değişiklik yok) ---
const StatusBadge = ({ status }: { status: ScheduleStatus }) => {
    const statusConfig = {
        AVAILABLE: { text: "Müsait", className: "bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300" },
        BOOKED: { text: "Dolu", className: "bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300" },
        COMPLETED: { text: "Tamamlandı", className: "bg-gray-100 text-gray-800 dark:bg-gray-800/50 dark:text-gray-300" },
        CANCELLED: { text: "İptal", className: "bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300" },
    };
    return <Badge className={cn("font-semibold", statusConfig[status].className)}>{statusConfig[status].text}</Badge>;
};

function ScheduleSlot({ slot }: { slot: ScheduleResponse }) {
    const [isAlertOpen, setAlertOpen] = React.useState(false);
    const deleteMutation = useDeleteScheduleSlot();
    const canBeDeleted = slot.status === 'AVAILABLE';

    return (
        <>
            <div className="relative group p-4 rounded-lg border bg-card flex flex-col justify-between h-24">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-mono text-lg font-semibold text-foreground">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        {format(parseISO(slot.startTime), 'HH:mm')}
                    </div>
                    <StatusBadge status={slot.status} />
                </div>
                <p className="text-sm text-muted-foreground text-center">
                    {format(parseISO(slot.startTime), 'HH:mm')} - {format(parseISO(slot.endTime), 'HH:mm')}
                </p>
                {canBeDeleted && (
                    <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button variant="destructive" size="sm" onClick={() => setAlertOpen(true)}><Trash2 className="h-4 w-4 mr-2" /> Sil</Button>
                    </div>
                )}
            </div>
            <AlertDialog open={isAlertOpen} onOpenChange={setAlertOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Emin misiniz?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bu zaman dilimini kalıcı olarak silmek üzeresiniz. Bu işlem geri alınamaz.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Vazgeç</AlertDialogCancel>
                        <AlertDialogAction onClick={() => deleteMutation.mutate(slot.id)} className="bg-destructive hover:bg-destructive/90" disabled={deleteMutation.isPending}>
                            {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Evet, Sil"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
