-- Ajouter les colonnes pour les nouveaux onglets Google Sheets (suppléments et menus)
ALTER TABLE restaurant_settings
ADD COLUMN sheet_id_addons BIGINT,
ADD COLUMN sheet_id_menus BIGINT;

-- Ajouter des commentaires pour documentation
COMMENT ON COLUMN restaurant_settings.sheet_id_addons IS 'ID de l''onglet Google Sheet pour les suppléments';
COMMENT ON COLUMN restaurant_settings.sheet_id_menus IS 'ID de l''onglet Google Sheet pour les menus/formules';