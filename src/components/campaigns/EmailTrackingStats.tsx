import { motion } from "framer-motion";
import { Mail, Eye, MousePointerClick, TrendingUp, Users, BarChart3 } from "lucide-react";
import { useCampaignTrackingStats } from "@/hooks/useEmailTracking";
import { Skeleton } from "@/components/ui/skeleton";

interface EmailTrackingStatsProps {
  campaignId: string;
}

export function EmailTrackingStats({ campaignId }: EmailTrackingStatsProps) {
  const { data: stats, isLoading } = useCampaignTrackingStats(campaignId);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-24 rounded-xl" />
        ))}
      </div>
    );
  }

  if (!stats) return null;

  const statItems = [
    {
      label: "Sent",
      value: stats.totalSent,
      icon: Mail,
      color: "text-primary",
      bgColor: "bg-primary/10",
    },
    {
      label: "Unique Opens",
      value: stats.uniqueOpens,
      icon: Eye,
      color: "text-success",
      bgColor: "bg-success/10",
    },
    {
      label: "Open Rate",
      value: `${stats.openRate.toFixed(1)}%`,
      icon: TrendingUp,
      color: "text-warning",
      bgColor: "bg-warning/10",
    },
    {
      label: "Unique Clicks",
      value: stats.uniqueClicks,
      icon: MousePointerClick,
      color: "text-accent",
      bgColor: "bg-accent/10",
    },
    {
      label: "Click Rate",
      value: `${stats.clickRate.toFixed(1)}%`,
      icon: BarChart3,
      color: "text-info",
      bgColor: "bg-info/10",
    },
    {
      label: "Click-to-Open",
      value: `${stats.clickToOpenRate.toFixed(1)}%`,
      icon: Users,
      color: "text-secondary-foreground",
      bgColor: "bg-secondary",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {statItems.map((item, index) => (
        <motion.div
          key={item.label}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="glass-card rounded-xl p-4 border border-border/50"
        >
          <div className={`w-8 h-8 rounded-lg ${item.bgColor} flex items-center justify-center mb-2`}>
            <item.icon className={`w-4 h-4 ${item.color}`} />
          </div>
          <p className="text-xl font-bold">{item.value}</p>
          <p className="text-xs text-muted-foreground">{item.label}</p>
        </motion.div>
      ))}
    </div>
  );
}
