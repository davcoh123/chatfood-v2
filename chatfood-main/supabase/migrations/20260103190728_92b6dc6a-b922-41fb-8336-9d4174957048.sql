-- Update handle_new_user function to pre-fill chatbot_prompt with starter template
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  user_plan subscription_plan;
  starter_template TEXT;
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
  
  -- Récupérer le template Starter depuis system_settings
  SELECT (setting_value->>'template')::TEXT INTO starter_template
  FROM public.system_settings
  WHERE setting_key = 'starter_prompt_template';
  
  -- Créer les restaurant_settings avec le webhook hardcodé pour Starter et le prompt template
  INSERT INTO public.restaurant_settings (
    user_id,
    reservations_webhook_url,
    chatbot_prompt
  )
  VALUES (
    NEW.id,
    CASE 
      WHEN user_plan = 'starter' THEN 'https://n8n.chatfood.fr/webhook/full-reservations-mois-chatfood-demo'
      ELSE NULL
    END,
    CASE 
      WHEN user_plan = 'starter' THEN starter_template
      ELSE NULL
    END
  );
  
  RETURN NEW;
END;
$function$;