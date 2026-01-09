-- Ajouter le setting pour les notifications de sécurité s'il n'existe pas
INSERT INTO public.system_settings (setting_key, setting_value)
VALUES ('email_notifications_security', 'false'::jsonb)
ON CONFLICT (setting_key) DO NOTHING;

-- Créer une fonction pour envoyer les notifications de sécurité automatiques
CREATE OR REPLACE FUNCTION public.notify_automatic_security_block()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  payload jsonb;
  webhook_url text := 'https://dcwfgxbwpecnjbhrhrib.supabase.co/functions/v1/notify-security';
  anon_key text := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRjd2ZneGJ3cGVjbmpiaHJocmliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTY5MDc3NjMsImV4cCI6MjA3MjQ4Mzc2M30.ACjXdQxukmbAvokW8Py7TwfNQrhjy1jQAFbLLap98-w';
BEGIN
  -- Préparer le payload
  payload := jsonb_build_object(
    'eventType', 'account_blocked',
    'email', NEW.email,
    'ipAddress', NEW.ip_address::text,
    'blockType', NEW.block_type,
    'blockedUntil', NEW.blocked_until::text,
    'reason', NEW.reason,
    'failedAttempts', 0,
    'triggeredBy', 'system'
  );

  -- Envoyer la notification de manière asynchrone via pg_net ou http
  -- Note: Cela nécessite l'extension pg_net ou pgsql-http
  -- Pour l'instant, on log juste l'événement
  RAISE NOTICE 'Security block created: %', payload;
  
  -- Si pg_net est disponible, décommenter:
  -- PERFORM net.http_post(
  --   url := webhook_url,
  --   headers := jsonb_build_object(
  --     'Content-Type', 'application/json',
  --     'apikey', anon_key
  --   ),
  --   body := payload
  -- );

  RETURN NEW;
END;
$$;

-- Créer un trigger sur security_blocks pour les blocages automatiques
DROP TRIGGER IF EXISTS on_security_block_created ON public.security_blocks;
CREATE TRIGGER on_security_block_created
  AFTER INSERT ON public.security_blocks
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_automatic_security_block();

COMMENT ON FUNCTION public.notify_automatic_security_block() IS 'Envoie une notification webhook quand un blocage automatique est créé. Note: nécessite pg_net pour l''envoi HTTP réel.';