-- Fix: SECRETS_EXPOSED - WhatsApp Access Tokens and Business IDs Publicly Accessible
-- Create a secure view that only exposes public-safe fields from restaurant_settings

-- Create the public view with only safe fields
CREATE OR REPLACE VIEW public.public_restaurant_view AS
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

-- Grant access to the view for anonymous and authenticated users
GRANT SELECT ON public.public_restaurant_view TO anon, authenticated;

-- Add a comment documenting the security purpose
COMMENT ON VIEW public.public_restaurant_view IS 'Public-safe view of restaurant settings. Excludes sensitive fields like whatsapp_access_token, phone_number_id, whatsapp_business_id, siret, and chatbot_prompt.';