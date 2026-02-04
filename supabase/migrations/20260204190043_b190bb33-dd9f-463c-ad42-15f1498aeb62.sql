-- Create email tracking events table for granular tracking
CREATE TABLE public.email_tracking_events (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  message_log_id UUID NOT NULL REFERENCES public.message_logs(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('open', 'click')),
  url TEXT, -- Only for click events
  user_agent TEXT,
  ip_address TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add tracking columns to message_logs
ALTER TABLE public.message_logs 
ADD COLUMN IF NOT EXISTS opens_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS clicks_count INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS first_opened_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS tracking_id UUID DEFAULT gen_random_uuid();

-- Create index for faster lookups
CREATE INDEX idx_email_tracking_events_message_log_id ON public.email_tracking_events(message_log_id);
CREATE INDEX idx_message_logs_tracking_id ON public.message_logs(tracking_id);

-- Enable RLS on tracking events
ALTER TABLE public.email_tracking_events ENABLE ROW LEVEL SECURITY;

-- Allow public insert for tracking (pixels/links are public)
CREATE POLICY "Allow public insert for tracking events"
ON public.email_tracking_events
FOR INSERT
WITH CHECK (true);

-- Users can view their own tracking events via message_logs
CREATE POLICY "Users can view tracking events for their messages"
ON public.email_tracking_events
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.message_logs ml
    WHERE ml.id = email_tracking_events.message_log_id
    AND ml.user_id = auth.uid()
  )
);