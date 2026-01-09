-- Add theme_color and cover_image_url columns to restaurant_settings
ALTER TABLE public.restaurant_settings 
ADD COLUMN IF NOT EXISTS theme_color TEXT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS cover_image_url TEXT DEFAULT NULL;