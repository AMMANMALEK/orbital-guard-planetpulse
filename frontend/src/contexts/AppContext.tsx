import React, { createContext, useContext, useState, ReactNode } from 'react';

export type NotificationType = 'alert_update' | 'resolution_request' | 'admin_broadcast' | 'complaint_submitted';

export interface Notification {
    id: string;
    message: string;
    type: NotificationType;
    sender: 'admin' | 'officer' | 'system';
    target: 'admin' | 'officer' | 'viewer';
    timestamp: string;
    read: boolean;
}

interface AppContextType {
    notifications: Notification[];
    addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
    clearNotifications: () => void;
    markNotificationRead: (id: string) => void;
    markAllNotificationsRead: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const addNotification = (notif: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
        const newNotif: Notification = {
            ...notif,
            id: Math.random().toString(36).substr(2, 9),
            timestamp: new Date().toLocaleTimeString(),
            read: false,
        };
        setNotifications(prev => [newNotif, ...prev]);
    };

    const markNotificationRead = (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    };

    const markAllNotificationsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const clearNotifications = () => setNotifications([]);

    return (
        <AppContext.Provider value={{
            notifications,
            addNotification, clearNotifications, markNotificationRead, markAllNotificationsRead,
        }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) throw new Error('useAppContext must be used within an AppProvider');
    return context;
};
