import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import type { Lead } from "./useLeads";

export interface CampaignTemplate {
  step: number;
  subject: string;
  body: string;
  delay_days: number;
}

export interface CampaignDraft {
  name: string;
  type: string;
  channel: string;
  goal: string;
  tone: string;
  selectedLeads: Lead[];
  templates: CampaignTemplate[];
}

const initialDraft: CampaignDraft = {
  name: "",
  type: "outreach",
  channel: "email",
  goal: "Schedule a demo call",
  tone: "professional",
  selectedLeads: [],
  templates: [],
};

export function useCampaignBuilder() {
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState<CampaignDraft>(initialDraft);
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const updateDraft = (updates: Partial<CampaignDraft>) => {
    setDraft((prev) => ({ ...prev, ...updates }));
  };

  const nextStep = () => setStep((s) => Math.min(s + 1, 4));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));
  const goToStep = (s: number) => setStep(s);

  const generateSequence = useMutation({
    mutationFn: async (numberOfSteps: number) => {
      const response = await supabase.functions.invoke("campaign-ai", {
        body: {
          campaignName: draft.name,
          campaignType: draft.type,
          channel: draft.channel,
          leads: draft.selectedLeads.map((l) => ({
            name: l.name,
            role: l.role,
            company: l.company,
            score: l.score,
          })),
          numberOfSteps,
          tone: draft.tone,
          goal: draft.goal,
        },
      });

      if (response.error) throw response.error;
      if (response.data.error) throw new Error(response.data.error);

      return response.data.sequence as CampaignTemplate[];
    },
    onSuccess: (templates) => {
      updateDraft({ templates });
    },
  });

  const saveCampaign = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("User not authenticated");

      // Create campaign
      const { data: campaign, error: campaignError } = await supabase
        .from("campaigns")
        .insert({
          user_id: user.id,
          name: draft.name,
          type: draft.type,
          status: "draft",
          steps: draft.templates.length,
          leads_count: draft.selectedLeads.length,
        })
        .select()
        .single();

      if (campaignError) throw campaignError;

      // Create templates
      if (draft.templates.length > 0) {
        const templatesData = draft.templates.map((t) => ({
          campaign_id: campaign.id,
          step_number: t.step,
          subject: t.subject,
          body: t.body,
          delay_days: t.delay_days,
          channel: draft.channel,
          is_ai_generated: true,
        }));

        const { error: templatesError } = await supabase
          .from("campaign_templates")
          .insert(templatesData);

        if (templatesError) throw templatesError;
      }

      // Add leads to campaign
      if (draft.selectedLeads.length > 0) {
        const leadsData = draft.selectedLeads.map((l) => ({
          campaign_id: campaign.id,
          lead_id: l.id,
          status: "pending",
        }));

        const { error: leadsError } = await supabase
          .from("campaign_leads")
          .insert(leadsData);

        if (leadsError) throw leadsError;
      }

      return campaign;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      resetBuilder();
    },
  });

  const publishCampaign = useMutation({
    mutationFn: async () => {
      const campaign = await saveCampaign.mutateAsync();
      
      // Update status to active
      const { error } = await supabase
        .from("campaigns")
        .update({ status: "active" })
        .eq("id", campaign.id);

      if (error) throw error;
      return campaign;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
    },
  });

  const resetBuilder = () => {
    setStep(1);
    setDraft(initialDraft);
  };

  return {
    step,
    draft,
    updateDraft,
    nextStep,
    prevStep,
    goToStep,
    generateSequence,
    saveCampaign,
    publishCampaign,
    resetBuilder,
  };
}
