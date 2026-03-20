import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Bell, CheckCircle, Info, Calendar as CalendarIcon, X } from "lucide-react";
import { toast } from "sonner";
import { useI18n } from "@/context/I18nContext";

export const NotificationCenter = () => {
    const { t } = useI18n();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchNotifications = async () => {
        try {
            const response = await fetch("/api/notifications", {
                headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
            });
            const data = await response.json();
            setNotifications(data);
        } catch (error) {
            console.error("Failed to fetch notifications");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
    }, []);

    const markAsRead = async (id: string) => {
        try {
            const response = await fetch(`/api/notifications/${id}/read`, {
                method: "PUT",
                headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
            });
            if (response.ok) {
                setNotifications(notifications.map(n => n._id === id ? { ...n, status: 'read' } : n));
            }
        } catch (error) {
            toast.error(t('notif_update_fail'));
        }
    };

    const getIcon = (type: string) => {
        switch (type) {
            case 'reminder': return <CalendarIcon className="h-4 w-4 text-primary" />;
            case 'tip': return <Info className="h-4 w-4 text-blue-500" />;
            case 'alert': return <Bell className="h-4 w-4 text-orange-500" />;
            default: return <CheckCircle className="h-4 w-4 text-muted-foreground" />;
        }
    };

    if (loading) return <div className="p-4 text-center">{t('checking_updates')}</div>;

    return (
        <Card className="border-border shadow-md">
            <CardHeader className="pb-3 border-b bg-muted/20">
                <div className="flex justify-between items-center">
                    <CardTitle className="text-md font-bold flex items-center gap-2">
                        <Bell className="h-4 w-4" /> {t('notifications')}
                    </CardTitle>
                    <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
                        {notifications.filter(n => n.status === 'unread').length} {t('new_notif')}
                    </span>
                </div>
            </CardHeader>
            <CardContent className="p-0">
                {notifications.length > 0 ? (
                    <div className="divide-y max-h-[400px] overflow-y-auto">
                        {notifications.map((n) => (
                            <div key={n._id} className={`p-4 flex gap-4 transition-colors hover:bg-muted/30 ${n.status === 'unread' ? 'bg-primary/5' : ''}`}>
                                <div className={`mt-1 h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${n.type === 'alert' ? 'bg-orange-100' :
                                    n.type === 'tip' ? 'bg-blue-100' : 'bg-primary/10'
                                    }`}>
                                    {getIcon(n.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className={`text-sm font-semibold truncate ${n.status === 'unread' ? 'text-primary' : ''}`}>{n.title}</p>
                                    <p className="text-xs text-muted-foreground line-clamp-2">{n.message}</p>
                                    <p className="text-[10px] text-muted-foreground mt-1">
                                        {new Date(n.scheduledFor || n.sentAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                                {n.status === 'unread' && (
                                    <Button variant="ghost" size="icon" className="h-6 w-6 shrink-0" onClick={() => markAsRead(n._id)}>
                                        <X className="h-3 w-3" />
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="p-8 text-center">
                        <Info className="h-8 w-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                        <p className="text-sm text-muted-foreground">{t('no_notif')}</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
