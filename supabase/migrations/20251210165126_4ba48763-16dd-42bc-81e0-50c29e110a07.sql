-- Drop foreign keys that reference chatbot_messages.id
ALTER TABLE public.chatbot_orders DROP CONSTRAINT IF EXISTS chatbot_orders_source_message_id_fkey;
ALTER TABLE public.chatbot_reservations DROP CONSTRAINT IF EXISTS chatbot_reservations_source_message_id_fkey;
ALTER TABLE public.analytics_events DROP CONSTRAINT IF EXISTS analytics_events_message_id_fkey;

-- Change source_message_id columns to TEXT
ALTER TABLE public.chatbot_orders ALTER COLUMN source_message_id TYPE TEXT USING source_message_id::TEXT;
ALTER TABLE public.chatbot_reservations ALTER COLUMN source_message_id TYPE TEXT USING source_message_id::TEXT;
ALTER TABLE public.analytics_events ALTER COLUMN message_id TYPE TEXT USING message_id::TEXT;

-- Change chatbot_messages.id to TEXT
ALTER TABLE public.chatbot_messages 
  ALTER COLUMN id TYPE TEXT,
  ALTER COLUMN id DROP DEFAULT;

-- Recreate foreign keys with TEXT type
ALTER TABLE public.chatbot_orders 
  ADD CONSTRAINT chatbot_orders_source_message_id_fkey 
  FOREIGN KEY (source_message_id) REFERENCES public.chatbot_messages(id);

ALTER TABLE public.chatbot_reservations 
  ADD CONSTRAINT chatbot_reservations_source_message_id_fkey 
  FOREIGN KEY (source_message_id) REFERENCES public.chatbot_messages(id);

ALTER TABLE public.analytics_events 
  ADD CONSTRAINT analytics_events_message_id_fkey 
  FOREIGN KEY (message_id) REFERENCES public.chatbot_messages(id);