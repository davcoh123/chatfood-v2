-- Ajouter les colonnes de choix directement dans chatbot_menus
ALTER TABLE chatbot_menus
ADD COLUMN IF NOT EXISTS choice1_label TEXT,
ADD COLUMN IF NOT EXISTS choice1_productid TEXT[],
ADD COLUMN IF NOT EXISTS choice2_label TEXT,
ADD COLUMN IF NOT EXISTS choice2_productid TEXT[],
ADD COLUMN IF NOT EXISTS choice3_label TEXT,
ADD COLUMN IF NOT EXISTS choice3_productid TEXT[],
ADD COLUMN IF NOT EXISTS choice4_label TEXT,
ADD COLUMN IF NOT EXISTS choice4_productid TEXT[];

-- Supprimer les colonnes inutiles
ALTER TABLE chatbot_menus DROP COLUMN IF EXISTS description;
ALTER TABLE chatbot_menus DROP COLUMN IF EXISTS sort_order;