import { useAppContext } from '@/contexts/AppContext';
import { useAuth } from '@/contexts/AuthContext';
import { Bell, CheckCheck, AlertCircle, Radio, MessageSquare, FileWarning } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { NotificationType } from '@/contexts/AppContext';
import { useState } from 'react';

const typeLabels: Record<NotificationType, string> = {
  alert_update: 'Alert Update',
  resolution_request: 'Resolution Request',
  admin_broadcast: 'Admin Broadcast',
  complaint_submitted: 'Complaint Submitted',
};

const typeIcons: Record<NotificationType, React.ElementType> = {
  alert_update: AlertCircle,
  resolution_request: FileWarning,
  admin_broadcast: Radio,
  complaint_submitted: MessageSquare,
};

interface NotificationPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function NotificationPanel({ open, onOpenChange }: NotificationPanelProps) {
  const { notifications, markNotificationRead, markAllNotificationsRead } = useAppContext();
  const { role } = useAuth();
  const [typeFilter, setTypeFilter] = useState<NotificationType | 'all'>('all');

  const filtered = notifications.filter(n => {
    if (role && n.target !== role) return false;
    if (typeFilter !== 'all' && n.type !== typeFilter) return false;
    return true;
  });

  const unreadCount = filtered.filter(n => !n.read).length;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
            {unreadCount > 0 && (
              <Badge variant="secondary" className="ml-2">{unreadCount}</Badge>
            )}
          </SheetTitle>
        </SheetHeader>
        <div className="mt-6 space-y-4">
          <div className="flex items-center gap-2">
            <Select value={typeFilter} onValueChange={(v) => setTypeFilter(v as NotificationType | 'all')}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All types</SelectItem>
                {(Object.keys(typeLabels) as NotificationType[]).map(t => (
                  <SelectItem key={t} value={t}>{typeLabels[t]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              size="sm"
              onClick={markAllNotificationsRead}
              className="shrink-0"
            >
              <CheckCheck className="h-4 w-4 mr-1" />
              Mark read
            </Button>
          </div>
          <ScrollArea className="h-[calc(100vh-220px)]">
            <div className="space-y-2 pr-4">
              {filtered.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No notifications</p>
              ) : (
                filtered.map(n => {
                  const Icon = typeIcons[n.type];
                  return (
                    <div
                      key={n.id}
                      onClick={() => markNotificationRead(n.id)}
                      className={cn(
                        'flex gap-3 rounded-lg border p-4 cursor-pointer transition-colors',
                        n.read ? 'bg-muted/30 border-border/50' : 'bg-primary/5 border-primary/20'
                      )}
                    >
                      <div className="rounded-full bg-muted p-2 h-fit">
                        {Icon && <Icon className="h-4 w-4 text-primary" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground">{n.message}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-[10px]">{typeLabels[n.type]}</Badge>
                          <span className="text-xs text-muted-foreground">{n.timestamp}</span>
                        </div>
                      </div>
                      {!n.read && (
                        <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-2" />
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </div>
      </SheetContent>
    </Sheet>
  );
}
