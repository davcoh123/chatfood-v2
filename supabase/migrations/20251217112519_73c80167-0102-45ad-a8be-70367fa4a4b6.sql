-- Add chatbot_prompt field to restaurant_settings table
-- This stores the static part of the system prompt (without dynamic variables)
ALTER TABLE public.restaurant_settings
ADD COLUMN IF NOT EXISTS chatbot_prompt TEXT DEFAULT NULL;

-- Add a comment to document the field
COMMENT ON COLUMN public.restaurant_settings.chatbot_prompt IS 'Static system prompt template with placeholders like [[RESTAURANT_NAME]], [[OPENING_HOURS]], etc. Dynamic variables (NOW, CUSTOMER_NAME) are injected by n8n at runtime.';