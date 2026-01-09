-- ============================================
-- ÉTAPE 1: Supprimer les anciennes policies RLS qui référencent restaurant_id
-- ============================================

-- Products
DROP POLICY IF EXISTS "Users can view their products" ON products;
DROP POLICY IF EXISTS "Users can manage their products" ON products;
DROP POLICY IF EXISTS "Admins can manage products" ON products;
DROP POLICY IF EXISTS "Block anonymous access to products" ON products;

-- Addons
DROP POLICY IF EXISTS "Users can view their addons" ON addons;
DROP POLICY IF EXISTS "Users can manage their addons" ON addons;
DROP POLICY IF EXISTS "Admins can manage addons" ON addons;
DROP POLICY IF EXISTS "Block anonymous access to addons" ON addons;

-- Chatbot Menus
DROP POLICY IF EXISTS "Users can view their menus" ON chatbot_menus;
DROP POLICY IF EXISTS "Users can manage their menus" ON chatbot_menus;
DROP POLICY IF EXISTS "Admins can manage chatbot_menus" ON chatbot_menus;
DROP POLICY IF EXISTS "Block anonymous access to chatbot_menus" ON chatbot_menus;

-- Customers
DROP POLICY IF EXISTS "Users can view their customers" ON customers;
DROP POLICY IF EXISTS "Users can manage their customers" ON customers;
DROP POLICY IF EXISTS "Admins can manage customers" ON customers;
DROP POLICY IF EXISTS "Block anonymous access to customers" ON customers;

-- Chatbot Messages
DROP POLICY IF EXISTS "Users can view their messages" ON chatbot_messages;
DROP POLICY IF EXISTS "Users can manage their messages" ON chatbot_messages;
DROP POLICY IF EXISTS "Admins can manage chatbot_messages" ON chatbot_messages;
DROP POLICY IF EXISTS "Block anonymous access to chatbot_messages" ON chatbot_messages;

-- Chatbot Orders
DROP POLICY IF EXISTS "Users can view their orders" ON chatbot_orders;
DROP POLICY IF EXISTS "Users can manage their orders" ON chatbot_orders;
DROP POLICY IF EXISTS "Admins can manage chatbot_orders" ON chatbot_orders;
DROP POLICY IF EXISTS "Block anonymous access to chatbot_orders" ON chatbot_orders;

-- Chatbot Reservations
DROP POLICY IF EXISTS "Users can view their reservations" ON chatbot_reservations;
DROP POLICY IF EXISTS "Users can manage their reservations" ON chatbot_reservations;
DROP POLICY IF EXISTS "Admins can manage chatbot_reservations" ON chatbot_reservations;
DROP POLICY IF EXISTS "Block anonymous access to chatbot_reservations" ON chatbot_reservations;

-- Analytics Events
DROP POLICY IF EXISTS "Users can view their analytics" ON analytics_events;
DROP POLICY IF EXISTS "Users can insert their analytics" ON analytics_events;
DROP POLICY IF EXISTS "Admins can manage analytics_events" ON analytics_events;
DROP POLICY IF EXISTS "Block anonymous access to analytics_events" ON analytics_events;

-- Chatbot Menu Choices
DROP POLICY IF EXISTS "Users can view their menu choices" ON chatbot_menu_choices;
DROP POLICY IF EXISTS "Users can manage their menu choices" ON chatbot_menu_choices;
DROP POLICY IF EXISTS "Admins can manage chatbot_menu_choices" ON chatbot_menu_choices;
DROP POLICY IF EXISTS "Block anonymous access to chatbot_menu_choices" ON chatbot_menu_choices;

-- Chatbot Order Items
DROP POLICY IF EXISTS "Users can view their order items" ON chatbot_order_items;
DROP POLICY IF EXISTS "Users can manage their order items" ON chatbot_order_items;
DROP POLICY IF EXISTS "Admins can manage chatbot_order_items" ON chatbot_order_items;
DROP POLICY IF EXISTS "Block anonymous access to chatbot_order_items" ON chatbot_order_items;

-- ============================================
-- ÉTAPE 2: Supprimer les colonnes obsolètes
-- ============================================

-- Products: supprimer product_id et restaurant_id
ALTER TABLE products DROP COLUMN IF EXISTS product_id;
ALTER TABLE products DROP COLUMN IF EXISTS restaurant_id;

-- Addons: supprimer addon_id et restaurant_id
ALTER TABLE addons DROP COLUMN IF EXISTS addon_id;
ALTER TABLE addons DROP COLUMN IF EXISTS restaurant_id;

-- Chatbot Menus: supprimer menu_id et restaurant_id
ALTER TABLE chatbot_menus DROP COLUMN IF EXISTS menu_id;
ALTER TABLE chatbot_menus DROP COLUMN IF EXISTS restaurant_id;

