-- Create system_settings table for configuration
CREATE TABLE IF NOT EXISTS public.system_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  setting_key text UNIQUE NOT NULL,
  setting_value jsonb NOT NULL,
  updated_at timestamp with time zone DEFAULT now(),
  updated_by uuid REFERENCES auth.users(id),
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on system_settings
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Only admins can read system_settings
CREATE POLICY "Admins can read system settings"
ON public.system_settings
FOR SELECT
USING (public.is_admin());

-- RLS Policy: Only admins can update system_settings
CREATE POLICY "Admins can update system settings"
ON public.system_settings
FOR UPDATE
USING (public.is_admin());

-- RLS Policy: Only admins can insert system_settings
CREATE POLICY "Admins can insert system settings"
ON public.system_settings
FOR INSERT
WITH CHECK (public.is_admin());

-- Create admin_actions table for audit trail
CREATE TABLE IF NOT EXISTS public.admin_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid REFERENCES auth.users(id) NOT NULL,
  admin_email text NOT NULL,
  action_type text NOT NULL,
  target_user_id uuid,
  target_user_email text,
  details jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on admin_actions
ALTER TABLE public.admin_actions ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Only admins can read admin_actions
CREATE POLICY "Admins can read admin actions"
ON public.admin_actions
FOR SELECT
USING (public.is_admin());

-- RLS Policy: Only admins can insert admin_actions
CREATE POLICY "Admins can insert admin actions"
ON public.admin_actions
FOR INSERT
WITH CHECK (public.is_admin());

-- Insert default system settings
INSERT INTO public.system_settings (setting_key, setting_value) VALUES
  ('allow_registration', 'true'::jsonb),
  ('max_login_attempts', '5'::jsonb),
  ('block_duration_minutes', '15'::jsonb),
  ('email_notifications_signup', 'true'::jsonb),
  ('email_notifications_security', 'true'::jsonb),
  ('maintenance_mode', 'false'::jsonb)
ON CONFLICT (setting_key) DO NOTHING;

-- Create function to get setting value
CREATE OR REPLACE FUNCTION public.get_setting(key text)
RETURNS jsonb
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT setting_value FROM public.system_settings WHERE setting_key = key;
$$;

-- Update record_login_attempt function to use dynamic settings
CREATE OR REPLACE FUNCTION public.record_login_attempt(attempt_email text, attempt_ip inet, was_successful boolean)
RETURNS TABLE(should_block boolean, block_until timestamp with time zone)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  failed_attempts INTEGER;
  max_attempts INTEGER;
  block_minutes INTEGER;
  block_duration INTERVAL;
BEGIN
  -- Get dynamic settings
  SELECT (public.get_setting('max_login_attempts')::text)::integer INTO max_attempts;
  SELECT (public.get_setting('block_duration_minutes')::text)::integer INTO block_minutes;
  block_duration := (block_minutes || ' minutes')::INTERVAL;
  
  -- Record the attempt
  INSERT INTO public.login_attempts (email, ip_address, success)
  VALUES (attempt_email, attempt_ip, was_successful);
  
  -- If successful, clear any existing blocks and return
  IF was_successful THEN
    DELETE FROM public.security_blocks 
    WHERE email = attempt_email OR ip_address = attempt_ip;
    
    RETURN QUERY SELECT FALSE as should_block, NULL::TIMESTAMP WITH TIME ZONE as block_until;
    RETURN;
  END IF;
  
  -- Count failed attempts in the configured time window
  SELECT COUNT(*) INTO failed_attempts
  FROM public.login_attempts
  WHERE email = attempt_email 
    AND success = FALSE
    AND attempt_time > (now() - block_duration);
  
  -- If max attempts reached, create block
  IF failed_attempts >= max_attempts THEN
    -- Block both account and IP
    INSERT INTO public.security_blocks (email, ip_address, block_type, blocked_until)
    VALUES (attempt_email, attempt_ip, 'both', now() + block_duration)
    ON CONFLICT DO NOTHING;
    
    RETURN QUERY SELECT TRUE as should_block, (now() + block_duration) as block_until;
  ELSE
    RETURN QUERY SELECT FALSE as should_block, NULL::TIMESTAMP WITH TIME ZONE as block_until;
  END IF;
END;
$function$;