-- Ajouter la colonne updated_at manquante à chatbot_orders
ALTER TABLE public.chatbot_orders 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();

-- Initialiser les valeurs existantes avec heure_de_commande
UPDATE public.chatbot_orders 
SET updated_at = heure_de_commande 
WHERE updated_at IS NULL;