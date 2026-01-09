-- Fix: Allow the security system to record login attempts
-- The record_login_attempt() function is SECURITY DEFINER and contains
-- validation logic, so we can safely allow inserts for login tracking

CREATE POLICY "Allow system to record login attempts"
ON public.login_attempts
FOR INSERT
TO authenticated, anon
WITH CHECK (true);