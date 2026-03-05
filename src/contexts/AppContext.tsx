import React, { createContext, useContext, useState, ReactNode } from 'react';
import { users as initialUsers, alerts as initialAlerts, MockUser, Alert } from '@/data/mockData';

export interface Notification {
    id: string;
    message: string;
    sender: 'admin' | 'officer';
    target: 'admin' | 'officer';
    timestamp: string;
}

interface AppContextType {
    users: MockUser[];
    alerts: Alert[];
    notifications: Notification[];
    addUser: (user: Omit<MockUser, 'id' | 'lastLogin' | 'status'>) => void;
    updateUser: (id: string, updates: Partial<MockUser>) => void;
    deleteUser: (id: string) => void;
    updateAlert: (id: string, updates: Partial<Alert>, triggerNotification?: boolean) => void;
    addNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
    clearNotifications: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
    const [users, setUsers] = useState<MockUser[]>(initialUsers);
    const [alerts, setAlerts] = useState<Alert[]>(initialAlerts);
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const addUser = (userData: Omit<MockUser, 'id' | 'lastLogin' | 'status'>) => {
        const newUser: MockUser = {
            ...userData,
            id: Math.random().toString(36).substr(2, 9),
            status: 'active',
            lastLogin: new Date().toISOString().split('T')[0],
        };
        setUsers([...users, newUser]);
    };

    const updateUser = (id: string, updates: Partial<MockUser>) => {
        setUsers(users.map(u => u.id === id ? { ...u, ...updates } : u));
    };

    const deleteUser = (id: string) => {
        setUsers(users.filter(u => u.id !== id));
    };

    const addNotification = (notif: Omit<Notification, 'id' | 'timestamp'>) => {
        const newNotif: Notification = {
            ...notif,
            id: Math.random().toString(36).substr(2, 9),
            timestamp: new Date().toLocaleTimeString(),
        };
        setNotifications(prev => [newNotif, ...prev]);
    };

    const clearNotifications = () => setNotifications([]);

    const updateAlert = (id: string, updates: Partial<Alert>, triggerNotification = true) => {
        setAlerts(prev => prev.map(a => {
            if (a.id === id) {
                const updated = { ...a, ...updates };

                if (triggerNotification) {
                    // Rule 1: Officer resolves -> Admin notification
                    if (updates.status === 'pending_confirmation' && a.status !== 'pending_confirmation') {
                        addNotification({
                            message: `OFFICER ACTION: Resolution submitted for Mission #${a.id.toUpperCase()}`,
                            sender: 'officer',
                            target: 'admin'
                        });
                    }
                    // Rule 2: Admin sends anything (edit/broadcast) -> Officer notification
                    else if (updates.message && updates.message !== a.message) {
                        addNotification({
                            message: `HQ UPDATE: New intelligence broadcast for Mission #${a.id.toUpperCase()}`,
                            sender: 'admin',
                            target: 'officer'
                        });
                    }
                    // Rule 3: Admin confirms resolution -> Officer notification
                    else if (updates.status === 'resolved' && a.status === 'pending_confirmation') {
                        addNotification({
                            message: `HQ CONFIRMED: Mission #${a.id.toUpperCase()} is officially CLOSED`,
                            sender: 'admin',
                            target: 'officer'
                        });
                    }
                }

                return updated;
            }
            return a;
        }));
    };

    return (
        <AppContext.Provider value={{ users, alerts, notifications, addUser, updateUser, deleteUser, updateAlert, addNotification, clearNotifications }}>
            {children}
        </AppContext.Provider>
    );
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (!context) throw new Error('useAppContext must be used within an AppProvider');
    return context;
};
