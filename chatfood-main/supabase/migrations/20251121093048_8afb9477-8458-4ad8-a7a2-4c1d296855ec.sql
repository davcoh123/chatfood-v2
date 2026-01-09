-- Modifier la table restaurant_settings pour avoir 3 champs d'adresse
ALTER TABLE public.restaurant_settings 
DROP COLUMN address;

ALTER TABLE public.restaurant_settings 
ADD COLUMN address_street text,
ADD COLUMN address_postal_code text,
ADD COLUMN address_city text;