-- Phase 1: Remove conflicting RLS policy on login_attempts
-- This policy blocks all inserts but is redundant since the security definer 
-- RPC function record_login_attempt() bypasses RLS anyway
DROP POLICY IF EXISTS "Block direct insert access to login attempts" ON public.login_attempts;

-- The existing "Admins can insert login attempts" policy provides sufficient
-- protection for any direct table access attempts