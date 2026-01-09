-- Fix search_path for update_ticket_last_message function
-- This prevents search path manipulation attacks
CREATE OR REPLACE FUNCTION public.update_ticket_last_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public  -- Add explicit search_path for security
AS $function$
BEGIN
  UPDATE public.support_tickets 
  SET last_message_at = NEW.created_at,
      status = CASE 
        WHEN NEW.sender_type = 'user' THEN 'awaiting_admin'
        WHEN NEW.sender_type = 'admin' THEN 'awaiting_user'
        ELSE status
      END
  WHERE id = NEW.ticket_id;
  RETURN NEW;
END;
$function$;