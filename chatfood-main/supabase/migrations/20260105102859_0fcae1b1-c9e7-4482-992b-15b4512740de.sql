-- Fix the security definer view issue by explicitly setting SECURITY INVOKER
DROP VIEW IF EXISTS public.public_restaurant_view;

CREATE VIEW public.public_restaurant_view 
WITH (security_invoker = true) AS
SELECT 
  user_id,
  restaurant_name,
  slug,
  address_street,
  address_postal_code,
  address_city,
  latitude,
  longitude,
  opening_hours,
  assets,
  theme_color,
  cover_image_url,
  featured_categories,
  category_order,
  timezone,
  currency,
  default_language,
  chatbot_active,
  order_time_enabled,
  order_time_minutes,
  manual_order_confirmation,
  product_suggestions,
  daily_menu_enabled,
  daily_menu_config
FROM public.restaurant_settings
WHERE slug IS NOT NULL AND slug <> '';

-- Grant access to the view
GRANT SELECT ON public.public_restaurant_view TO anon, authenticated;

-- Document the security purpose
COMMENT ON VIEW public.public_restaurant_view IS 'Public-safe view of restaurant settings with SECURITY INVOKER. Excludes sensitive fields like whatsapp_access_token, phone_number_id, whatsapp_business_id, siret, and chatbot_prompt.';