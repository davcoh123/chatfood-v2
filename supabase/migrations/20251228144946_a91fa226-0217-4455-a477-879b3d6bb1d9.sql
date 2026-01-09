-- Supprimer les colonnes inutiles de restaurant_settings
ALTER TABLE public.restaurant_settings 
DROP COLUMN IF EXISTS spreadsheet_id,
DROP COLUMN IF EXISTS sheet_id_catalog,
DROP COLUMN IF EXISTS sheet_id_cart,
DROP COLUMN IF EXISTS sheet_id_analytics_message,
DROP COLUMN IF EXISTS sheet_id_analytics_calendar,
DROP COLUMN IF EXISTS sheet_id_addons,
DROP COLUMN IF EXISTS sheet_id_menus,
DROP COLUMN IF EXISTS chatbot_prompt_template;

-- Ajouter la colonne user_number avec auto-incrément
ALTER TABLE public.restaurant_settings 
ADD COLUMN IF NOT EXISTS user_number SERIAL;

-- Mettre à jour les utilisateurs existants avec un numéro séquentiel basé sur created_at
WITH numbered_users AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at ASC) as row_num
  FROM public.restaurant_settings
)
UPDATE public.restaurant_settings rs
SET user_number = nu.row_num
FROM numbered_users nu
WHERE rs.id = nu.id;