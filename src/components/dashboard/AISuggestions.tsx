import { useState } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";
import { Sparkles, ArrowRight, Flame, Clock, TrendingUp, MessageCircle } from "lucide-react";
import { useLeads } from "@/hooks/useLeads";
import { useNavigate } from "react-router-dom";
import { BulkWhatsAppDialog } from "@/components/leads/BulkWhatsAppDialog";

export function AISuggestions() {
  const { data: leads = [] } = useLeads();
  const navigate = useNavigate();
  const [showBulkWhatsApp, setShowBulkWhatsApp] = useState(false);

  // Generate dynamic suggestions based on real leads
  const hotLeads = leads.filter((l) => l.score === "hot");
  const hotLeadsWithPhone = hotLeads.filter((l) => l.phone && l.phone.trim() !== "");
  const staleLeads = leads.filter((l) => {
    if (!l.updated_at) return false;
    const daysSinceUpdate = Math.floor(
      (Date.now() - new Date(l.updated_at).getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysSinceUpdate >= 3;
  });
  const warmLeads = leads.filter((l) => l.score === "warm");

  const suggestions = [
    ...(hotLeadsWithPhone.length > 0
      ? [
          {
            id: "whatsapp-hot",
            type: "whatsapp" as const,
            title: "WhatsApp hot leads",
            description: `${hotLeadsWithPhone.length} hot leads ready for WhatsApp outreach.`,
            priority: "high" as const,
            icon: MessageCircle,
            action: () => setShowBulkWhatsApp(true),
            actionLabel: "Send Now",
          },
        ]
      : []),
    ...(hotLeads.length > 0
      ? [
          {
            id: "hot",
            type: "contact" as const,
            title: "Hot leads ready",
            description: `${hotLeads.length} hot leads with high scores. Consider reaching out today.`,
            priority: "high" as const,
            icon: Flame,
            action: () => navigate("/leads"),
          },
        ]
      : []),
    ...(staleLeads.length > 0
      ? [
          {
            id: "stale",
            type: "follow-up" as const,
            title: "Follow-up needed",
            description: `${staleLeads.length} leads haven't been contacted in 3+ days.`,
            priority: "medium" as const,
            icon: Clock,
            action: () => navigate("/leads"),
          },
        ]
      : []),
    ...(warmLeads.length > 0
      ? [
          {
            id: "warm",
            type: "opportunity" as const,
            title: "Nurture opportunities",
            description: `${warmLeads.length} warm leads could be converted with the right approach.`,
            priority: "medium" as const,
            icon: TrendingUp,
            action: () => navigate("/leads"),
          },
        ]
      : []),
  ].slice(0, 3);

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <>
      <div className="space-y-3">
        <div className="flex items-center gap-2 px-1">
          <div className="w-6 h-6 rounded-lg bg-primary/20 flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
          </div>
          <h2 className="font-display font-semibold">AI Suggestions</h2>
        </div>

        <div className="space-y-3">
          {suggestions.map((suggestion, index) => {
            const Icon = suggestion.icon;

            return (
              <motion.div
                key={suggestion.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <GlassCard
                  variant="interactive"
                  padding="sm"
                  className="flex items-center gap-3 sm:gap-4"
                  onClick={suggestion.action}
                >
                  <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    suggestion.type === "whatsapp" ? "bg-green-500/20" : "bg-primary/10"
                  }`}>
                    <Icon className={`w-4 h-4 sm:w-5 sm:h-5 ${
                      suggestion.type === "whatsapp" ? "text-green-500" : "text-primary"
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-medium text-sm">{suggestion.title}</p>
                      {suggestion.priority === "high" && (
                        <span className="px-1.5 py-0.5 text-[10px] font-medium bg-destructive/20 text-destructive rounded">
                          Urgent
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {suggestion.description}
                    </p>
                  </div>
                  {suggestion.actionLabel ? (
                    <span className="text-xs font-medium text-green-500 flex-shrink-0">
                      {suggestion.actionLabel}
                    </span>
                  ) : (
                    <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                  )}
                </GlassCard>
              </motion.div>
            );
          })}
        </div>
      </div>

      <BulkWhatsAppDialog
        open={showBulkWhatsApp}
        onOpenChange={setShowBulkWhatsApp}
        preSelectedLeads={hotLeadsWithPhone}
        filterType="hot"
      />
    </>
  );
}
