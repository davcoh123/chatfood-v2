-- Add online_orders_enabled column to restaurant_settings
ALTER TABLE public.restaurant_settings 
ADD COLUMN IF NOT EXISTS online_orders_enabled BOOLEAN DEFAULT false;

-- Update the public_restaurant_view to include the new column
DROP VIEW IF EXISTS public_restaurant_view;

CREATE VIEW public_restaurant_view AS
SELECT 
  user_id,
  slug,
  restaurant_name,
  address_street,
  address_city,
  address_postal_code,
  latitude,
  longitude,
  opening_hours,
  assets,
  cover_image_url,
  theme_color,
  chatbot_active,
  currency,
  default_language,
  timezone,
  product_suggestions,
  daily_menu_enabled,
  daily_menu_config,
  featured_categories,
  category_order,
  online_orders_enabled,
  manual_order_confirmation,
  order_time_enabled,
  order_time_minutes
FROM public.restaurant_settings
WHERE slug IS NOT NULL;