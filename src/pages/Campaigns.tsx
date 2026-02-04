import { MobileLayout } from "@/components/layout/MobileLayout";
import { GlassCard } from "@/components/ui/glass-card";
import { motion } from "framer-motion";
import { Plus, Zap, Users, Mail, MessageSquare, MoreVertical, Play, Pause } from "lucide-react";
import { cn } from "@/lib/utils";

interface Campaign {
  id: string;
  name: string;
  status: "active" | "paused" | "completed";
  type: "email" | "linkedin" | "multi-channel";
  leadsCount: number;
  responseRate: number;
  steps: number;
  currentStep: number;
}

const campaigns: Campaign[] = [
  {
    id: "1",
    name: "Q4 Enterprise Outreach",
    status: "active",
    type: "multi-channel",
    leadsCount: 245,
    responseRate: 28,
    steps: 5,
    currentStep: 3,
  },
  {
    id: "2",
    name: "Product Launch Campaign",
    status: "active",
    type: "email",
    leadsCount: 512,
    responseRate: 22,
    steps: 4,
    currentStep: 2,
  },
  {
    id: "3",
    name: "LinkedIn Warm Outreach",
    status: "paused",
    type: "linkedin",
    leadsCount: 89,
    responseRate: 35,
    steps: 3,
    currentStep: 1,
  },
  {
    id: "4",
    name: "Re-engagement Series",
    status: "completed",
    type: "email",
    leadsCount: 178,
    responseRate: 15,
    steps: 6,
    currentStep: 6,
  },
];

const typeIcons = {
  email: Mail,
  linkedin: MessageSquare,
  "multi-channel": Zap,
};

export default function Campaigns() {
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
            <h1 className="font-display text-2xl font-bold">Campaigns</h1>
            <p className="text-sm text-muted-foreground">
              {campaigns.filter((c) => c.status === "active").length} active
            </p>
          </div>
          <button className="p-3 rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-opacity shadow-glow-sm">
            <Plus className="w-5 h-5" />
          </button>
        </motion.div>

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-3"
        >
          {[
            { label: "Total Leads", value: "1,024" },
            { label: "Avg Response", value: "25%" },
            { label: "Messages Sent", value: "3.2k" },
          ].map((stat, index) => (
            <div
              key={stat.label}
              className="p-4 rounded-2xl bg-secondary text-center"
            >
              <p className="text-xl font-display font-bold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Campaign Cards */}
        <div className="space-y-4">
          {campaigns.map((campaign, index) => {
            const TypeIcon = typeIcons[campaign.type];
            const progress = (campaign.currentStep / campaign.steps) * 100;

            return (
              <motion.div
                key={campaign.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
              >
                <GlassCard variant="interactive" padding="md">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={cn(
                          "w-10 h-10 rounded-xl flex items-center justify-center",
                          campaign.status === "active"
                            ? "bg-primary/20 text-primary"
                            : campaign.status === "paused"
                            ? "bg-warning/20 text-warning"
                            : "bg-muted text-muted-foreground"
                        )}
                      >
                        <TypeIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-sm">{campaign.name}</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span
                            className={cn(
                              "px-2 py-0.5 text-[10px] font-medium rounded-full",
                              campaign.status === "active"
                                ? "bg-success/20 text-success"
                                : campaign.status === "paused"
                                ? "bg-warning/20 text-warning"
                                : "bg-muted text-muted-foreground"
                            )}
                          >
                            {campaign.status.charAt(0).toUpperCase() +
                              campaign.status.slice(1)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                      <MoreVertical className="w-4 h-4 text-muted-foreground" />
                    </button>
                  </div>

                  {/* Progress */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
                      <span>
                        Step {campaign.currentStep} of {campaign.steps}
                      </span>
                      <span>{Math.round(progress)}% complete</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-primary to-cyan-400 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.5, delay: 0.2 + index * 0.05 }}
                      />
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Users className="w-3.5 h-3.5" />
                      <span>{campaign.leadsCount} leads</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Mail className="w-3.5 h-3.5" />
                      <span>{campaign.responseRate}% response</span>
                    </div>
                  </div>

                  {/* Actions */}
                  {campaign.status !== "completed" && (
                    <div className="flex gap-2 mt-4 pt-4 border-t border-border/50">
                      <button
                        className={cn(
                          "flex-1 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center justify-center gap-2",
                          campaign.status === "active"
                            ? "bg-warning/20 text-warning hover:bg-warning/30"
                            : "bg-success/20 text-success hover:bg-success/30"
                        )}
                      >
                        {campaign.status === "active" ? (
                          <>
                            <Pause className="w-4 h-4" />
                            Pause
                          </>
                        ) : (
                          <>
                            <Play className="w-4 h-4" />
                            Resume
                          </>
                        )}
                      </button>
                      <button className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-secondary hover:bg-secondary/80 transition-all">
                        View Details
                      </button>
                    </div>
                  )}
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      </div>
    </MobileLayout>
  );
}
