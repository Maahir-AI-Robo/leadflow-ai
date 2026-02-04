import { useState } from "react";
import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";
import { Sparkles, ArrowRight, Flame, Clock, TrendingUp, MessageCircle, Mail } from "lucide-react";
import { useLeads } from "@/hooks/useLeads";
import { useNavigate } from "react-router-dom";
import { BulkWhatsAppDialog } from "@/components/leads/BulkWhatsAppDialog";
import { BulkEmailDialog } from "@/components/leads/BulkEmailDialog";

export function AISuggestions() {
  const { data: leads = [] } = useLeads();
  const navigate = useNavigate();
  const [showBulkWhatsApp, setShowBulkWhatsApp] = useState(false);
  const [showBulkEmail, setShowBulkEmail] = useState(false);

  // Generate dynamic suggestions based on real leads
  const hotLeads = leads.filter((l) => l.score === "hot");
  const hotLeadsWithPhone = hotLeads.filter((l) => l.phone && l.phone.trim() !== "");
  const hotLeadsWithEmail = hotLeads.filter((l) => l.email && l.email.trim() !== "");
  const staleLeads = leads.filter((l) => {
    if (!l.updated_at) return false;
    const daysSinceUpdate = Math.floor(
      (Date.now() - new Date(l.updated_at).getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysSinceUpdate >= 3;
  });
  const warmLeads = leads.filter((l) => l.score === "warm");

  const suggestions = [
    ...(hotLeadsWithEmail.length > 0
      ? [
          {
            id: "email-hot",
            type: "email" as const,
            title: "Email hot leads",
            description: `${hotLeadsWithEmail.length} hot leads ready for email outreach.`,
            priority: "high" as const,
            icon: Mail,
            action: () => setShowBulkEmail(true),
            actionLabel: "Send Now",
          },
        ]
      : []),
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

  const getIconStyle = (type: string) => {
    if (type === "whatsapp") return "bg-success/20";
    if (type === "email") return "bg-primary/20";
    return "bg-primary/10";
  };

  const getIconColor = (type: string) => {
    if (type === "whatsapp") return "text-success";
    if (type === "email") return "text-primary";
    return "text-primary";
  };

  return (
    <>
      <div className="space-y-4">
        <div className="flex items-center gap-2.5 px-1">
          <motion.div 
            className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary/20 to-cyan-500/20 flex items-center justify-center border border-primary/20"
            whileHover={{ scale: 1.1, rotate: 5 }}
          >
            <Sparkles className="w-4 h-4 text-primary" />
          </motion.div>
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
                  className="flex items-center gap-4 touch-target"
                  onClick={suggestion.action}
                >
                  <motion.div 
                    className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${getIconStyle(suggestion.type)}`}
                    whileHover={{ scale: 1.1 }}
                  >
                    <Icon className={`w-5 h-5 ${getIconColor(suggestion.type)}`} />
                  </motion.div>
                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm">{suggestion.title}</p>
                      {suggestion.priority === "high" && (
                        <span className="px-2 py-0.5 text-[10px] font-semibold bg-destructive/20 text-destructive rounded-full">
                          Urgent
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {suggestion.description}
                    </p>
                  </div>
                  {suggestion.actionLabel ? (
                    <motion.span 
                      className="text-xs font-semibold text-primary flex-shrink-0 px-3 py-1.5 rounded-full bg-primary/10"
                      whileHover={{ scale: 1.05 }}
                    >
                      {suggestion.actionLabel}
                    </motion.span>
                  ) : (
                    <motion.div whileHover={{ x: 4 }}>
                      <ArrowRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                    </motion.div>
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
      
      <BulkEmailDialog
        open={showBulkEmail}
        onOpenChange={setShowBulkEmail}
        preSelectedLeads={hotLeadsWithEmail}
        filterType="hot"
      />
    </>
  );
}
