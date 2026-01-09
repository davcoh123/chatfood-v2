-- =====================================================
-- PHASE 1: ENUM TYPES
-- =====================================================

-- Direction des messages
CREATE TYPE message_direction AS ENUM ('inbound', 'outbound');

-- Type de message
CREATE TYPE message_type AS ENUM ('text', 'audio', 'image', 'document', 'location', 'system');

-- Statut de commande
CREATE TYPE order_status AS ENUM ('draft', 'pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled');

-- Type de commande
CREATE TYPE order_type_enum AS ENUM ('pickup', 'delivery', 'dine_in');

-- Statut de réservation
CREATE TYPE reservation_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed', 'no_show');

-- Type d'application des suppléments
CREATE TYPE addon_applies_to AS ENUM ('product', 'category', 'global');

-- =====================================================
-- PHASE 2: EXTENSION DE restaurant_settings
-- =====================================================

ALTER TABLE restaurant_settings ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE restaurant_settings ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'Europe/Paris';
ALTER TABLE restaurant_settings ADD COLUMN IF NOT EXISTS currency TEXT DEFAULT 'EUR';
ALTER TABLE restaurant_settings ADD COLUMN IF NOT EXISTS default_language TEXT DEFAULT 'fr';

-- Index pour les lookups n8n (si pas déjà existants)
CREATE INDEX IF NOT EXISTS idx_restaurant_settings_whatsapp_business_id 
  ON restaurant_settings(whatsapp_business_id) WHERE whatsapp_business_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_restaurant_settings_phone_number_id 
  ON restaurant_settings(phone_number_id) WHERE phone_number_id IS NOT NULL;

-- =====================================================
-- PHASE 3: TABLE PRODUCTS (remplace sheet_id_catalog)
-- =====================================================

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurant_settings(id) ON DELETE CASCADE,
  
  product_id TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  ingredient TEXT[],
  
  unit_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'EUR',
  vat_rate NUMERIC(5,2) DEFAULT 10.00,
  
  is_active BOOLEAN NOT NULL DEFAULT true,
  
  tags TEXT[],
  allergens TEXT[],
  sort_order INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  CONSTRAINT uq_products_restaurant_product_id UNIQUE(restaurant_id, product_id)
);

CREATE INDEX idx_products_restaurant_id ON products(restaurant_id);
CREATE INDEX idx_products_category ON products(restaurant_id, category);
CREATE INDEX idx_products_is_active ON products(restaurant_id, is_active);

-- Trigger updated_at
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- PHASE 4: TABLE ADDONS (remplace sheet_id_addons)
-- =====================================================

CREATE TABLE addons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurant_settings(id) ON DELETE CASCADE,
  
  addon_id TEXT NOT NULL,
  label TEXT NOT NULL,
  price NUMERIC(10,2) NOT NULL DEFAULT 0,
  
  applies_to_type addon_applies_to NOT NULL DEFAULT 'global',
  applies_to_value TEXT,
  max_per_item INTEGER DEFAULT 1,
  
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  CONSTRAINT uq_addons_restaurant_addon_id UNIQUE(restaurant_id, addon_id)
);

CREATE INDEX idx_addons_restaurant_id ON addons(restaurant_id);
CREATE INDEX idx_addons_applies_to ON addons(restaurant_id, applies_to_type, applies_to_value);

CREATE TRIGGER update_addons_updated_at
  BEFORE UPDATE ON addons
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- PHASE 5: TABLES MENUS + MENU_CHOICES (remplace sheet_id_menus)
-- =====================================================

CREATE TABLE chatbot_menus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurant_settings(id) ON DELETE CASCADE,
  
  menu_id TEXT NOT NULL,
  label TEXT NOT NULL,
  description TEXT,
  menu_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  
  available_days TEXT,
  start_time TIME,
  end_time TIME,
  
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  CONSTRAINT uq_menus_restaurant_menu_id UNIQUE(restaurant_id, menu_id)
);

CREATE TABLE chatbot_menu_choices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  menu_id UUID NOT NULL REFERENCES chatbot_menus(id) ON DELETE CASCADE,
  
  choice_index INTEGER NOT NULL,
  choice_label TEXT NOT NULL,
  product_ids TEXT[] NOT NULL,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  CONSTRAINT uq_menu_choices_menu_index UNIQUE(menu_id, choice_index)
);

CREATE INDEX idx_chatbot_menus_restaurant_id ON chatbot_menus(restaurant_id);
CREATE INDEX idx_chatbot_menu_choices_menu_id ON chatbot_menu_choices(menu_id);

CREATE TRIGGER update_chatbot_menus_updated_at
  BEFORE UPDATE ON chatbot_menus
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- PHASE 6: TABLE CUSTOMERS
-- =====================================================

