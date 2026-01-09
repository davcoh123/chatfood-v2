-- Add chatbot_prompt_template column to store the template with placeholders
ALTER TABLE public.restaurant_settings 
ADD COLUMN IF NOT EXISTS chatbot_prompt_template TEXT;

-- Copy existing chatbot_prompt values to chatbot_prompt_template if they contain placeholders
-- Otherwise, leave it null (will use default template)
UPDATE public.restaurant_settings 
SET chatbot_prompt_template = chatbot_prompt 
WHERE chatbot_prompt IS NOT NULL 
  AND (chatbot_prompt LIKE '%[[%]]%' OR chatbot_prompt LIKE '%{{%}}%');

-- Add a comment for documentation
COMMENT ON COLUMN public.restaurant_settings.chatbot_prompt_template IS 'Template with placeholders like [[RESTAURANT_NAME]]. The chatbot_prompt column contains the rendered version.';