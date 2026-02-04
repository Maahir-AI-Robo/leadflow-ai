import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import type { Lead } from "./useLeads";

export interface CampaignTemplate {
  id: string;
  campaign_id: string;
  step_number: number;
  subject: string;
  body: string;
  delay_days: number;
  channel: string;
  is_ai_generated: boolean;
}

export interface CampaignLead {
  id: string;
  campaign_id: string;
  lead_id: string;
  status: string;
  current_step: number;
  lead?: Lead;
}

export interface CampaignDetails {
  id: string;
  user_id: string;
  name: string;
  type: string;
  status: string;
  leads_count: number;
  response_rate: number | null;
  steps: number;
  current_step: number;
  created_at: string;
  updated_at: string;
  templates: CampaignTemplate[];
  campaign_leads: CampaignLead[];
}

export function useCampaignDetails(campaignId: string | null) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["campaign-details", campaignId],
    queryFn: async () => {
      if (!campaignId || !user) return null;

      // Fetch campaign
      const { data: campaign, error: campaignError } = await supabase
        .from("campaigns")
        .select("*")
        .eq("id", campaignId)
        .single();

      if (campaignError) throw campaignError;

      // Fetch templates
      const { data: templates, error: templatesError } = await supabase
        .from("campaign_templates")
        .select("*")
        .eq("campaign_id", campaignId)
        .order("step_number", { ascending: true });

      if (templatesError) throw templatesError;

      // Fetch campaign leads with lead details
      const { data: campaignLeads, error: leadsError } = await supabase
        .from("campaign_leads")
        .select(`
          *,
          lead:leads(*)
        `)
        .eq("campaign_id", campaignId);

      if (leadsError) throw leadsError;

      return {
        ...campaign,
        templates: templates || [],
        campaign_leads: campaignLeads || [],
      } as CampaignDetails;
    },
    enabled: !!campaignId && !!user,
  });
}

export function useUpdateCampaignDetails() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      campaignId,
      name,
      type,
      status,
    }: {
      campaignId: string;
      name: string;
      type: string;
      status: string;
    }) => {
      const { data, error } = await supabase
        .from("campaigns")
        .update({ name, type, status, updated_at: new Date().toISOString() })
        .eq("id", campaignId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["campaign-details", data.id] });
    },
  });
}

export function useUpdateCampaignTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      templateId,
      campaignId,
      subject,
      body,
      delay_days,
    }: {
      templateId: string;
      campaignId: string;
      subject: string;
      body: string;
      delay_days: number;
    }) => {
      const { data, error } = await supabase
        .from("campaign_templates")
        .update({ subject, body, delay_days, updated_at: new Date().toISOString() })
        .eq("id", templateId)
        .select()
        .single();

      if (error) throw error;
      return { data, campaignId };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["campaign-details", result.campaignId] });
    },
  });
}

export function useRemoveLeadFromCampaign() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      campaignLeadId,
      campaignId,
    }: {
      campaignLeadId: string;
      campaignId: string;
    }) => {
      const { error } = await supabase
        .from("campaign_leads")
        .delete()
        .eq("id", campaignLeadId);

      if (error) throw error;

      // Update leads_count
      const { data: remaining } = await supabase
        .from("campaign_leads")
        .select("id", { count: "exact" })
        .eq("campaign_id", campaignId);

      await supabase
        .from("campaigns")
        .update({ leads_count: remaining?.length || 0 })
        .eq("id", campaignId);

      return { campaignId };
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["campaign-details", result.campaignId] });
    },
  });
}
