-- Create campaign_templates table for storing message sequences
CREATE TABLE public.campaign_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL DEFAULT 1,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  delay_days INTEGER NOT NULL DEFAULT 0,
  channel TEXT NOT NULL DEFAULT 'email',
  is_ai_generated BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(campaign_id, step_number)
);

-- Create campaign_leads junction table
CREATE TABLE public.campaign_leads (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  lead_id UUID NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending',
  current_step INTEGER NOT NULL DEFAULT 0,
  last_contacted_at TIMESTAMP WITH TIME ZONE,
  next_followup_at TIMESTAMP WITH TIME ZONE,
  responded_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(campaign_id, lead_id)
);

-- Enable RLS
ALTER TABLE public.campaign_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_leads ENABLE ROW LEVEL SECURITY;

-- RLS Policies for campaign_templates (access through campaign ownership)
CREATE POLICY "Users can view templates for their campaigns"
ON public.campaign_templates
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.campaigns
    WHERE campaigns.id = campaign_templates.campaign_id
    AND campaigns.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create templates for their campaigns"
ON public.campaign_templates
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.campaigns
    WHERE campaigns.id = campaign_templates.campaign_id
    AND campaigns.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update templates for their campaigns"
ON public.campaign_templates
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.campaigns
    WHERE campaigns.id = campaign_templates.campaign_id
    AND campaigns.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete templates for their campaigns"
ON public.campaign_templates
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.campaigns
    WHERE campaigns.id = campaign_templates.campaign_id
    AND campaigns.user_id = auth.uid()
  )
);

-- RLS Policies for campaign_leads (access through campaign ownership)
CREATE POLICY "Users can view leads in their campaigns"
ON public.campaign_leads
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.campaigns
    WHERE campaigns.id = campaign_leads.campaign_id
    AND campaigns.user_id = auth.uid()
  )
);

CREATE POLICY "Users can add leads to their campaigns"
ON public.campaign_leads
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.campaigns
    WHERE campaigns.id = campaign_leads.campaign_id
    AND campaigns.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update leads in their campaigns"
ON public.campaign_leads
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.campaigns
    WHERE campaigns.id = campaign_leads.campaign_id
    AND campaigns.user_id = auth.uid()
  )
);

CREATE POLICY "Users can remove leads from their campaigns"
ON public.campaign_leads
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.campaigns
    WHERE campaigns.id = campaign_leads.campaign_id
    AND campaigns.user_id = auth.uid()
  )
);

-- Triggers for updated_at
CREATE TRIGGER update_campaign_templates_updated_at
BEFORE UPDATE ON public.campaign_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_campaign_leads_updated_at
BEFORE UPDATE ON public.campaign_leads
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();