CREATE TABLE customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurant_settings(id) ON DELETE CASCADE,
  
  phone TEXT NOT NULL,
  phone_normalized TEXT GENERATED ALWAYS AS (
    regexp_replace(phone, '[^0-9+]', '', 'g')
  ) STORED,
  
  name TEXT,
  language TEXT DEFAULT 'fr',
  
  preferences JSONB DEFAULT '{}',
  last_order_summary JSONB,
  total_orders INTEGER DEFAULT 0,
  total_spent NUMERIC(10,2) DEFAULT 0,
  
  first_interaction_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_interaction_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  CONSTRAINT uq_customers_restaurant_phone UNIQUE(restaurant_id, phone)
);

CREATE INDEX idx_customers_restaurant_id ON customers(restaurant_id);
CREATE INDEX idx_customers_phone ON customers(restaurant_id, phone_normalized);
CREATE INDEX idx_customers_last_interaction ON customers(restaurant_id, last_interaction_at DESC);

CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON customers
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- PHASE 7: TABLE MESSAGES (remplace sheet_id_analytics_message)
-- =====================================================

CREATE TABLE chatbot_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurant_settings(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  
  direction message_direction NOT NULL,
  message_type message_type NOT NULL DEFAULT 'text',
  
  body TEXT,
  transcription TEXT,
  raw_payload JSONB,
  
  ai_response JSONB,
  ai_model TEXT,
  
  from_number TEXT NOT NULL,
  to_number TEXT NOT NULL,
  whatsapp_message_id TEXT,
  
  session_id TEXT,
  status TEXT DEFAULT 'sent',
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX idx_chatbot_messages_whatsapp_id ON chatbot_messages(whatsapp_message_id) WHERE whatsapp_message_id IS NOT NULL;
CREATE INDEX idx_chatbot_messages_restaurant_id ON chatbot_messages(restaurant_id);
CREATE INDEX idx_chatbot_messages_customer_id ON chatbot_messages(customer_id);
CREATE INDEX idx_chatbot_messages_session_id ON chatbot_messages(restaurant_id, session_id);
CREATE INDEX idx_chatbot_messages_created_at ON chatbot_messages(restaurant_id, created_at DESC);
CREATE INDEX idx_chatbot_messages_from_number ON chatbot_messages(restaurant_id, from_number);

-- =====================================================
-- PHASE 8: TABLES ORDERS + ORDER_ITEMS (remplace sheet_id_cart)
-- =====================================================

CREATE TABLE chatbot_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurant_settings(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  
  order_number TEXT NOT NULL,
  
  customer_name TEXT,
  customer_phone TEXT NOT NULL,
  
  status order_status NOT NULL DEFAULT 'pending',
  order_type order_type_enum NOT NULL DEFAULT 'pickup',
  checkout_stage TEXT,
  
  subtotal NUMERIC(10,2) DEFAULT 0,
  total_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  currency TEXT DEFAULT 'EUR',
  
  fulfillment_mode TEXT,
  fulfillment_first_name TEXT,
  fulfillment_last_name TEXT,
  fulfillment_arrival_time TIMESTAMPTZ,
  fulfillment_address TEXT,
  fulfillment_postal_code TEXT,
  fulfillment_city TEXT,
  
  source_message_id UUID REFERENCES chatbot_messages(id),
  notes TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  confirmed_at TIMESTAMPTZ,
  ready_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  
  CONSTRAINT uq_orders_restaurant_number UNIQUE(restaurant_id, order_number)
);

CREATE TABLE chatbot_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES chatbot_orders(id) ON DELETE CASCADE,
  
  item_type TEXT NOT NULL DEFAULT 'product',
  product_id TEXT NOT NULL,
  product_name TEXT NOT NULL,
  
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price NUMERIC(10,2) NOT NULL,
  line_total NUMERIC(10,2) NOT NULL,
  
  addons JSONB DEFAULT '[]',
  menu_choices JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_chatbot_orders_restaurant_id ON chatbot_orders(restaurant_id);
CREATE INDEX idx_chatbot_orders_customer_id ON chatbot_orders(customer_id);
CREATE INDEX idx_chatbot_orders_status ON chatbot_orders(restaurant_id, status);
CREATE INDEX idx_chatbot_orders_created_at ON chatbot_orders(restaurant_id, created_at DESC);
CREATE INDEX idx_chatbot_order_items_order_id ON chatbot_order_items(order_id);

CREATE TRIGGER update_chatbot_orders_updated_at
  BEFORE UPDATE ON chatbot_orders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- PHASE 9: TABLE RESERVATIONS
-- =====================================================

CREATE TABLE chatbot_reservations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurant_settings(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  
  reservation_datetime TIMESTAMPTZ NOT NULL,
  number_of_people INTEGER NOT NULL DEFAULT 2,
  
  status reservation_status NOT NULL DEFAULT 'pending',
  
  notes TEXT,
  special_requests TEXT,
  
  source TEXT DEFAULT 'whatsapp',
  source_message_id UUID REFERENCES chatbot_messages(id),
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  confirmed_at TIMESTAMPTZ,
  cancelled_at TIMESTAMPTZ
);

CREATE INDEX idx_chatbot_reservations_restaurant_id ON chatbot_reservations(restaurant_id);
CREATE INDEX idx_chatbot_reservations_datetime ON chatbot_reservations(restaurant_id, reservation_datetime);
CREATE INDEX idx_chatbot_reservations_status ON chatbot_reservations(restaurant_id, status);
CREATE INDEX idx_chatbot_reservations_customer_phone ON chatbot_reservations(restaurant_id, customer_phone);

CREATE TRIGGER update_chatbot_reservations_updated_at
  BEFORE UPDATE ON chatbot_reservations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- PHASE 10: TABLE ANALYTICS_EVENTS
-- =====================================================

CREATE TABLE analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  restaurant_id UUID NOT NULL REFERENCES restaurant_settings(id) ON DELETE CASCADE,
  
  event_type TEXT NOT NULL,
  event_data JSONB DEFAULT '{}',
  
  customer_id UUID REFERENCES customers(id),
  order_id UUID REFERENCES chatbot_orders(id),
  message_id UUID REFERENCES chatbot_messages(id),
  reservation_id UUID REFERENCES chatbot_reservations(id),
  
  session_id TEXT,
  
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  event_date DATE GENERATED ALWAYS AS (DATE(occurred_at AT TIME ZONE 'Europe/Paris')) STORED,
  event_hour INTEGER GENERATED ALWAYS AS (EXTRACT(HOUR FROM occurred_at AT TIME ZONE 'Europe/Paris')::INTEGER) STORED
);

