-- Add default deny policies to prevent any anonymous access to sensitive tables
-- These RESTRICTIVE policies ensure that even if permissive policies exist,
-- anonymous users (role = anon) are always blocked

-- Block anonymous access to login_attempts
CREATE POLICY "Block anonymous access to login attempts"
ON public.login_attempts
AS RESTRICTIVE
FOR ALL
TO anon
USING (false);

-- Block anonymous access to profiles
CREATE POLICY "Block anonymous access to profiles"
ON public.profiles
AS RESTRICTIVE
FOR ALL
TO anon
USING (false);

-- Block anonymous access to support_tickets
CREATE POLICY "Block anonymous access to support tickets"
ON public.support_tickets
AS RESTRICTIVE
FOR ALL
TO anon
USING (false);

-- Block anonymous access to ticket_messages
CREATE POLICY "Block anonymous access to ticket messages"
ON public.ticket_messages
AS RESTRICTIVE
FOR ALL
TO anon
USING (false);

-- Block anonymous access to ticket_reviews
CREATE POLICY "Block anonymous access to ticket reviews"
ON public.ticket_reviews
AS RESTRICTIVE
FOR ALL
TO anon
USING (false);

-- Block anonymous access to user_roles
CREATE POLICY "Block anonymous access to user roles"
ON public.user_roles
AS RESTRICTIVE
FOR ALL
TO anon
USING (false);

-- Block anonymous access to user_subscriptions
CREATE POLICY "Block anonymous access to user subscriptions"
ON public.user_subscriptions
AS RESTRICTIVE
FOR ALL
TO anon
USING (false);

-- Block anonymous access to admin_actions
CREATE POLICY "Block anonymous access to admin actions"
ON public.admin_actions
AS RESTRICTIVE
FOR ALL
TO anon
USING (false);

-- Block anonymous access to security_blocks
CREATE POLICY "Block anonymous access to security blocks"
ON public.security_blocks
AS RESTRICTIVE
FOR ALL
TO anon
USING (false);