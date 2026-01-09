-- Simplification de chatbot_messages pour correspondre à la structure Excel
-- Colonnes finales: id, user_id, from_number, to_number, customer_name, created_at, message_type, body, status

-- Supprimer les colonnes inutiles
ALTER TABLE public.chatbot_messages 
  DROP COLUMN IF EXISTS customer_id,
  DROP COLUMN IF EXISTS direction,
  DROP COLUMN IF EXISTS transcription,
  DROP COLUMN IF EXISTS raw_payload,
  DROP COLUMN IF EXISTS ai_response,
  DROP COLUMN IF EXISTS ai_model,
  DROP COLUMN IF EXISTS whatsapp_message_id,
  DROP COLUMN IF EXISTS session_id;

-- Ajouter la colonne customer_name
ALTER TABLE public.chatbot_messages 
  ADD COLUMN IF NOT EXISTS customer_name TEXT;