-- Customers: supprimer restaurant_id
ALTER TABLE customers DROP COLUMN IF EXISTS restaurant_id;

-- Chatbot Messages: supprimer restaurant_id
ALTER TABLE chatbot_messages DROP COLUMN IF EXISTS restaurant_id;

-- Chatbot Orders: supprimer restaurant_id
ALTER TABLE chatbot_orders DROP COLUMN IF EXISTS restaurant_id;

-- Chatbot Reservations: supprimer restaurant_id
ALTER TABLE chatbot_reservations DROP COLUMN IF EXISTS restaurant_id;

-- Analytics Events: supprimer restaurant_id
ALTER TABLE analytics_events DROP COLUMN IF EXISTS restaurant_id;

-- ============================================
-- ÉTAPE 3: Créer les nouvelles policies RLS avec user_id
-- ============================================

-- Products
CREATE POLICY "Users can view their products" ON products FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can manage their products" ON products FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins can manage products" ON products FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Block anonymous access to products" ON products FOR ALL USING (auth.uid() IS NOT NULL);

-- Addons
CREATE POLICY "Users can view their addons" ON addons FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can manage their addons" ON addons FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins can manage addons" ON addons FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Block anonymous access to addons" ON addons FOR ALL USING (auth.uid() IS NOT NULL);

-- Chatbot Menus
CREATE POLICY "Users can view their menus" ON chatbot_menus FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can manage their menus" ON chatbot_menus FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins can manage chatbot_menus" ON chatbot_menus FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Block anonymous access to chatbot_menus" ON chatbot_menus FOR ALL USING (auth.uid() IS NOT NULL);

-- Customers
CREATE POLICY "Users can view their customers" ON customers FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can manage their customers" ON customers FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins can manage customers" ON customers FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Block anonymous access to customers" ON customers FOR ALL USING (auth.uid() IS NOT NULL);

-- Chatbot Messages
CREATE POLICY "Users can view their messages" ON chatbot_messages FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can manage their messages" ON chatbot_messages FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins can manage chatbot_messages" ON chatbot_messages FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Block anonymous access to chatbot_messages" ON chatbot_messages FOR ALL USING (auth.uid() IS NOT NULL);

-- Chatbot Orders
CREATE POLICY "Users can view their orders" ON chatbot_orders FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can manage their orders" ON chatbot_orders FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins can manage chatbot_orders" ON chatbot_orders FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Block anonymous access to chatbot_orders" ON chatbot_orders FOR ALL USING (auth.uid() IS NOT NULL);

-- Chatbot Reservations
CREATE POLICY "Users can view their reservations" ON chatbot_reservations FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can manage their reservations" ON chatbot_reservations FOR ALL USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins can manage chatbot_reservations" ON chatbot_reservations FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Block anonymous access to chatbot_reservations" ON chatbot_reservations FOR ALL USING (auth.uid() IS NOT NULL);

-- Analytics Events
CREATE POLICY "Users can view their analytics" ON analytics_events FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can insert their analytics" ON analytics_events FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "Admins can manage analytics_events" ON analytics_events FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Block anonymous access to analytics_events" ON analytics_events FOR ALL USING (auth.uid() IS NOT NULL);

-- Chatbot Menu Choices (via menu_id join)
CREATE POLICY "Users can view their menu choices" ON chatbot_menu_choices FOR SELECT 
  USING (menu_id IN (SELECT id FROM chatbot_menus WHERE user_id = auth.uid()));
CREATE POLICY "Users can manage their menu choices" ON chatbot_menu_choices FOR ALL 
  USING (menu_id IN (SELECT id FROM chatbot_menus WHERE user_id = auth.uid()))
  WITH CHECK (menu_id IN (SELECT id FROM chatbot_menus WHERE user_id = auth.uid()));
CREATE POLICY "Admins can manage chatbot_menu_choices" ON chatbot_menu_choices FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Block anonymous access to chatbot_menu_choices" ON chatbot_menu_choices FOR ALL USING (auth.uid() IS NOT NULL);

-- Chatbot Order Items (via order_id join)
CREATE POLICY "Users can view their order items" ON chatbot_order_items FOR SELECT 
  USING (order_id IN (SELECT id FROM chatbot_orders WHERE user_id = auth.uid()));
CREATE POLICY "Users can manage their order items" ON chatbot_order_items FOR ALL 
  USING (order_id IN (SELECT id FROM chatbot_orders WHERE user_id = auth.uid()))
  WITH CHECK (order_id IN (SELECT id FROM chatbot_orders WHERE user_id = auth.uid()));
CREATE POLICY "Admins can manage chatbot_order_items" ON chatbot_order_items FOR ALL USING (is_admin()) WITH CHECK (is_admin());
CREATE POLICY "Block anonymous access to chatbot_order_items" ON chatbot_order_items FOR ALL USING (auth.uid() IS NOT NULL);