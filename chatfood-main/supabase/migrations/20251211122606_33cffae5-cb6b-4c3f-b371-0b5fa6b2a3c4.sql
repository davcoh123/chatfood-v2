-- Drop the chatbot_order_items table (no longer needed)
DROP TABLE IF EXISTS public.chatbot_order_items;

-- Drop foreign key constraints on chatbot_orders
ALTER TABLE public.chatbot_orders DROP CONSTRAINT IF EXISTS chatbot_orders_customer_id_fkey;
ALTER TABLE public.chatbot_orders DROP CONSTRAINT IF EXISTS chatbot_orders_source_message_id_fkey;

-- Remove unnecessary columns from chatbot_orders
ALTER TABLE public.chatbot_orders 
  DROP COLUMN IF EXISTS customer_id,
  DROP COLUMN IF EXISTS source_message_id,
  DROP COLUMN IF EXISTS order_number,
  DROP COLUMN IF EXISTS subtotal,
  DROP COLUMN IF EXISTS checkout_stage,
  DROP COLUMN IF EXISTS currency,
  DROP COLUMN IF EXISTS fulfillment_mode,
  DROP COLUMN IF EXISTS fulfillment_first_name,
  DROP COLUMN IF EXISTS fulfillment_last_name,
  DROP COLUMN IF EXISTS fulfillment_address,
  DROP COLUMN IF EXISTS fulfillment_postal_code,
  DROP COLUMN IF EXISTS fulfillment_city,
  DROP COLUMN IF EXISTS confirmed_at,
  DROP COLUMN IF EXISTS ready_at,
  DROP COLUMN IF EXISTS delivered_at,
  DROP COLUMN IF EXISTS updated_at;

-- Rename columns to match Excel structure
ALTER TABLE public.chatbot_orders RENAME COLUMN customer_name TO name;
ALTER TABLE public.chatbot_orders RENAME COLUMN customer_phone TO phone;
ALTER TABLE public.chatbot_orders RENAME COLUMN total_amount TO price_total;
ALTER TABLE public.chatbot_orders RENAME COLUMN notes TO note;
ALTER TABLE public.chatbot_orders RENAME COLUMN order_type TO commande_type;
ALTER TABLE public.chatbot_orders RENAME COLUMN fulfillment_arrival_time TO horaire_recup;
ALTER TABLE public.chatbot_orders RENAME COLUMN created_at TO heure_de_commande;

-- Add commande_item JSONB column for storing all products
ALTER TABLE public.chatbot_orders ADD COLUMN IF NOT EXISTS commande_item JSONB DEFAULT '[]'::jsonb;

-- Change status to TEXT (simpler)
ALTER TABLE public.chatbot_orders ALTER COLUMN status TYPE TEXT USING status::TEXT;
ALTER TABLE public.chatbot_orders ALTER COLUMN status SET DEFAULT 'pending';

-- Change commande_type to TEXT
ALTER TABLE public.chatbot_orders ALTER COLUMN commande_type TYPE TEXT USING commande_type::TEXT;
ALTER TABLE public.chatbot_orders ALTER COLUMN commande_type SET DEFAULT 'scheduled_takeaway';

-- Drop the old enums if not used elsewhere
DROP TYPE IF EXISTS public.order_status;
DROP TYPE IF EXISTS public.order_type_enum;