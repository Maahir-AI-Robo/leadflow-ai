-- Create email templates library table
CREATE TABLE public.email_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  tags TEXT[] DEFAULT '{}',
  is_favorite BOOLEAN DEFAULT false,
  use_count INTEGER DEFAULT 0,
  variables TEXT[] DEFAULT '{}', -- e.g., ['{{name}}', '{{company}}']
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.email_templates ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own email templates"
ON public.email_templates FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own email templates"
ON public.email_templates FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own email templates"
ON public.email_templates FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own email templates"
ON public.email_templates FOR DELETE
USING (auth.uid() = user_id);

-- Add updated_at trigger
CREATE TRIGGER update_email_templates_updated_at
BEFORE UPDATE ON public.email_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create index for faster lookups
CREATE INDEX idx_email_templates_user_id ON public.email_templates(user_id);
CREATE INDEX idx_email_templates_category ON public.email_templates(category);