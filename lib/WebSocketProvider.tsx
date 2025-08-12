'use client';

import React, { useEffect, useRef } from 'react';
import { Client, IMessage } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useSession } from 'next-auth/react';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { useSWRConfig } from 'swr';
import {useNotification} from "@/context/NotificationContext"; // YENİ: SWR cache'ini yönetmek için

// Bildirim mesajının tipi (backend'den gelen)
interface AppointmentNotification {
    patientFullName: string;
    appointmentTime: string; // ISO String
    message: string;
}

export const WebSocketProvider = ({ children }: { children: React.ReactNode }) => {
    const { data: session, status } = useSession();
    const { mutate } = useSWRConfig(); // YENİ: mutate fonksiyonunu alıyoruz
    const { addNotification } = useNotification(); // YENİ: addNotification fonksiyonunu alıyoruz
    const clientRef = useRef<Client | null>(null);
    console.log("MEVCUT OTURUM BİLGİSİ (SESSION):", session);

    useEffect(() => {
        if (status === 'authenticated' && session.accessToken && !clientRef.current) {

            const client = new Client({
                webSocketFactory: () => new SockJS(process.env.NEXT_PUBLIC_API_URL + '/ws'),
                connectHeaders: {
                    Authorization: `Bearer ${session.accessToken}`,
                },
                debug: (str) => console.log('STOMP: ' + str),
                reconnectDelay: 5000,
                heartbeatIncoming: 4000,
                heartbeatOutgoing: 4000,
            });

            client.onConnect = (frame) => {
                console.log('WebSocket\'e bağlanıldı: ' + frame);

                // Doktora özel bildirim kanalına abone ol
                client.subscribe('/user/queue/notifications', (message: IMessage) => {
                    console.log("HAM BİLDİRİM MESAJI GELDİ:", message.body);

                    try {
                        const notificationData: AppointmentNotification = JSON.parse(message.body);
                        console.log("İŞLENMİŞ BİLDİRİM:", notificationData);

                        // --- YENİ ADIM 1: Bildirimi global state'e ekle ---
                        addNotification({
                            title: notificationData.message || `Yeni Randevu: ${notificationData.patientFullName}`,
                            description: `Tarih: ${format(new Date(notificationData.appointmentTime), 'dd MMMM yyyy, HH:mm', { locale: tr })}`,
                        });
                        console.log("addNotification fonksiyonu başarıyla çağrıldı.");

                        // --- YENİ ADIM 2: Dashboard verilerini yeniden yüklemesi için SWR'ı tetikle ---
                        // Bu, sayfa yenilenmeden verilerin güncellenmesini sağlar.
                        mutate('/api/doctor/appointments/upcoming');
                        mutate(`/api/doctor/appointments?date=${format(new Date(), 'yyyy-MM-dd')}`);
                        console.log("SWR mutate fonksiyonları başarıyla çağrıldı.");

                    } catch (error) {
                        console.error("Bildirim mesajı işlenemedi", error);

                    }
                });

            };

            client.onStompError = (frame) => {
                console.error('Broker hatası: ' + frame.headers['message']);
                console.error('Detaylar: ' + frame.body);
            };

            client.activate();
            clientRef.current = client;
        }

        if (status === 'unauthenticated' && clientRef.current?.active) {
            clientRef.current.deactivate();
            clientRef.current = null;
            console.log('WebSocket bağlantısı kesildi (oturum kapatıldı).');
        }

        return () => {
            if (clientRef.current?.active) {
                clientRef.current.deactivate();
                clientRef.current = null;
            }
        };
        // DEĞİŞTİ: Yeni hook fonksiyonlarını bağımlılıklara ekliyoruz
    }, [status, session, addNotification, mutate]);

    return <>{children}</>;
};