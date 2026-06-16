import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Bell, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Notification {
  id: string;
  student_id: string;
  type: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export default function CounselorNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.is_read).length;

  useEffect(() => {
    if (!user?.id) return;

    const fetchNotifications = async () => {
      const { data, error } = await (supabase
        .from("notifications" as any)
        .select("*")
        .eq("counselor_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20)) as any;

      if (!error && data) setNotifications(data);
    };

    fetchNotifications();

    const channel = supabase
      .channel("counselor-notifications")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "notifications",
          filter: `counselor_id=eq.${user.id}`,
        },
        (payload) => {
          setNotifications(prev => [payload.new as Notification, ...prev]);
          toast.info((payload.new as Notification).message);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user?.id]);

  const markAllRead = async () => {
    const unreadIds = notifications.filter(n => !n.is_read).map(n => n.id);
    if (!unreadIds.length) return;

    await (supabase
      .from("notifications" as any)
      .update({ is_read: true })
      .in("id", unreadIds)) as any;

    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className="relative p-2 rounded-full hover:bg-muted transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-10 w-80 bg-background border border-border rounded-2xl shadow-xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <span className="font-bold text-sm">Notifications</span>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" onClick={markAllRead} className="text-xs h-7 gap-1">
                <CheckCheck className="w-3.5 h-3.5" />
                Mark all read
              </Button>
            )}
          </div>

          <div className="max-h-72 overflow-y-auto divide-y divide-border">
            {notifications.length === 0 ? (
              <p className="text-center text-muted-foreground text-sm py-8">No notifications yet</p>
            ) : (
              notifications.map(n => (
                <div key={n.id} className={`px-4 py-3 text-sm ${n.is_read ? "opacity-60" : "bg-primary/5"}`}>
                  <p className="font-medium text-foreground">{n.message}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {new Date(n.created_at).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
