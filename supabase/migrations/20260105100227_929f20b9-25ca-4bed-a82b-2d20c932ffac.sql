-- Add featured_categories and category_order to restaurant_settings
ALTER TABLE public.restaurant_settings 
ADD COLUMN IF NOT EXISTS featured_categories TEXT[] DEFAULT NULL;

ALTER TABLE public.restaurant_settings 
ADD COLUMN IF NOT EXISTS category_order TEXT[] DEFAULT NULL;

COMMENT ON COLUMN public.restaurant_settings.featured_categories IS 'Up to 3 categories to display under the restaurant name on the public page';
COMMENT ON COLUMN public.restaurant_settings.category_order IS 'Custom order for displaying categories in the public menu';