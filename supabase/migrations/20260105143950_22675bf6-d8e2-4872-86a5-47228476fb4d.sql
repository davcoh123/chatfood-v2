-- Fix public_restaurant_view to use SECURITY INVOKER instead of SECURITY DEFINER
-- This ensures the view uses the querying user's permissions, not the view creator's

DROP VIEW IF EXISTS public.public_restaurant_view;

CREATE VIEW public.public_restaurant_view 
WITH (security_invoker = true)
AS
SELECT 
  user_id,
  restaurant_name,
  slug,
  address_street,
  address_postal_code,
  address_city,
  cover_image_url,
  theme_color,
  opening_hours,
  assets,
  chatbot_active,
  latitude,
  longitude,
  currency,
  default_language,
  timezone,
  featured_categories,
  category_order,
  order_time_enabled,
  order_time_minutes,
  manual_order_confirmation,
  product_suggestions,
  daily_menu_enabled,
  daily_menu_config,
  online_orders_enabled
FROM public.restaurant_settings
WHERE slug IS NOT NULL AND slug != '';