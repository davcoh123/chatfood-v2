-- Secure the login_attempts table
-- Remove any existing policies that might allow public access
DROP POLICY IF EXISTS "Admins can view login attempts" ON public.login_attempts;
DROP POLICY IF EXISTS "Block public access to login attempts" ON public.login_attempts;

-- Ensure RLS is enabled
ALTER TABLE public.login_attempts ENABLE ROW LEVEL SECURITY;

-- Force RLS even for table owners (security best practice)
ALTER TABLE public.login_attempts FORCE ROW LEVEL SECURITY;

-- Create a strict permissive policy: ONLY admins can SELECT
CREATE POLICY "Admins can view login attempts"
ON public.login_attempts
AS PERMISSIVE
FOR SELECT
TO authenticated
USING (is_admin());

-- No policies for INSERT, UPDATE, DELETE = blocked by default
-- INSERT is only possible via the record_login_attempt() SECURITY DEFINER function
-- This prevents any direct manipulation of login attempt records

-- Add comment for documentation
COMMENT ON TABLE public.login_attempts IS 'Contains sensitive login attempt data. Only admins can view. Inserts only via SECURITY DEFINER functions.';