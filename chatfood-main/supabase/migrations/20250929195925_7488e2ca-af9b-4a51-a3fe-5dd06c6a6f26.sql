-- Create function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  );
$$;

-- RLS Policy: Admins can view all profiles
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.is_admin());

-- RLS Policy: Admins can update all profiles (including role changes)
CREATE POLICY "Admins can update all profiles"
ON public.profiles
FOR UPDATE
TO authenticated
USING (public.is_admin());

-- RLS Policy: Admins can view all login attempts
CREATE POLICY "Admins can view login attempts"
ON public.login_attempts
FOR SELECT
TO authenticated
USING (public.is_admin());

-- RLS Policy: Admins can view all security blocks
CREATE POLICY "Admins can view security blocks"
ON public.security_blocks
FOR SELECT
TO authenticated
USING (public.is_admin());

-- RLS Policy: Admins can delete security blocks (unblock users)
CREATE POLICY "Admins can delete security blocks"
ON public.security_blocks
FOR DELETE
TO authenticated
USING (public.is_admin());