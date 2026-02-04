import { motion } from "framer-motion";
import { Mail, Eye, MessageSquare, MousePointer, Activity } from "lucide-react";
import { cn } from "@/lib/utils";
import { useActivities } from "@/hooks/useActivities";
import { formatDistanceToNow } from "date-fns";
import { useNavigate } from "react-router-dom";

const activityIcons = {
  email_open: Mail,
  link_click: MousePointer,
  reply: MessageSquare,
  view: Eye,
  call: Activity,
  meeting: Activity,
  note: MessageSquare,
};

const activityColors = {
  email_open: "bg-blue-500/20 text-blue-400",
  link_click: "bg-green-500/20 text-green-400",
  reply: "bg-purple-500/20 text-purple-400",
  view: "bg-amber-500/20 text-amber-400",
  call: "bg-cyan-500/20 text-cyan-400",
  meeting: "bg-pink-500/20 text-pink-400",
  note: "bg-gray-500/20 text-gray-400",
};

export function ActivityFeed() {
  const { data: activities = [], isLoading } = useActivities();
  const navigate = useNavigate();

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="font-display font-semibold">Recent Activity</h2>
        </div>
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-16 rounded-xl bg-secondary/50 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="font-display font-semibold">Recent Activity</h2>
        </div>
        <div className="p-6 rounded-xl bg-secondary/50 text-center">
          <Activity className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">
            No activity yet. Start engaging with your leads!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h2 className="font-display font-semibold">Recent Activity</h2>
        <button 
          onClick={() => navigate("/leads")}
          className="text-xs text-primary font-medium hover:underline"
        >
          View all
        </button>
      </div>

      <div className="space-y-2">
        {activities.map((activity, index) => {
          const Icon = activityIcons[activity.type] || Activity;
          const colorClass = activityColors[activity.type] || "bg-gray-500/20 text-gray-400";

          return (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer"
            >
              <div
                className={cn(
                  "w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0",
                  colorClass
                )}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{activity.title}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {activity.description}
                </p>
              </div>
              <span className="text-[10px] text-muted-foreground flex-shrink-0">
                {formatDistanceToNow(new Date(activity.created_at), {
                  addSuffix: true,
                })}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
