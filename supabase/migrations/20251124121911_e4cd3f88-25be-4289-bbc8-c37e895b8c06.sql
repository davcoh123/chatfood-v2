-- Add reservations_webhook_url column to restaurant_settings
ALTER TABLE public.restaurant_settings
ADD COLUMN reservations_webhook_url TEXT;

-- Add comment explaining the field
COMMENT ON COLUMN public.restaurant_settings.reservations_webhook_url IS 'Webhook URL for reservations. Hardcoded for Starter plan, customizable by admin for Pro/Premium';

-- Update handle_new_user function to include hardcoded reservations webhook for Starter plan
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  user_plan subscription_plan;
BEGIN
  -- Créer le profil
  INSERT INTO public.profiles (user_id, email, first_name, last_name)
  VALUES (
    NEW.id, 
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', '')
  );
  
  -- Créer le role par défaut (user)
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  
  -- Créer l'abonnement par défaut (starter)
  INSERT INTO public.user_subscriptions (user_id, plan)
  VALUES (NEW.id, 'starter')
  RETURNING plan INTO user_plan;
  
  -- Créer les restaurant_settings avec le webhook hardcodé pour Starter
  INSERT INTO public.restaurant_settings (
    user_id,
    reservations_webhook_url
  )
  VALUES (
    NEW.id,
    CASE 
      WHEN user_plan = 'starter' THEN 'https://n8n.chatfood.fr/webhook/full-reservations-mois-chatfood-demo'
      ELSE NULL
    END
  );
  
  RETURN NEW;
END;
$function$;

-- Create function to clear hardcoded webhook on plan upgrade
CREATE OR REPLACE FUNCTION public.clear_starter_webhook_on_upgrade()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  -- Si on passe de starter à pro/premium, on efface le webhook hardcodé
  IF OLD.plan = 'starter' AND NEW.plan IN ('pro', 'premium') THEN
    UPDATE public.restaurant_settings
    SET reservations_webhook_url = NULL
    WHERE user_id = NEW.user_id;
    
    RAISE NOTICE 'Cleared hardcoded reservations webhook for user % upgraded from starter to %', NEW.user_id, NEW.plan;
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create trigger to automatically clear webhook on upgrade
DROP TRIGGER IF EXISTS trigger_clear_webhook_on_upgrade ON public.user_subscriptions;
CREATE TRIGGER trigger_clear_webhook_on_upgrade
  AFTER UPDATE ON public.user_subscriptions
  FOR EACH ROW
  WHEN (OLD.plan IS DISTINCT FROM NEW.plan)
  EXECUTE FUNCTION public.clear_starter_webhook_on_upgrade();