CREATE INDEX idx_analytics_events_restaurant_id ON analytics_events(restaurant_id);
CREATE INDEX idx_analytics_events_event_type ON analytics_events(restaurant_id, event_type);
CREATE INDEX idx_analytics_events_occurred_at ON analytics_events(restaurant_id, occurred_at DESC);
CREATE INDEX idx_analytics_events_event_date ON analytics_events(restaurant_id, event_date);

-- =====================================================
-- PHASE 11: ROW LEVEL SECURITY
-- =====================================================

-- Activer RLS sur toutes les nouvelles tables
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE addons ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_menus ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_menu_choices ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE chatbot_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Block anonymous access
CREATE POLICY "Block anonymous access to products" ON products FOR ALL USING (false);
CREATE POLICY "Block anonymous access to addons" ON addons FOR ALL USING (false);
CREATE POLICY "Block anonymous access to chatbot_menus" ON chatbot_menus FOR ALL USING (false);
CREATE POLICY "Block anonymous access to chatbot_menu_choices" ON chatbot_menu_choices FOR ALL USING (false);
CREATE POLICY "Block anonymous access to customers" ON customers FOR ALL USING (false);
CREATE POLICY "Block anonymous access to chatbot_messages" ON chatbot_messages FOR ALL USING (false);
CREATE POLICY "Block anonymous access to chatbot_orders" ON chatbot_orders FOR ALL USING (false);
CREATE POLICY "Block anonymous access to chatbot_order_items" ON chatbot_order_items FOR ALL USING (false);
CREATE POLICY "Block anonymous access to chatbot_reservations" ON chatbot_reservations FOR ALL USING (false);
CREATE POLICY "Block anonymous access to analytics_events" ON analytics_events FOR ALL USING (false);

-- Admins can manage all
CREATE POLICY "Admins can manage products" ON products FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admins can manage addons" ON addons FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admins can manage chatbot_menus" ON chatbot_menus FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admins can manage chatbot_menu_choices" ON chatbot_menu_choices FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admins can manage customers" ON customers FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admins can manage chatbot_messages" ON chatbot_messages FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admins can manage chatbot_orders" ON chatbot_orders FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admins can manage chatbot_order_items" ON chatbot_order_items FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admins can manage chatbot_reservations" ON chatbot_reservations FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Admins can manage analytics_events" ON analytics_events FOR ALL USING (is_admin()) WITH CHECK (is_admin());

-- Users can view/manage their own restaurant data
CREATE POLICY "Users can view their products" ON products FOR SELECT 
  USING (restaurant_id IN (SELECT id FROM restaurant_settings WHERE user_id = auth.uid()));
CREATE POLICY "Users can manage their products" ON products FOR ALL 
  USING (restaurant_id IN (SELECT id FROM restaurant_settings WHERE user_id = auth.uid()))
  WITH CHECK (restaurant_id IN (SELECT id FROM restaurant_settings WHERE user_id = auth.uid()));

CREATE POLICY "Users can view their addons" ON addons FOR SELECT 
  USING (restaurant_id IN (SELECT id FROM restaurant_settings WHERE user_id = auth.uid()));
