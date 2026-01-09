-- Ajouter la colonne SIRET à restaurant_settings
ALTER TABLE public.restaurant_settings 
ADD COLUMN IF NOT EXISTS siret TEXT;