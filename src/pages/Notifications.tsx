import { MobileLayout } from "@/components/layout/MobileLayout";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Mail,
  MessageSquare,
  Sparkles,
  Calendar,
  TrendingUp,
  Check,
  Trash2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
  useDeleteNotification,
} from "@/hooks/useNotifications";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { formatDistanceToNow } from "date-fns";

const typeConfig = {
  ai: { icon: Sparkles, color: "bg-primary/20 text-primary" },
  email: { icon: Mail, color: "bg-blue-500/20 text-blue-400" },
  message: { icon: MessageSquare, color: "bg-purple-500/20 text-purple-400" },
  calendar: { icon: Calendar, color: "bg-amber-500/20 text-amber-400" },
  insight: { icon: TrendingUp, color: "bg-green-500/20 text-green-400" },
};

export default function Notifications() {
  const { data: notifications = [], isLoading } = useNotifications();
  const markAsRead = useMarkNotificationRead();
  const markAllAsRead = useMarkAllNotificationsRead();
  const deleteNotification = useDeleteNotification();
  const [filter, setFilter] = useState<"all" | "unread">("all");

  const filteredNotifications = notifications.filter((n) =>
    filter === "all" ? true : !n.is_read
  );

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleMarkAsRead = (id: string) => {
    markAsRead.mutate(id);
  };

  const handleMarkAllAsRead = () => {
    markAllAsRead.mutate();
  };

  const handleDelete = (id: string) => {
    deleteNotification.mutate(id);
  };

  return (
    <MobileLayout>
      <div className="px-4 pt-6 space-y-4 safe-top">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
              <Bell className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-bold">Notifications</h1>
              <p className="text-sm text-muted-foreground">
                {unreadCount} unread
              </p>
            </div>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              disabled={markAllAsRead.isPending}
              className="text-xs text-primary font-medium px-3 py-1.5 rounded-lg hover:bg-primary/10 transition-colors"
            >
              Mark all read
            </button>
          )}
        </motion.div>

        {/* Filter Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex gap-2"
        >
          {(["all", "unread"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all",
                filter === f
                  ? "bg-primary text-primary-foreground shadow-glow-sm"
                  : "bg-secondary text-muted-foreground hover:text-foreground"
              )}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
              {f === "unread" && unreadCount > 0 && (
                <span className="ml-1.5 px-1.5 py-0.5 text-[10px] bg-primary-foreground/20 rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </motion.div>

        {/* Notifications List */}
        {isLoading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {filteredNotifications.map((notification, index) => {
                const config = typeConfig[notification.type];
                const Icon = config.icon;

                return (
                  <motion.div
                    key={notification.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ delay: index * 0.03 }}
                    className={cn(
                      "relative p-4 rounded-2xl transition-all group",
                      notification.is_read
                        ? "bg-secondary/50"
                        : "bg-secondary border border-primary/20"
                    )}
                  >
                    {/* Unread indicator */}
                    {!notification.is_read && (
                      <div className="absolute left-3 top-3 w-2 h-2 bg-primary rounded-full animate-pulse" />
                    )}

                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
                          config.color
                        )}
                      >
                        <Icon className="w-5 h-5" />
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p
                            className={cn(
                              "font-medium text-sm",
                              !notification.is_read && "text-foreground"
                            )}
                          >
                            {notification.title}
                          </p>
                          {notification.priority === "high" && (
                            <span className="px-1.5 py-0.5 text-[10px] font-medium bg-destructive/20 text-destructive rounded">
                              Urgent
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {notification.description}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(notification.created_at), {
                            addSuffix: true,
                          })}
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!notification.is_read && (
                          <button
                            onClick={() => handleMarkAsRead(notification.id)}
                            disabled={markAsRead.isPending}
                            className="p-2 rounded-lg hover:bg-muted transition-colors"
                          >
                            <Check className="w-4 h-4 text-success" />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(notification.id)}
                          disabled={deleteNotification.isPending}
                          className="p-2 rounded-lg hover:bg-muted transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-destructive" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {filteredNotifications.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
                  <Bell className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">No notifications yet</p>
              </motion.div>
            )}
          </div>
        )}
      </div>
    </MobileLayout>
  );
}
