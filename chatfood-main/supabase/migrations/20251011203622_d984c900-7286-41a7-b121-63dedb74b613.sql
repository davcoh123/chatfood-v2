-- Remove redundant blocking policy on login_attempts
-- The explicit "Admins can view login attempts" policy already ensures
-- only admins have SELECT access. Blocking policies are redundant.
DROP POLICY IF EXISTS "Block anonymous access to login attempts" ON public.login_attempts;