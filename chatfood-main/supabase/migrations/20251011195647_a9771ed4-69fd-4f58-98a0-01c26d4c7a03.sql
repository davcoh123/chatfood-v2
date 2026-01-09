-- Security Fix: Block anonymous access to profiles table
-- The profiles table contains PII (email addresses, names) that should never be
-- accessible to unauthenticated users. This policy explicitly denies anonymous access.
CREATE POLICY "Block anonymous access to profiles"
ON public.profiles
FOR SELECT
TO anon
USING (false);

-- Security Fix: Block anonymous access to login_attempts table
-- The login_attempts table contains security-sensitive data (emails, IPs, failed attempts)
-- that attackers could use to identify valid accounts and plan attacks.
CREATE POLICY "Block anonymous access to login attempts"
ON public.login_attempts
FOR SELECT
TO anon
USING (false);