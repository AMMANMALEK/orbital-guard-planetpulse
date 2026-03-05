import { useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAppContext } from '@/contexts/AppContext';
import { toast } from 'sonner';
import { Bell, Radio, ShieldCheck } from 'lucide-react';

const NotificationListener = () => {
    const { user } = useAuth();
    const { notifications } = useAppContext();
    const lastNotifId = useRef<string | null>(null);

    useEffect(() => {
        if (notifications.length > 0) {
            const latest = notifications[0];

            // Check if this is a new notification and if it's meant for the current user's role
            if (latest.id !== lastNotifId.current) {
                lastNotifId.current = latest.id;

                if (user && latest.target === user.role) {
                    toast(latest.message, {
                        icon: latest.sender === 'admin' ?
                            <Radio className="h-4 w-4 text-primary animate-pulse" /> :
                            <ShieldCheck className="h-4 w-4 text-blue-500 animate-bounce" />,
                        duration: 8000,
                        position: 'top-right',
                        className: "bg-card/80 backdrop-blur-xl border border-border shadow-2xl font-black rounded-2xl p-4",
                        description: `Operational Timestamp: ${latest.timestamp}`,
                    });
                }
            }
        }
    }, [notifications, user]);

    return null;
};

export default NotificationListener;
