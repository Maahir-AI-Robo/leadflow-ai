import { motion } from "framer-motion";
import { GlassCard } from "@/components/ui/glass-card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  Building2,
  Cpu,
  AlertTriangle,
  DollarSign,
  MessageSquare,
  Volume2,
  Target,
  Loader2,
  RefreshCw,
  Info,
} from "lucide-react";
import { useLeadEnrichment, useEnrichLead, type LeadEnrichment } from "@/hooks/useLeadEnrichment";
import { toast } from "sonner";

interface LeadEnrichmentCardProps {
  lead: {
    id: string;
    name: string;
    role?: string | null;
    company?: string | null;
    email?: string | null;
    notes?: string | null;
  };
}

export function LeadEnrichmentCard({ lead }: LeadEnrichmentCardProps) {
  const { data: enrichment, isLoading } = useLeadEnrichment(lead.id);
  const enrichLead = useEnrichLead();

  const handleEnrich = async () => {
    try {
      await enrichLead.mutateAsync(lead);
      toast.success("Lead enriched with AI insights");
    } catch (err: any) {
      toast.error(err.message || "Enrichment failed");
    }
  };

  if (isLoading) return null;

  if (!enrichment) {
    return (
      <GlassCard padding="md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            <h3 className="font-semibold text-sm">AI Enrichment</h3>
          </div>
          <Button
            size="sm"
            onClick={handleEnrich}
            disabled={enrichLead.isPending}
            className="text-xs"
          >
            {enrichLead.isPending ? (
              <Loader2 className="w-3 h-3 animate-spin mr-1" />
            ) : (
              <Brain className="w-3 h-3 mr-1" />
            )}
            Enrich with AI
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          AI will analyze this lead and generate company insights, tech stack, challenges, and outreach recommendations.
        </p>
      </GlassCard>
    );
  }

  return (
    <GlassCard padding="md">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />
          <h3 className="font-semibold text-sm">AI Enrichment</h3>
        </div>
        <button
          onClick={handleEnrich}
          disabled={enrichLead.isPending}
          className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
        >
          {enrichLead.isPending ? (
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
          ) : (
            <RefreshCw className="w-4 h-4 text-muted-foreground" />
          )}
        </button>
      </div>

      <div className="space-y-3">
        {enrichment.company_description && (
          <div className="flex gap-2">
            <Building2 className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground">{enrichment.company_description}</p>
          </div>
        )}

        {enrichment.potential_tech_stack && enrichment.potential_tech_stack.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <Cpu className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs font-medium">Tech Stack</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {enrichment.potential_tech_stack.map((tech) => (
                <Badge key={tech} variant="secondary" className="text-[10px]">
                  {tech}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {enrichment.business_challenges && enrichment.business_challenges.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <AlertTriangle className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs font-medium">Challenges</span>
            </div>
            <ul className="text-xs text-muted-foreground space-y-0.5">
              {enrichment.business_challenges.map((c, i) => (
                <li key={i}>• {c}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="grid grid-cols-3 gap-2">
          {enrichment.estimated_budget_range && (
            <div className="p-2 rounded-lg bg-secondary/50 text-center">
              <DollarSign className="w-3.5 h-3.5 mx-auto mb-0.5 text-green-500" />
              <p className="text-[10px] font-medium">{enrichment.estimated_budget_range}</p>
            </div>
          )}
          {enrichment.best_outreach_channel && (
            <div className="p-2 rounded-lg bg-secondary/50 text-center">
              <MessageSquare className="w-3.5 h-3.5 mx-auto mb-0.5 text-primary" />
              <p className="text-[10px] font-medium capitalize">{enrichment.best_outreach_channel}</p>
            </div>
          )}
          {enrichment.recommended_tone && (
            <div className="p-2 rounded-lg bg-secondary/50 text-center">
              <Volume2 className="w-3.5 h-3.5 mx-auto mb-0.5 text-cyan-500" />
              <p className="text-[10px] font-medium capitalize">{enrichment.recommended_tone}</p>
            </div>
          )}
        </div>

        {enrichment.pain_points && enrichment.pain_points.length > 0 && (
          <div>
            <div className="flex items-center gap-1.5 mb-1">
              <Target className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="text-xs font-medium">Pain Points</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {enrichment.pain_points.map((p, i) => (
                <Badge key={i} variant="outline" className="text-[10px] text-orange-500 border-orange-500/30">
                  {p}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {enrichment.enrichment_reasoning && (
          <div className="flex gap-2 p-2 rounded-lg bg-primary/5 border border-primary/10">
            <Info className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
            <p className="text-[10px] text-muted-foreground italic">{enrichment.enrichment_reasoning}</p>
          </div>
        )}
      </div>
    </GlassCard>
  );
}
