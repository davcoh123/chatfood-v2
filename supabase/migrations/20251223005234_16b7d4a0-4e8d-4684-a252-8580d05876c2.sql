-- Add disabled_ingredients column to restaurant_settings
ALTER TABLE public.restaurant_settings 
ADD COLUMN IF NOT EXISTS disabled_ingredients TEXT[] DEFAULT '{}'::TEXT[];