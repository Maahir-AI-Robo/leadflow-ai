import { useState } from "react";
import { motion } from "framer-motion";
import { Lead } from "./LeadCard";
import { LeadBadge } from "@/components/ui/lead-badge";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { EditLeadDialog } from "./EditLeadDialog";
import { useLeads, type Lead as FullLead } from "@/hooks/useLeads";
import {
  X,
  Building2,
  Mail,
  Phone,
  Linkedin,
  MessageSquare,
  Calendar,
  Sparkles,
  Clock,
  CheckCircle2,
  ArrowRight,
  Pencil,
  RefreshCw,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useGenerateLeadSummary } from "@/hooks/useLeadAI";
import { useUpdateLead } from "@/hooks/useLeads";
import { useToast } from "@/hooks/use-toast";

interface LeadDetailProps {
  lead: Lead;
  onClose: () => void;
}

const timeline = [
  {
    id: 1,
    type: "email",
    title: "Email opened",
    description: "Opened 'Introduction to our platform'",
    time: "2 hours ago",
    completed: true,
  },
  {
    id: 2,
    type: "message",
    title: "LinkedIn message sent",
    description: "Sent connection request",
    time: "1 day ago",
    completed: true,
  },
  {
    id: 3,
    type: "scheduled",
    title: "Follow-up scheduled",
    description: "Send pricing proposal",
    time: "Tomorrow, 10:00 AM",
    completed: false,
  },
];

export function LeadDetail({ lead, onClose }: LeadDetailProps) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const { data: leads = [] } = useLeads();
  const generateSummary = useGenerateLeadSummary();
  const updateLead = useUpdateLead();
  const { toast } = useToast();

  // Get the full lead data from the database
  const fullLead = leads.find((l) => l.id === lead.id);

  const getInitials = (name: string) => {
    return name.split(" ").map((n) => n[0]).join("").toUpperCase();
  };

  const handleRegenerateSummary = async () => {
    if (!fullLead) return;

    try {
      const summary = await generateSummary.mutateAsync({
        name: fullLead.name,
        role: fullLead.role,
        company: fullLead.company,
        email: fullLead.email,
        notes: fullLead.notes,
        score: fullLead.score,
        score_value: fullLead.score_value,
      });

      await updateLead.mutateAsync({
        id: fullLead.id,
        updates: { ai_summary: summary },
      });

      toast({
        title: "Summary regenerated",
        description: "AI has created a new summary for this lead.",
      });
    } catch (error: any) {
      toast({
        title: "Failed to regenerate",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const isRegenerating = generateSummary.isPending || updateLead.isPending;

  return (
    <motion.div
      className="fixed inset-0 z-50 bg-background"
      initial={{ opacity: 0, y: "100%" }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: "100%" }}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
    >
      {/* Header */}
      <div className="sticky top-0 z-10 glass-card border-b border-border/50 safe-top">
        <div className="flex items-center justify-between p-4">
          <h2 className="font-display font-semibold text-lg">Lead Details</h2>
          <div className="flex items-center gap-2">
            {fullLead && (
              <button
                onClick={() => setShowEditDialog(true)}
                className="p-2 rounded-xl hover:bg-secondary transition-colors"
              >
                <Pencil className="w-5 h-5 text-primary" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-secondary transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Edit Dialog */}
      {fullLead && (
        <EditLeadDialog
          lead={fullLead}
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
        />
      )}

      {/* Content */}
      <div className="p-4 space-y-6 pb-8 overflow-y-auto h-[calc(100vh-80px)]">
        {/* Profile Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col items-center text-center"
        >
          <div className="relative mb-4">
            {lead.avatar ? (
              <img
                src={lead.avatar}
                alt={lead.name}
                className="w-24 h-24 rounded-3xl object-cover ring-4 ring-border/50"
              />
            ) : (
              <div className="w-24 h-24 rounded-3xl bg-secondary flex items-center justify-center ring-4 ring-border/50">
                <span className="text-3xl font-semibold text-foreground">
                  {getInitials(lead.name)}
                </span>
              </div>
            )}
            <div
              className={cn(
                "absolute -bottom-2 -right-2 w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold shadow-lg",
                lead.score === "hot" &&
                  "bg-gradient-to-br from-red-500 to-orange-500 text-white",
                lead.score === "warm" &&
                  "bg-gradient-to-br from-amber-500 to-yellow-400 text-black",
                lead.score === "cold" &&
                  "bg-gradient-to-br from-blue-500 to-cyan-400 text-white"
              )}
            >
              {lead.scoreValue}
            </div>
          </div>

          <h1 className="font-display text-2xl font-bold mb-1">{lead.name}</h1>
          <p className="text-muted-foreground mb-2">{lead.role}</p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Building2 className="w-4 h-4" />
            <span>{lead.company}</span>
          </div>
          <div className="mt-3">
            <LeadBadge score={lead.score} size="lg" />
          </div>
        </motion.div>

        {/* AI Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <GlassCard variant="glow" padding="md">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-primary" />
                </div>
                <h3 className="font-semibold">AI Summary</h3>
              </div>
              <button
                onClick={handleRegenerateSummary}
                disabled={isRegenerating || !fullLead}
                className="p-2 rounded-lg hover:bg-secondary transition-colors disabled:opacity-50"
                title="Regenerate AI Summary"
              >
                {isRegenerating ? (
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                ) : (
                  <RefreshCw className="w-4 h-4 text-primary" />
                )}
              </button>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {(fullLead?.ai_summary || lead.aiSummary) ||
                "No AI summary yet. Click the refresh button to generate one."}
            </p>
          </GlassCard>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-4 gap-3"
        >
          {[
            { icon: Mail, label: "Email" },
            { icon: Phone, label: "Call" },
            { icon: Linkedin, label: "LinkedIn" },
            { icon: MessageSquare, label: "WhatsApp" },
          ].map(({ icon: Icon, label }) => (
            <button
              key={label}
              className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-secondary hover:bg-secondary/80 transition-colors"
            >
              <Icon className="w-5 h-5 text-primary" />
              <span className="text-xs font-medium text-muted-foreground">
                {label}
              </span>
            </button>
          ))}
        </motion.div>

        {/* Activity Timeline */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h3 className="font-semibold mb-4">Activity Timeline</h3>
          <div className="space-y-4">
            {timeline.map((item, index) => (
              <div key={item.id} className="relative flex gap-4">
                {/* Timeline line */}
                {index < timeline.length - 1 && (
                  <div className="absolute left-[15px] top-10 bottom-0 w-px bg-border" />
                )}

                {/* Icon */}
                <div
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0",
                    item.completed
                      ? "bg-success/20"
                      : "bg-secondary"
                  )}
                >
                  {item.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-success" />
                  ) : (
                    <Clock className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 pb-4">
                  <p className="font-medium text-sm">{item.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {item.description}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {item.time}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Button
            className="w-full h-14 rounded-2xl bg-gradient-to-r from-primary to-cyan-400 text-primary-foreground font-semibold text-base shadow-glow hover:shadow-glow-sm transition-all"
            size="lg"
          >
            <Calendar className="w-5 h-5 mr-2" />
            Schedule Follow-up
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}
