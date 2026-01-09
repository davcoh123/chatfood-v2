-- =============================================
-- PHASE 1: Ajouter user_id aux tables et migrer les données
-- =============================================

-- 1. PRODUCTS: Ajouter user_id, migrer, supprimer restaurant_id et product_id
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS user_id UUID;
UPDATE public.products p SET user_id = rs.user_id 
FROM public.restaurant_settings rs WHERE p.restaurant_id = rs.id AND p.user_id IS NULL;
ALTER TABLE public.products ALTER COLUMN user_id SET NOT NULL;

-- 2. ADDONS: Ajouter user_id, migrer, supprimer restaurant_id et addon_id
ALTER TABLE public.addons ADD COLUMN IF NOT EXISTS user_id UUID;
UPDATE public.addons a SET user_id = rs.user_id 
FROM public.restaurant_settings rs WHERE a.restaurant_id = rs.id AND a.user_id IS NULL;
ALTER TABLE public.addons ALTER COLUMN user_id SET NOT NULL;

-- 3. CHATBOT_MENUS: Ajouter user_id, migrer, supprimer restaurant_id et menu_id
ALTER TABLE public.chatbot_menus ADD COLUMN IF NOT EXISTS user_id UUID;
UPDATE public.chatbot_menus m SET user_id = rs.user_id 
FROM public.restaurant_settings rs WHERE m.restaurant_id = rs.id AND m.user_id IS NULL;
ALTER TABLE public.chatbot_menus ALTER COLUMN user_id SET NOT NULL;

-- 4. CUSTOMERS: Ajouter user_id, migrer
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS user_id UUID;
UPDATE public.customers c SET user_id = rs.user_id 
FROM public.restaurant_settings rs WHERE c.restaurant_id = rs.id AND c.user_id IS NULL;
ALTER TABLE public.customers ALTER COLUMN user_id SET NOT NULL;

-- 5. CHATBOT_MESSAGES: Ajouter user_id, migrer
ALTER TABLE public.chatbot_messages ADD COLUMN IF NOT EXISTS user_id UUID;
UPDATE public.chatbot_messages m SET user_id = rs.user_id 
FROM public.restaurant_settings rs WHERE m.restaurant_id = rs.id AND m.user_id IS NULL;
ALTER TABLE public.chatbot_messages ALTER COLUMN user_id SET NOT NULL;

-- 6. CHATBOT_ORDERS: Ajouter user_id, migrer
ALTER TABLE public.chatbot_orders ADD COLUMN IF NOT EXISTS user_id UUID;
UPDATE public.chatbot_orders o SET user_id = rs.user_id 
FROM public.restaurant_settings rs WHERE o.restaurant_id = rs.id AND o.user_id IS NULL;
ALTER TABLE public.chatbot_orders ALTER COLUMN user_id SET NOT NULL;

-- 7. CHATBOT_RESERVATIONS: Ajouter user_id, migrer
ALTER TABLE public.chatbot_reservations ADD COLUMN IF NOT EXISTS user_id UUID;
UPDATE public.chatbot_reservations r SET user_id = rs.user_id 
FROM public.restaurant_settings rs WHERE r.restaurant_id = rs.id AND r.user_id IS NULL;
ALTER TABLE public.chatbot_reservations ALTER COLUMN user_id SET NOT NULL;

-- 8. ANALYTICS_EVENTS: Ajouter user_id, migrer
ALTER TABLE public.analytics_events ADD COLUMN IF NOT EXISTS user_id UUID;
UPDATE public.analytics_events e SET user_id = rs.user_id 
FROM public.restaurant_settings rs WHERE e.restaurant_id = rs.id AND e.user_id IS NULL;
ALTER TABLE public.analytics_events ALTER COLUMN user_id SET NOT NULL;

-- =============================================
-- PHASE 2: Créer les nouvelles fonctions RPC avec user_id
-- =============================================

-- Fonction update_order_status (ne change pas, utilise order_id directement)
CREATE OR REPLACE FUNCTION public.update_order_status(
  p_order_id UUID,
  p_status TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order_record RECORD;
BEGIN
  -- Vérifier que la commande existe
  SELECT * INTO v_order_record FROM chatbot_orders WHERE id = p_order_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Commande non trouvée');
  END IF;
  
  -- Mettre à jour le statut
  UPDATE chatbot_orders 
  SET 
    status = p_status::order_status,
    updated_at = NOW(),
    confirmed_at = CASE WHEN p_status = 'confirmed' AND confirmed_at IS NULL THEN NOW() ELSE confirmed_at END,
    ready_at = CASE WHEN p_status = 'ready' AND ready_at IS NULL THEN NOW() ELSE ready_at END,
    delivered_at = CASE WHEN p_status = 'delivered' AND delivered_at IS NULL THEN NOW() ELSE delivered_at END
  WHERE id = p_order_id;
  
  RETURN json_build_object('success', true, 'order_id', p_order_id, 'status', p_status);
END;
$$;

-- Fonction create_reservation avec user_id
CREATE OR REPLACE FUNCTION public.create_reservation(
  p_user_id UUID,
  p_customer_phone TEXT,
  p_customer_name TEXT,
  p_reservation_datetime TIMESTAMP WITH TIME ZONE,
  p_number_of_people INTEGER DEFAULT 2,
  p_customer_email TEXT DEFAULT NULL,
  p_special_requests TEXT DEFAULT NULL,
  p_notes TEXT DEFAULT NULL,
  p_source TEXT DEFAULT 'dashboard'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_reservation_id UUID;
  v_customer_id UUID;
BEGIN
  -- Trouver ou créer le customer
  SELECT id INTO v_customer_id FROM customers 
  WHERE user_id = p_user_id AND phone = p_customer_phone;
  
  IF v_customer_id IS NULL THEN
    INSERT INTO customers (user_id, phone, name)
    VALUES (p_user_id, p_customer_phone, p_customer_name)
    RETURNING id INTO v_customer_id;
  END IF;
  
  -- Créer la réservation
  INSERT INTO chatbot_reservations (
    user_id, customer_id, customer_phone, customer_name,
    reservation_datetime, number_of_people, customer_email,
    special_requests, notes, source, status
  ) VALUES (
    p_user_id, v_customer_id, p_customer_phone, p_customer_name,
    p_reservation_datetime, p_number_of_people, p_customer_email,
    p_special_requests, p_notes, p_source, 'pending'
  )
  RETURNING id INTO v_reservation_id;
  
  RETURN json_build_object('success', true, 'reservation_id', v_reservation_id);
END;
$$;

-- Fonction update_reservation_status
CREATE OR REPLACE FUNCTION public.update_reservation_status(
  p_reservation_id UUID,
  p_status TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_reservation_record RECORD;
BEGIN
  -- Vérifier que la réservation existe
  SELECT * INTO v_reservation_record FROM chatbot_reservations WHERE id = p_reservation_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Réservation non trouvée');
  END IF;
  
  -- Mettre à jour le statut
  UPDATE chatbot_reservations 
  SET 
    status = p_status::reservation_status,
    updated_at = NOW(),
    confirmed_at = CASE WHEN p_status = 'confirmed' AND confirmed_at IS NULL THEN NOW() ELSE confirmed_at END,
    cancelled_at = CASE WHEN p_status = 'cancelled' AND cancelled_at IS NULL THEN NOW() ELSE cancelled_at END
  WHERE id = p_reservation_id;
  
  RETURN json_build_object('success', true, 'reservation_id', p_reservation_id, 'status', p_status);
END;
$$;