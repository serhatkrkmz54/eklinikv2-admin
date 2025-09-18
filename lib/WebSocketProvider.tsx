"use client";

import React, { useEffect, useRef } from "react";
import { Client, IMessage } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useSession } from "next-auth/react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { useSWRConfig } from "swr";
import { useNotification } from "@/context/NotificationContext";

interface AppointmentNotification {
  patientFullName: string;
  appointmentTime: string;
  message: string;
}

export const WebSocketProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const { data: session, status } = useSession();
  const { mutate } = useSWRConfig();

  const { addNotification } = useNotification();
  const clientRef = useRef<Client | null>(null);

  useEffect(() => {
    if (
      status === "authenticated" &&
      session.accessToken &&
      !clientRef.current
    ) {
      const client = new Client({
        webSocketFactory: () =>
          new SockJS(process.env.NEXT_PUBLIC_API_URL + "/ws"),
        connectHeaders: {
          Authorization: `Bearer ${session.accessToken}`,
        },
        debug: (str) => console.log("STOMP: " + str),
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
      });

      client.onConnect = () => {
        client.subscribe("/user/queue/notifications", (message: IMessage) => {
          try {
            const notificationData: AppointmentNotification = JSON.parse(
              message.body
            );

            addNotification({
              title:
                notificationData.message ||
                `Yeni Randevu: ${notificationData.patientFullName}`,
              description: `Tarih: ${format(
                new Date(notificationData.appointmentTime),
                "dd MMMM yyyy, HH:mm",
                { locale: tr }
              )}`,
            });

            mutate("/api/doctor/appointments/upcoming");
            mutate(
              `/api/doctor/appointments?date=${format(
                new Date(),
                "yyyy-MM-dd"
              )}`
            );
          } catch (error) {
            console.error("Bildirim mesajı işlenemedi", error);
          }
        });
      };

      client.onStompError = (frame) => {
        console.error("Broker hatası: " + frame.headers["message"]);
        console.error("Detaylar: " + frame.body);
      };

      client.activate();
      clientRef.current = client;
    }

    if (status === "unauthenticated" && clientRef.current?.active) {
      clientRef.current.deactivate();
      clientRef.current = null;
    }

    return () => {
      if (clientRef.current?.active) {
        clientRef.current.deactivate();
        clientRef.current = null;
      }
    };
  }, [status, session, addNotification, mutate]);

  return <>{children}</>;
};
