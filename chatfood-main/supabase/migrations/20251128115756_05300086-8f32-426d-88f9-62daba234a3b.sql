-- Add chatbot control columns to restaurant_settings
ALTER TABLE public.restaurant_settings
ADD COLUMN IF NOT EXISTS order_time_enabled BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS order_time_minutes INTEGER DEFAULT 15,
ADD COLUMN IF NOT EXISTS manual_order_confirmation BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS product_suggestions JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN public.restaurant_settings.order_time_enabled IS 'Active le temps de préparation annoncé par le chatbot';
COMMENT ON COLUMN public.restaurant_settings.order_time_minutes IS 'Durée en minutes avant que le client puisse récupérer sa commande';
COMMENT ON COLUMN public.restaurant_settings.manual_order_confirmation IS 'Le client reçoit une confirmation uniquement après validation manuelle';
COMMENT ON COLUMN public.restaurant_settings.product_suggestions IS 'Associations de produits pour suggestions automatiques du chatbot';