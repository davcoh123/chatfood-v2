-- Fix all remaining functions search_path
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, role)
  VALUES (NEW.id, NEW.email, 'user');
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.cleanup_old_security_records()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Delete expired blocks
  DELETE FROM public.security_blocks WHERE blocked_until < now();
  
  -- Delete login attempts older than 24 hours
  DELETE FROM public.login_attempts WHERE attempt_time < (now() - INTERVAL '24 hours');
END;
$$;