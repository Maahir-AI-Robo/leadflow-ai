-- Remove the overly permissive public insert policy on email_tracking_events
-- The edge function uses SUPABASE_SERVICE_ROLE_KEY which bypasses RLS,
-- so this policy is not needed for legitimate tracking and only creates a security hole

DROP POLICY IF EXISTS "Allow public insert for tracking events" ON public.email_tracking_events;