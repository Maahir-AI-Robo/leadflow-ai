import { motion } from "framer-motion";
import { Mail, Eye, MessageSquare, MousePointer } from "lucide-react";
import { cn } from "@/lib/utils";

interface Activity {
  id: string;
  type: "email_open" | "link_click" | "reply" | "view";
  leadName: string;
  description: string;
  time: string;
}

const activities: Activity[] = [
  {
    id: "1",
    type: "email_open",
    leadName: "Sarah Chen",
    description: "Opened 'Q4 Pricing Proposal'",
    time: "2 min ago",
  },
  {
    id: "2",
    type: "link_click",
    leadName: "Marcus Johnson",
    description: "Clicked on 'Book a Demo' link",
    time: "15 min ago",
  },
  {
    id: "3",
    type: "reply",
    leadName: "Emily Davis",
    description: "Replied to your LinkedIn message",
    time: "1 hour ago",
  },
  {
    id: "4",
    type: "view",
    leadName: "Alex Rivera",
    description: "Viewed your profile on LinkedIn",
    time: "2 hours ago",
  },
];

const activityIcons = {
  email_open: Mail,
  link_click: MousePointer,
  reply: MessageSquare,
  view: Eye,
};

const activityColors = {
  email_open: "bg-blue-500/20 text-blue-400",
  link_click: "bg-green-500/20 text-green-400",
  reply: "bg-purple-500/20 text-purple-400",
  view: "bg-amber-500/20 text-amber-400",
};

export function ActivityFeed() {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between px-1">
        <h2 className="font-display font-semibold">Recent Activity</h2>
        <button className="text-xs text-primary font-medium">View all</button>
      </div>

      <div className="space-y-2">
        {activities.map((activity, index) => {
          const Icon = activityIcons[activity.type];
          
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
                  activityColors[activity.type]
                )}
              >
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{activity.leadName}</p>
                <p className="text-xs text-muted-foreground truncate">
                  {activity.description}
                </p>
              </div>
              <span className="text-[10px] text-muted-foreground flex-shrink-0">
                {activity.time}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
