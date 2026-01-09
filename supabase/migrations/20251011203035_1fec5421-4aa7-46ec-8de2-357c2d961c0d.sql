-- Fix login_attempts INSERT policy to prevent direct manipulation
-- Drop the overly permissive insert policy
DROP POLICY IF EXISTS "Allow system to record login attempts" ON public.login_attempts;

-- Create a restrictive policy that denies direct inserts
-- Only the SECURITY DEFINER function record_login_attempt() can insert (bypasses RLS)
CREATE POLICY "Block direct insert access to login attempts"
ON public.login_attempts
FOR INSERT
TO anon, authenticated
WITH CHECK (false);

-- Allow admins to insert if needed for testing/management
CREATE POLICY "Admins can insert login attempts"
ON public.login_attempts
FOR INSERT
TO authenticated
WITH CHECK (is_admin());