import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export interface LeadEnrichment {
  id: string;
  lead_id: string;
  company_description: string | null;
  potential_tech_stack: string[] | null;
  business_challenges: string[] | null;
  estimated_budget_range: string | null;
  best_outreach_channel: string | null;
  recommended_tone: string | null;
  pain_points: string[] | null;
  enrichment_reasoning: string | null;
  created_at: string;
  updated_at: string;
}

export function useLeadEnrichment(leadId?: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["lead-enrichment", leadId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_lead_profiles")
        .select("*")
        .eq("lead_id", leadId!)
        .maybeSingle();

      if (error) throw error;
      return data as LeadEnrichment | null;
    },
    enabled: !!user && !!leadId,
  });
}

export function useEnrichLead() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (lead: {
      id: string;
      name: string;
      role?: string | null;
      company?: string | null;
      email?: string | null;
      notes?: string | null;
    }) => {
      const { data, error } = await supabase.functions.invoke("lead-enrich", {
        body: { lead },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["lead-enrichment", variables.id] });
    },
  });
}
