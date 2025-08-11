'use client';

import React, { useEffect, useState } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { BellRing, MapPin, User, Clock, Target } from 'lucide-react';
import { format } from 'date-fns';

interface EmergencyAlert {
    callId: number;
    patientFullName: string;
    address: string;
    latitude: number;
    longitude: number;
    accuracy: number;
    callTime: string;
}

const InfoRow = ({ icon: Icon, label, value }: { icon: React.ElementType, label: string, value: string }) => (
    <div className="flex items-start">
        <Icon className="h-5 w-5 mr-3 mt-1 text-muted-foreground" />
        <div>
            <p className="font-semibold text-foreground">{label}</p>
            <p className="text-muted-foreground">{value}</p>
        </div>
    </div>
);


export function EmergencyNotification() {
    const [alerts, setAlerts] = useState<EmergencyAlert[]>([]);

    useEffect(() => {
        const stompClient = new Client({
            webSocketFactory: () => new SockJS('http://localhost:8080/ws'),
            onConnect: () => {
                stompClient.subscribe('/topic/emergency-alerts', (message) => {
                    const newAlert: EmergencyAlert = JSON.parse(message.body);
                    setAlerts(prevAlerts => [...prevAlerts, newAlert]);
                });
            },
        });

        stompClient.activate();

        return () => {
            if (stompClient.connected) {
                stompClient.deactivate();
            }
        };
    }, []);

    const handleAcknowledge = (callId: number) => {
        setAlerts(prevAlerts => prevAlerts.filter(alert => alert.callId !== callId));
    };

    if (alerts.length === 0) {
        return null;
    }

    const latestAlert = alerts[0];

    return (
        <Dialog open={true}>
            <DialogContent className="max-w-lg border-red-500 border-4 animate-pulse">
                <DialogHeader>
                    <DialogTitle className="flex items-center text-2xl text-red-600">
                        <BellRing className="h-8 w-8 mr-3 animate-wiggle" />
                        ACİL DURUM ÇAĞRISI
                    </DialogTitle>
                    <DialogDescription>
                        Bir kullanıcı acil yardım talebinde bulundu. Lütfen hemen yanıt verin.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <InfoRow icon={User} label="Hasta" value={latestAlert.patientFullName} />
                    <InfoRow icon={MapPin} label="Bildirilen Adres" value={latestAlert.address} />
                    <InfoRow icon={Clock} label="Çağrı Zamanı" value={format(new Date(latestAlert.callTime), 'dd MMMM yyyy, HH:mm:ss')} />
                    <InfoRow icon={Target} label="Konum Doğruluğu" value={`Yaklaşık ${latestAlert.accuracy} metre`} />
                </div>
                <DialogFooter className="sm:justify-between gap-2">
                    <Button
                        variant="outline"
                        onClick={() => window.open(`https://www.google.com/maps?q=${latestAlert.latitude},${latestAlert.longitude}`, "_blank")}
                    >
                        <MapPin className="h-4 w-4 mr-2" />
                        Haritada Göster
                    </Button>
                    <Button
                        className="bg-red-600 hover:bg-red-700"
                        onClick={() => handleAcknowledge(latestAlert.callId)}
                    >
                        Çağrıyı Onayla
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
