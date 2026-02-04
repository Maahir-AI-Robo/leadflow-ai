import { useState } from "react";
import { MobileLayout } from "@/components/layout/MobileLayout";
import { GlassCard } from "@/components/ui/glass-card";
import { motion } from "framer-motion";
import { Plus, Zap, Users, Mail, MessageSquare, MoreVertical, Play, Pause, Rocket, Linkedin, Trash2, Eye } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCampaigns, useUpdateCampaign, useDeleteCampaign, type Campaign } from "@/hooks/useCampaigns";
import { Skeleton } from "@/components/ui/skeleton";
import { CampaignBuilder } from "@/components/campaigns/CampaignBuilder";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

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
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const { data: campaigns = [], isLoading } = useCampaigns();
  const updateCampaign = useUpdateCampaign();
  const deleteCampaign = useDeleteCampaign();

  const handleToggleStatus = (campaign: Campaign) => {
    const newStatus = campaign.status === "active" ? "paused" : "active";
    updateCampaign.mutate({ id: campaign.id, updates: { status: newStatus } });
  };

  const handleDeleteCampaign = (campaign: Campaign) => {
    deleteCampaign.mutate(campaign.id, {
      onSuccess: () => {
        toast.success("Campaign deleted");
      },
    });
  };

  const activeCampaigns = campaigns.filter((c) => c.status === "active");
  const totalLeads = campaigns.reduce((sum, c) => sum + c.leads_count, 0);
  const avgResponse = campaigns.length > 0
    ? Math.round(campaigns.reduce((sum, c) => sum + (c.response_rate || 0), 0) / campaigns.length)
    : 0;

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
            <h1 className="font-display text-2xl sm:text-3xl font-bold">Campaigns</h1>
            <p className="text-sm text-muted-foreground">
              {activeCampaigns.length} active
            </p>
          </div>
          <button 
            onClick={() => setShowBuilder(true)}
            className="p-2.5 sm:p-3 rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-opacity shadow-glow-sm"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </motion.div>

        <CampaignBuilder open={showBuilder} onOpenChange={setShowBuilder} />

        {/* Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-2 sm:gap-3"
        >
          {[
            { label: "Total Leads", value: totalLeads.toLocaleString() },
            { label: "Avg Response", value: `${avgResponse}%` },
            { label: "Campaigns", value: campaigns.length.toString() },
          ].map((stat) => (
            <div
              key={stat.label}
              className="p-3 sm:p-4 rounded-2xl bg-secondary text-center"
            >
              <p className="text-lg sm:text-xl font-display font-bold">{stat.value}</p>
              <p className="text-[10px] sm:text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </motion.div>

        {/* Campaign Cards - Grid on larger screens */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-48 rounded-2xl" />
            ))}
          </div>
        ) : campaigns.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12 max-w-md mx-auto"
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
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {campaigns.map((campaign, index) => {
              const TypeIcon = typeIcons[campaign.type] || Zap;
              const progress = (campaign.current_step / campaign.steps) * 100;

              return (
                <motion.div
                  key={campaign.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.03 }}
                >
                  <GlassCard variant="interactive" padding="md">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center",
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
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="p-2 rounded-lg hover:bg-muted transition-colors">
                            <MoreVertical className="w-4 h-4 text-muted-foreground" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="bg-popover">
                          <DropdownMenuItem onClick={() => setSelectedCampaign(campaign)}>
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteCampaign(campaign)}
                            className="text-destructive focus:text-destructive"
                          >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
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
                        <button 
                          onClick={() => setSelectedCampaign(campaign)}
                          className="flex-1 py-2.5 rounded-xl text-sm font-medium bg-secondary hover:bg-secondary/80 transition-all"
                        >
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

        {/* Campaign Details Dialog */}
        <Dialog open={!!selectedCampaign} onOpenChange={(open) => !open && setSelectedCampaign(null)}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{selectedCampaign?.name}</DialogTitle>
              <DialogDescription>
                Campaign details and statistics
              </DialogDescription>
            </DialogHeader>
            {selectedCampaign && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 rounded-xl bg-secondary text-center">
                    <p className="text-2xl font-bold">{selectedCampaign.leads_count}</p>
                    <p className="text-xs text-muted-foreground">Leads</p>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary text-center">
                    <p className="text-2xl font-bold">{selectedCampaign.response_rate || 0}%</p>
                    <p className="text-xs text-muted-foreground">Response Rate</p>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary text-center">
                    <p className="text-2xl font-bold">{selectedCampaign.steps}</p>
                    <p className="text-xs text-muted-foreground">Total Steps</p>
                  </div>
                  <div className="p-3 rounded-xl bg-secondary text-center">
                    <p className="text-2xl font-bold capitalize">{selectedCampaign.type}</p>
                    <p className="text-xs text-muted-foreground">Channel</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Status</span>
                    <span className={cn(
                      "font-medium capitalize",
                      selectedCampaign.status === "active" ? "text-success" : 
                      selectedCampaign.status === "paused" ? "text-warning" : "text-muted-foreground"
                    )}>
                      {selectedCampaign.status}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">
                      Step {selectedCampaign.current_step} of {selectedCampaign.steps}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Created</span>
                    <span className="font-medium">
                      {new Date(selectedCampaign.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => setSelectedCampaign(null)}
                  >
                    Close
                  </Button>
                  <Button
                    onClick={() => {
                      handleToggleStatus(selectedCampaign);
                      setSelectedCampaign(null);
                    }}
                    className={cn(
                      "flex-1",
                      selectedCampaign.status === "active" 
                        ? "bg-warning hover:bg-warning/90 text-warning-foreground" 
                        : "bg-success hover:bg-success/90 text-success-foreground"
                    )}
                  >
                    {selectedCampaign.status === "active" ? "Pause" : "Resume"}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </MobileLayout>
  );
}
