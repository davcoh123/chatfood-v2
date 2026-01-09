-- Ajouter les colonnes pour le système d'avis clients à chatbot_orders
ALTER TABLE chatbot_orders 
ADD COLUMN IF NOT EXISTS review_message_id TEXT,
ADD COLUMN IF NOT EXISTS review_rating INTEGER CHECK (review_rating >= 1 AND review_rating <= 5),
ADD COLUMN IF NOT EXISTS review_sent_at TIMESTAMPTZ;