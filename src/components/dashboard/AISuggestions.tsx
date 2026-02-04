import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";
import { Sparkles, ArrowRight, User, Flame, Clock, TrendingUp } from "lucide-react";
import { useLeads } from "@/hooks/useLeads";
import { useNavigate } from "react-router-dom";

export function AISuggestions() {
  const { data: leads = [] } = useLeads();
  const navigate = useNavigate();

  // Generate dynamic suggestions based on real leads
  const hotLeads = leads.filter((l) => l.score === "hot" && !l.is_starred);
  const staleLeads = leads.filter((l) => {
    if (!l.updated_at) return false;
    const daysSinceUpdate = Math.floor(
      (Date.now() - new Date(l.updated_at).getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysSinceUpdate >= 3;
  });
  const warmLeads = leads.filter((l) => l.score === "warm");

  const suggestions = [
    ...(hotLeads.length > 0
      ? [
          {
            id: "hot",
            type: "contact" as const,
            title: "Hot lead ready",
            description: `${hotLeads[0].name} has a high score of ${hotLeads[0].score_value}. Consider reaching out today.`,
            leadName: hotLeads[0].name,
            priority: "high" as const,
            icon: Flame,
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
          },
        ]
      : []),
  ].slice(0, 3);

  if (suggestions.length === 0) {
    return null;
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 px-1">
        <div className="w-6 h-6 rounded-lg bg-primary/20 flex items-center justify-center">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
        </div>
        <h2 className="font-display font-semibold">AI Suggestions</h2>
      </div>

      <div className="space-y-3">
        {suggestions.map((suggestion, index) => {
          const Icon = suggestion.icon || User;

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
                className="flex items-center gap-4"
                onClick={() => navigate("/leads")}
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-primary" />
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
                <ArrowRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
              </GlassCard>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
