'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

// Tek bir bildirimin nasıl görüneceğini tanımlayan tip
export interface Notification {
    id: string;
    title: string;
    description: string;
    date: Date;
    isRead: boolean;
}

// Context'in state'i ve fonksiyonları
interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    addNotification: (notification: Omit<Notification, 'id' | 'date' | 'isRead'>) => void;
    markAllAsRead: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const unreadCount = notifications.filter(n => !n.isRead).length;

    const addNotification = (notificationData: Omit<Notification, 'id' | 'date' | 'isRead'>) => {
        const newNotification: Notification = {
            ...notificationData,
            id: new Date().toISOString() + Math.random(), // Basit bir unique ID
            date: new Date(),
            isRead: false,
        };
        // Yeni bildirim listenin başına eklenir
        setNotifications(prev => [newNotification, ...prev]);
    };

    const markAllAsRead = () => {
        setNotifications(prev =>
            prev.map(n => ({ ...n, isRead: true }))
        );
    };

    const value = {
        notifications,
        unreadCount,
        addNotification,
        markAllAsRead,
    };

    return (
        <NotificationContext.Provider value={value}>
            {children}
        </NotificationContext.Provider>
    );
};

// Hook'u export ediyoruz
export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};