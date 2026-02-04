import { MobileLayout } from "@/components/layout/MobileLayout";
import { StatCard } from "@/components/ui/stat-card";
import { AISuggestions } from "@/components/dashboard/AISuggestions";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { motion } from "framer-motion";
import { Users, Flame, TrendingUp, Zap, Bell } from "lucide-react";

export default function Index() {
  return (
    <MobileLayout>
      <div className="px-4 pt-6 space-y-6 safe-top">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <p className="text-sm text-muted-foreground">Welcome back</p>
            <h1 className="font-display text-2xl font-bold gradient-text">
              Alex Johnson
            </h1>
          </div>
          <button className="relative p-3 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors">
            <Bell className="w-5 h-5" />
            <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full animate-pulse-glow" />
          </button>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <StatCard
            title="Total Leads"
            value="2,847"
            subtitle="All time"
            icon={Users}
            trend={{ value: 12, positive: true }}
            variant="primary"
            delay={0.1}
          />
          <StatCard
            title="Hot Leads"
            value="48"
            subtitle="Ready to close"
            icon={Flame}
            variant="hot"
            delay={0.15}
          />
          <StatCard
            title="Warm Leads"
            value="156"
            subtitle="In progress"
            icon={TrendingUp}
            variant="warm"
            delay={0.2}
          />
          <StatCard
            title="Active Campaigns"
            value="12"
            subtitle="Running now"
            icon={Zap}
            delay={0.25}
          />
        </div>

        {/* AI Suggestions */}
        <AISuggestions />

        {/* Activity Feed */}
        <ActivityFeed />
      </div>
    </MobileLayout>
  );
}
