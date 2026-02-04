import { useState } from "react";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { StatCard } from "@/components/ui/stat-card";
import { AISuggestions } from "@/components/dashboard/AISuggestions";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { FollowUpsList } from "@/components/dashboard/FollowUpsList";
import { ScheduleFollowUpDialog } from "@/components/leads/ScheduleFollowUpDialog";
import { motion } from "framer-motion";
import { Users, Flame, TrendingUp, Zap, Bell, Thermometer, Calendar, Plus } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useFollowUps } from "@/hooks/useFollowUps";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
export default function Index() {
  const { user } = useAuth();
  const { data: stats, isLoading } = useDashboardStats();
  const { upcomingFollowUps, overdueFollowUps } = useFollowUps();
  const navigate = useNavigate();
  const [showScheduleDialog, setShowScheduleDialog] = useState(false);

  const firstName = user?.user_metadata?.full_name?.split(" ")[0] || "there";
  const pendingFollowUpsCount = upcomingFollowUps.length + overdueFollowUps.length;

  return (
    <MobileLayout>
      <div className="px-4 sm:px-6 lg:px-8 lg:pl-72 pt-6 space-y-6 safe-top">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <p className="text-sm text-muted-foreground">Welcome back</p>
            <h1 className="font-display text-2xl sm:text-3xl font-bold gradient-text">
              {firstName}
            </h1>
          </div>
          <button 
            onClick={() => navigate("/notifications")}
            className="relative p-3 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors"
          >
            <Bell className="w-5 h-5" />
            {stats && stats.unreadNotifications > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full animate-pulse-glow" />
            )}
          </button>
        </motion.div>

        {/* Stats Grid - responsive columns */}
        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32 sm:h-36 rounded-2xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
            <StatCard
              title="Total Leads"
              value={stats?.totalLeads || 0}
              subtitle="All time"
              icon={Users}
              variant="primary"
              delay={0.1}
            />
            <StatCard
              title="Hot Leads"
              value={stats?.hotLeads || 0}
              subtitle="Ready to close"
              icon={Flame}
              variant="hot"
              delay={0.15}
            />
            <StatCard
              title="Warm Leads"
              value={stats?.warmLeads || 0}
              subtitle="In progress"
              icon={TrendingUp}
              variant="warm"
              delay={0.2}
            />
            <StatCard
              title="Active Campaigns"
              value={stats?.activeCampaigns || 0}
              subtitle="Running now"
              icon={Zap}
              delay={0.25}
            />
          </div>
        )}

        {/* Empty State for New Users */}
        {!isLoading && stats?.totalLeads === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card rounded-2xl p-6 sm:p-8 border border-primary/30 text-center max-w-lg mx-auto"
          >
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-4">
              <Thermometer className="w-7 h-7 sm:w-8 sm:h-8 text-primary" />
            </div>
            <h3 className="font-display font-semibold text-lg sm:text-xl mb-2">
              Get Started with Your First Lead
            </h3>
            <p className="text-sm sm:text-base text-muted-foreground mb-4">
              Add leads to start tracking and nurturing your prospects with AI-powered insights.
            </p>
            <button
              onClick={() => navigate("/leads")}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-cyan-400 text-primary-foreground font-medium shadow-glow-sm hover:shadow-glow transition-all"
            >
              Add Your First Lead
            </button>
          </motion.div>
        )}

        {/* Three section layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Follow-ups Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="lg:col-span-1"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                <h2 className="font-display font-semibold">Follow-ups</h2>
                {pendingFollowUpsCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-medium">
                    {pendingFollowUpsCount}
                  </span>
                )}
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowScheduleDialog(true)}
                className="h-8 w-8 p-0"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <FollowUpsList maxHeight="350px" />
          </motion.div>

          {/* AI Suggestions */}
          {stats && stats.totalLeads > 0 && (
            <div className="lg:col-span-1">
              <AISuggestions />
            </div>
          )}

          {/* Activity Feed */}
          <div className={stats && stats.totalLeads > 0 ? "lg:col-span-1" : "lg:col-span-2"}>
            <ActivityFeed />
          </div>
        </div>

        {/* Schedule Follow-up Dialog */}
        <ScheduleFollowUpDialog
          open={showScheduleDialog}
          onOpenChange={setShowScheduleDialog}
        />
      </div>
    </MobileLayout>
  );
}
