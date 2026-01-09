-- Add customer reviews and daily menu fields to restaurant_settings
ALTER TABLE public.restaurant_settings
ADD COLUMN customer_reviews_enabled BOOLEAN DEFAULT false,
ADD COLUMN customer_reviews_delay_hours INTEGER DEFAULT 2,
ADD COLUMN customer_reviews_message TEXT DEFAULT 'Comment avez-vous trouvé votre commande ?',
ADD COLUMN daily_menu_enabled BOOLEAN DEFAULT false,
ADD COLUMN daily_menu_config JSONB DEFAULT '{"schedules": [], "products": [], "menu_price": 0, "menu_label": "Menu du jour"}'::jsonb;

-- Create order_reviews table for customer feedback
CREATE TABLE public.order_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  order_id TEXT NOT NULL,
  customer_phone TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.order_reviews ENABLE ROW LEVEL SECURITY;

-- RLS Policies for order_reviews
CREATE POLICY "Users can view their own reviews"
ON public.order_reviews
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all reviews"
ON public.order_reviews
FOR SELECT
USING (public.is_admin());

CREATE POLICY "Block anonymous access to order reviews"
ON public.order_reviews
FOR ALL
USING (false);