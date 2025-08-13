'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export interface Notification {
    id: string;
    title: string;
    description: string;
    date: Date;
    isRead: boolean;
}

interface NotificationContextType {
    notifications: Notification[];
    unreadCount: number;
    addNotification: (notification: Omit<Notification, 'id' | 'date' | 'isRead'>) => void;
    markAllAsRead: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const NOTIFICATION_STORAGE_KEY = 'eKlinik-notifications';

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    useEffect(() => {
        try {
            const storedItems = localStorage.getItem(NOTIFICATION_STORAGE_KEY);
            if (storedItems) {
                const parsedItems = JSON.parse(storedItems).map((item: any) => ({
                    ...item,
                    date: new Date(item.date),
                }));
                setNotifications(parsedItems);
            }
        } catch (error) {
            console.error("Failed to load notifications from localStorage", error);
        }
    }, []);

    useEffect(() => {
        try {
            localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(notifications));
        } catch (error) {
            console.error("Failed to save notifications to localStorage", error);
        }
    }, [notifications]);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    const addNotification = (notificationData: Omit<Notification, 'id' | 'date' | 'isRead'>) => {
        const newNotification: Notification = {
            ...notificationData,
            id: new Date().toISOString() + Math.random(),
            date: new Date(),
            isRead: false,
        };
        setNotifications(prev => [newNotification, ...prev]);
    };

    const markAllAsRead = () => {
        setNotifications(prev =>
            prev.map(n => (n.isRead ? n : { ...n, isRead: true }))
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

export const useNotification = () => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotification must be used within a NotificationProvider');
    }
    return context;
};