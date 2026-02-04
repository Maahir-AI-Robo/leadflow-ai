-- Create follow_ups table for scheduling follow-up tasks
CREATE TABLE public.follow_ups (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  lead_id UUID REFERENCES public.leads(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  scheduled_at TIMESTAMP WITH TIME ZONE NOT NULL,
  reminder_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'cancelled', 'overdue')),
  priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  channel TEXT CHECK (channel IN ('email', 'whatsapp', 'linkedin', 'call', 'meeting', 'other')),
  notes TEXT,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.follow_ups ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own follow-ups" 
ON public.follow_ups FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own follow-ups" 
ON public.follow_ups FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own follow-ups" 
ON public.follow_ups FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own follow-ups" 
ON public.follow_ups FOR DELETE 
USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_follow_ups_user_id ON public.follow_ups(user_id);
CREATE INDEX idx_follow_ups_lead_id ON public.follow_ups(lead_id);
CREATE INDEX idx_follow_ups_scheduled_at ON public.follow_ups(scheduled_at);
CREATE INDEX idx_follow_ups_status ON public.follow_ups(status);

-- Add trigger for updated_at
CREATE TRIGGER update_follow_ups_updated_at
BEFORE UPDATE ON public.follow_ups
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();