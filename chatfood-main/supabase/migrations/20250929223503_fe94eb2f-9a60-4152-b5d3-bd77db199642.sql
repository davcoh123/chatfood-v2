-- Phase 1: Fix Privilege Escalation - Add Column-Level Security to profiles
-- Remove the overly permissive policy that allows users to update their own role
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

-- Create a new policy with proper column restrictions
-- Users can only update their own non-sensitive fields (not role)
CREATE POLICY "Users can update their own non-sensitive profile fields"
ON profiles FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Explicitly revoke UPDATE on all columns, then grant only on safe columns
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
REVOKE UPDATE ON profiles FROM authenticated;
GRANT UPDATE (first_name, last_name, email, updated_at) ON profiles TO authenticated;

-- Phase 2: Fix Login Attempts Access - Remove blocking policy
-- Remove the overly restrictive policy that blocks all access
DROP POLICY IF EXISTS "Only authenticated users can view login attempts" ON login_attempts;

-- The existing "Admins can view login attempts" policy is sufficient
-- This allows admins to view login attempts while preventing unauthorized access