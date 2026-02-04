import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";
import { Sparkles, ArrowRight, User } from "lucide-react";

interface Suggestion {
  id: string;
  type: "contact" | "follow-up" | "opportunity";
  title: string;
  description: string;
  leadName?: string;
  priority: "high" | "medium" | "low";
}

const suggestions: Suggestion[] = [
  {
    id: "1",
    type: "contact",
    title: "Contact today",
    description: "Sarah Chen has opened your proposal 3 times in the last hour",
    leadName: "Sarah Chen",
    priority: "high",
  },
  {
    id: "2",
    type: "follow-up",
    title: "Follow-up reminder",
    description: "It's been 3 days since your last message to Marcus",
    leadName: "Marcus Johnson",
    priority: "medium",
  },
  {
    id: "3",
    type: "opportunity",
    title: "New opportunity",
    description: "5 new leads from TechCorp match your ideal customer profile",
    priority: "high",
  },
];

export function AISuggestions() {
  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 px-1">
        <div className="w-6 h-6 rounded-lg bg-primary/20 flex items-center justify-center">
          <Sparkles className="w-3.5 h-3.5 text-primary" />
        </div>
        <h2 className="font-display font-semibold">AI Suggestions</h2>
      </div>

      <div className="space-y-3">
        {suggestions.map((suggestion, index) => (
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
            >
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <User className="w-5 h-5 text-primary" />
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
        ))}
      </div>
    </div>
  );
}
