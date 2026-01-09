-- Ajouter la colonne whatsapp_access_token dans restaurant_settings
ALTER TABLE public.restaurant_settings 
ADD COLUMN IF NOT EXISTS whatsapp_access_token TEXT;