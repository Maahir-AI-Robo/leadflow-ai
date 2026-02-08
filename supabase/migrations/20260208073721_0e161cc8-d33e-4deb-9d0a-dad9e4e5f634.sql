
-- Add outcome tracking columns to message_logs
ALTER TABLE public.message_logs 
ADD COLUMN IF NOT EXISTS user_confirmed_sent boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS user_confirmed_sent_at timestamptz,
ADD COLUMN IF NOT EXISTS user_confirmed_read boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS user_confirmed_read_at timestamptz,
ADD COLUMN IF NOT EXISTS user_confirmed_responded boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS user_confirmed_responded_at timestamptz,
ADD COLUMN IF NOT EXISTS user_confirmed_ignored boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS user_confirmed_ignored_at timestamptz,
ADD COLUMN IF NOT EXISTS outcome_sentiment text,
ADD COLUMN IF NOT EXISTS ai_follow_up_recommendation text;

-- Create ai_decisions table for tracking AI reasoning
CREATE TABLE IF NOT EXISTS public.ai_decisions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  lead_id uuid REFERENCES public.leads(id) ON DELETE CASCADE,
  campaign_id uuid REFERENCES public.campaigns(id) ON DELETE CASCADE,
  decision_type text NOT NULL, -- 'follow_up', 'channel_switch', 'tone_change', 'pause', 'resume', 'stop'
  reasoning text NOT NULL,
  confidence numeric DEFAULT 0.5,
  input_data jsonb,
  output_data jsonb,
  accepted boolean,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.ai_decisions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own ai_decisions"
ON public.ai_decisions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own ai_decisions"
ON public.ai_decisions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ai_decisions"
ON public.ai_decisions FOR UPDATE USING (auth.uid() = user_id);

-- Create ai_lead_profiles table for enrichment data
CREATE TABLE IF NOT EXISTS public.ai_lead_profiles (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id uuid NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  company_description text,
  potential_tech_stack text[],
  business_challenges text[],
  estimated_budget_range text,
  best_outreach_channel text,
  recommended_tone text,
  pain_points text[],
  enrichment_reasoning text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(lead_id)
);

ALTER TABLE public.ai_lead_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own ai_lead_profiles"
ON public.ai_lead_profiles FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own ai_lead_profiles"
ON public.ai_lead_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ai_lead_profiles"
ON public.ai_lead_profiles FOR UPDATE USING (auth.uid() = user_id);

-- Create analytics_snapshots table for AI-interpreted analytics
CREATE TABLE IF NOT EXISTS public.analytics_snapshots (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  snapshot_type text NOT NULL, -- 'daily', 'weekly', 'campaign'
  period_start timestamptz NOT NULL,
  period_end timestamptz NOT NULL,
  metrics jsonb NOT NULL DEFAULT '{}',
  ai_insights text[],
  ai_recommendations text[],
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.analytics_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own analytics_snapshots"
ON public.analytics_snapshots FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own analytics_snapshots"
ON public.analytics_snapshots FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Add campaign_steps table for adaptive multi-step campaigns
CREATE TABLE IF NOT EXISTS public.campaign_steps (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id uuid NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  step_number integer NOT NULL DEFAULT 1,
  channel text NOT NULL DEFAULT 'email',
  action_type text NOT NULL DEFAULT 'outreach', -- 'outreach', 'follow_up', 'breakup'
  delay_days integer NOT NULL DEFAULT 0,
  message_template text,
  subject_template text,
  fallback_channel text,
  condition_type text DEFAULT 'always', -- 'always', 'no_response', 'responded', 'opened'
  ai_generated boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.campaign_steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage campaign_steps via campaign ownership"
ON public.campaign_steps FOR ALL
USING (
  EXISTS (SELECT 1 FROM public.campaigns c WHERE c.id = campaign_id AND c.user_id = auth.uid())
);

-- Add trigger for ai_lead_profiles updated_at
CREATE TRIGGER update_ai_lead_profiles_updated_at
BEFORE UPDATE ON public.ai_lead_profiles
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_campaign_steps_updated_at
BEFORE UPDATE ON public.campaign_steps
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
