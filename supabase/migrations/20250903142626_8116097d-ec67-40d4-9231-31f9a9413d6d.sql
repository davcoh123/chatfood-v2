-- Create function to check if account/IP is blocked
CREATE OR REPLACE FUNCTION public.is_blocked(check_email TEXT DEFAULT NULL, check_ip INET DEFAULT NULL)
RETURNS TABLE(blocked BOOLEAN, blocked_until TIMESTAMP WITH TIME ZONE, reason TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    TRUE as blocked,
    sb.blocked_until,
    sb.reason
  FROM public.security_blocks sb
  WHERE 
    (sb.email = check_email OR sb.ip_address = check_ip OR sb.block_type = 'both')
    AND sb.blocked_until > now()
  ORDER BY sb.blocked_until DESC
  LIMIT 1;
  
  -- If no active blocks found, return not blocked
  IF NOT FOUND THEN
    RETURN QUERY SELECT FALSE as blocked, NULL::TIMESTAMP WITH TIME ZONE as blocked_until, NULL::TEXT as reason;
  END IF;
END;
$$;

-- Create function to record login attempt and check for blocking
CREATE OR REPLACE FUNCTION public.record_login_attempt(
  attempt_email TEXT,
  attempt_ip INET,
  was_successful BOOLEAN
)
RETURNS TABLE(should_block BOOLEAN, block_until TIMESTAMP WITH TIME ZONE)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  failed_attempts INTEGER;
  block_duration INTERVAL := '15 minutes';
BEGIN
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
  
  -- Count failed attempts in the last 15 minutes
  SELECT COUNT(*) INTO failed_attempts
  FROM public.login_attempts
  WHERE email = attempt_email 
    AND success = FALSE
    AND attempt_time > (now() - INTERVAL '15 minutes');
  
  -- If 5 or more failed attempts, create block
  IF failed_attempts >= 5 THEN
    -- Block both account and IP
    INSERT INTO public.security_blocks (email, ip_address, block_type, blocked_until)
    VALUES (attempt_email, attempt_ip, 'both', now() + block_duration)
    ON CONFLICT DO NOTHING;
    
    RETURN QUERY SELECT TRUE as should_block, (now() + block_duration) as block_until;
  ELSE
    RETURN QUERY SELECT FALSE as should_block, NULL::TIMESTAMP WITH TIME ZONE as block_until;
  END IF;
END;
$$;