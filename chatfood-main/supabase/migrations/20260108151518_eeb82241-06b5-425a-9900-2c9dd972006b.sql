-- Add Stripe Connect columns to restaurant_settings
ALTER TABLE public.restaurant_settings 
ADD COLUMN IF NOT EXISTS stripe_account_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_onboarding_status TEXT DEFAULT 'not_started',
ADD COLUMN IF NOT EXISTS stripe_charges_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS stripe_payouts_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS stripe_onboarded_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS payments_enabled BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS platform_fee_percent NUMERIC(5,2) DEFAULT 5.00;

-- Add payment columns to chatbot_orders
ALTER TABLE public.chatbot_orders 
ADD COLUMN IF NOT EXISTS payment_intent_id TEXT,
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS payment_method TEXT,
ADD COLUMN IF NOT EXISTS stripe_fee NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS platform_fee NUMERIC(10,2),
ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;

-- Create index for faster payment lookups
CREATE INDEX IF NOT EXISTS idx_chatbot_orders_payment_intent ON public.chatbot_orders(payment_intent_id) WHERE payment_intent_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_chatbot_orders_payment_status ON public.chatbot_orders(payment_status);
CREATE INDEX IF NOT EXISTS idx_restaurant_settings_stripe_account ON public.restaurant_settings(stripe_account_id) WHERE stripe_account_id IS NOT NULL;