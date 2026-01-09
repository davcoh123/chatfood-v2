-- Remove redundant blocking policy on profiles
-- The explicit "Users can view their own profile" and "Admins can view all profiles" 
-- policies already ensure proper access control. Blocking policies are redundant.
DROP POLICY IF EXISTS "Block anonymous access to profiles" ON public.profiles;