CREATE POLICY "Users can manage their addons" ON addons FOR ALL 
  USING (restaurant_id IN (SELECT id FROM restaurant_settings WHERE user_id = auth.uid()))
  WITH CHECK (restaurant_id IN (SELECT id FROM restaurant_settings WHERE user_id = auth.uid()));

CREATE POLICY "Users can view their menus" ON chatbot_menus FOR SELECT 
  USING (restaurant_id IN (SELECT id FROM restaurant_settings WHERE user_id = auth.uid()));
CREATE POLICY "Users can manage their menus" ON chatbot_menus FOR ALL 
  USING (restaurant_id IN (SELECT id FROM restaurant_settings WHERE user_id = auth.uid()))
  WITH CHECK (restaurant_id IN (SELECT id FROM restaurant_settings WHERE user_id = auth.uid()));

CREATE POLICY "Users can view their menu choices" ON chatbot_menu_choices FOR SELECT 
  USING (menu_id IN (SELECT id FROM chatbot_menus WHERE restaurant_id IN (SELECT id FROM restaurant_settings WHERE user_id = auth.uid())));
CREATE POLICY "Users can manage their menu choices" ON chatbot_menu_choices FOR ALL 
  USING (menu_id IN (SELECT id FROM chatbot_menus WHERE restaurant_id IN (SELECT id FROM restaurant_settings WHERE user_id = auth.uid())))
  WITH CHECK (menu_id IN (SELECT id FROM chatbot_menus WHERE restaurant_id IN (SELECT id FROM restaurant_settings WHERE user_id = auth.uid())));

CREATE POLICY "Users can view their customers" ON customers FOR SELECT 
  USING (restaurant_id IN (SELECT id FROM restaurant_settings WHERE user_id = auth.uid()));
CREATE POLICY "Users can manage their customers" ON customers FOR ALL 
  USING (restaurant_id IN (SELECT id FROM restaurant_settings WHERE user_id = auth.uid()))
  WITH CHECK (restaurant_id IN (SELECT id FROM restaurant_settings WHERE user_id = auth.uid()));

CREATE POLICY "Users can view their messages" ON chatbot_messages FOR SELECT 
  USING (restaurant_id IN (SELECT id FROM restaurant_settings WHERE user_id = auth.uid()));
CREATE POLICY "Users can manage their messages" ON chatbot_messages FOR ALL 
  USING (restaurant_id IN (SELECT id FROM restaurant_settings WHERE user_id = auth.uid()))
  WITH CHECK (restaurant_id IN (SELECT id FROM restaurant_settings WHERE user_id = auth.uid()));

CREATE POLICY "Users can view their orders" ON chatbot_orders FOR SELECT 
  USING (restaurant_id IN (SELECT id FROM restaurant_settings WHERE user_id = auth.uid()));
CREATE POLICY "Users can manage their orders" ON chatbot_orders FOR ALL 
  USING (restaurant_id IN (SELECT id FROM restaurant_settings WHERE user_id = auth.uid()))
  WITH CHECK (restaurant_id IN (SELECT id FROM restaurant_settings WHERE user_id = auth.uid()));

CREATE POLICY "Users can view their order items" ON chatbot_order_items FOR SELECT 
  USING (order_id IN (SELECT id FROM chatbot_orders WHERE restaurant_id IN (SELECT id FROM restaurant_settings WHERE user_id = auth.uid())));
CREATE POLICY "Users can manage their order items" ON chatbot_order_items FOR ALL 
  USING (order_id IN (SELECT id FROM chatbot_orders WHERE restaurant_id IN (SELECT id FROM restaurant_settings WHERE user_id = auth.uid())))
  WITH CHECK (order_id IN (SELECT id FROM chatbot_orders WHERE restaurant_id IN (SELECT id FROM restaurant_settings WHERE user_id = auth.uid())));

CREATE POLICY "Users can view their reservations" ON chatbot_reservations FOR SELECT 
  USING (restaurant_id IN (SELECT id FROM restaurant_settings WHERE user_id = auth.uid()));
CREATE POLICY "Users can manage their reservations" ON chatbot_reservations FOR ALL 
  USING (restaurant_id IN (SELECT id FROM restaurant_settings WHERE user_id = auth.uid()))
  WITH CHECK (restaurant_id IN (SELECT id FROM restaurant_settings WHERE user_id = auth.uid()));

CREATE POLICY "Users can view their analytics" ON analytics_events FOR SELECT 
  USING (restaurant_id IN (SELECT id FROM restaurant_settings WHERE user_id = auth.uid()));
CREATE POLICY "Users can insert their analytics" ON analytics_events FOR INSERT 
  WITH CHECK (restaurant_id IN (SELECT id FROM restaurant_settings WHERE user_id = auth.uid()));