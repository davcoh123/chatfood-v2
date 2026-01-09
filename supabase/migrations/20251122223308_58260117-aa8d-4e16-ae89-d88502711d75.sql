-- Ajouter les nouvelles colonnes à restaurant_settings
ALTER TABLE public.restaurant_settings
  ADD COLUMN restaurant_name TEXT,
  ADD COLUMN assets JSONB DEFAULT '[]'::jsonb NOT NULL,
  ADD COLUMN spreadsheet_id TEXT,
  ADD COLUMN sheet_id_catalog BIGINT,
  ADD COLUMN sheet_id_cart BIGINT,
  ADD COLUMN sheet_id_analytics_message BIGINT,
  ADD COLUMN sheet_id_analytics_calendar BIGINT,
  ADD COLUMN phone_number_id TEXT,
  ADD COLUMN whatsapp_business_id TEXT;

-- Migrer les Google Sheets IDs depuis dashboard_configurations
UPDATE public.restaurant_settings rs
SET 
  spreadsheet_id = (dc.customizations->'google_sheets'->>'spreadsheet_id')::text,
  sheet_id_catalog = ((dc.customizations->'google_sheets'->'sheet_ids'->>'catalog')::numeric)::bigint,
  sheet_id_cart = ((dc.customizations->'google_sheets'->'sheet_ids'->>'cart')::numeric)::bigint,
  sheet_id_analytics_message = ((dc.customizations->'google_sheets'->'sheet_ids'->>'analytics_message')::numeric)::bigint,
  sheet_id_analytics_calendar = ((dc.customizations->'google_sheets'->'sheet_ids'->>'analytics_calendar')::numeric)::bigint
FROM public.dashboard_configurations dc
WHERE rs.user_id = dc.user_id 
  AND dc.section_id = 'google_sheets_config'
  AND dc.customizations->'google_sheets' IS NOT NULL;

-- Peupler restaurant_name depuis profiles
UPDATE public.restaurant_settings rs
SET restaurant_name = CONCAT(p.first_name, ' ', p.last_name)
FROM public.profiles p
WHERE rs.user_id = p.user_id
  AND rs.restaurant_name IS NULL;