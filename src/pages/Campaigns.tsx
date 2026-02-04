import { useState } from "react";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { GlassCard } from "@/components/ui/glass-card";
import { motion } from "framer-motion";
import { Plus, Zap, Users, Mail, MessageSquare, MoreVertical, Play, Pause, Rocket, Linkedin } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCampaigns, useUpdateCampaign, type Campaign } from "@/hooks/useCampaigns";
import { Skeleton } from "@/components/ui/skeleton";
import { CampaignBuilder } from "@/components/campaigns/CampaignBuilder";

const typeIcons = {
  email: Mail,
  linkedin: Linkedin,
  whatsapp: MessageSquare,
  outreach: Zap,
  followup: Mail,
  nurture: MessageSquare,
  reengagement: Zap,
  "multi-channel": Zap,
};

export default function Campaigns() {
  const [showBuilder, setShowBuilder] = useState(false);
  const { data: campaigns = [], isLoading } = useCampaigns();
  const updateCampaign = useUpdateCampaign();

  const handleToggleStatus = (campaign: Campaign) => {
    const newStatus = campaign.status === "active" ? "paused" : "active";
    updateCampaign.mutate({ id: campaign.id, updates: { status: newStatus } });
  };

  const activeCampaigns = campaigns.filter((c) => c.status === "active");
  const totalLeads = campaigns.reduce((sum, c) => sum + c.leads_count, 0);
  const avgResponse = campaigns.length > 0
    ? Math.round(campaigns.reduce((sum, c) => sum + (c.response_rate || 0), 0) / campaigns.length)
    : 0;

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
              {activeCampaigns.length} active
            </p>
          </div>
          <button 
            onClick={() => setShowBuilder(true)}
            className="p-3 rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-opacity shadow-glow-sm"
          >
            <Plus className="w-5 h-5" />
          </button>
        </motion.div>

        <CampaignBuilder open={showBuilder} onOpenChange={setShowBuilder} />

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-3"
        >
          {[
            { label: "Total Leads", value: totalLeads.toLocaleString() },
            { label: "Avg Response", value: `${avgResponse}%` },
            { label: "Campaigns", value: campaigns.length.toString() },
          ].map((stat) => (
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
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48 rounded-2xl" />
            ))}
          </div>
        ) : campaigns.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className="w-16 h-16 rounded-2xl bg-secondary flex items-center justify-center mx-auto mb-4">
              <Rocket className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold text-lg mb-2">No campaigns yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first campaign to start reaching leads
            </p>
            <button 
              onClick={() => setShowBuilder(true)}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-cyan-400 text-primary-foreground font-medium shadow-glow-sm"
            >
              Create Campaign
            </button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {campaigns.map((campaign, index) => {
              const TypeIcon = typeIcons[campaign.type] || Zap;
              const progress = (campaign.current_step / campaign.steps) * 100;

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
                          Step {campaign.current_step} of {campaign.steps}
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
                        <span>{campaign.leads_count} leads</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Mail className="w-3.5 h-3.5" />
                        <span>{campaign.response_rate || 0}% response</span>
                      </div>
                    </div>

                    {/* Actions */}
                    {campaign.status !== "completed" && (
                      <div className="flex gap-2 mt-4 pt-4 border-t border-border/50">
                        <button
                          onClick={() => handleToggleStatus(campaign)}
                          disabled={updateCampaign.isPending}
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
        )}
      </div>
    </MobileLayout>
  );
}
