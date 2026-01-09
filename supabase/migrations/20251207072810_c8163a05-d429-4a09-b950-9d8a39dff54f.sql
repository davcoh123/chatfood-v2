-- =====================================================
-- RPC: update_order_status
-- Met à jour le statut d'une commande avec timestamps
-- =====================================================
CREATE OR REPLACE FUNCTION public.update_order_status(
  p_order_id UUID,
  p_status TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_old_status TEXT;
  v_order_number TEXT;
  v_restaurant_id UUID;
  v_customer_id UUID;
BEGIN
  -- Récupérer l'ancien statut et les infos de la commande
  SELECT status::TEXT, order_number, restaurant_id, customer_id
  INTO v_old_status, v_order_number, v_restaurant_id, v_customer_id
  FROM chatbot_orders
  WHERE id = p_order_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Order not found'
    );
  END IF;
  
  -- Valider le nouveau statut
  IF p_status NOT IN ('pending', 'confirmed', 'preparing', 'ready', 'delivered', 'cancelled') THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Invalid status: ' || p_status
    );
  END IF;
  
  -- Mettre à jour le statut et les timestamps appropriés
  UPDATE chatbot_orders
  SET 
    status = p_status::order_status,
    updated_at = now(),
    confirmed_at = CASE WHEN p_status = 'confirmed' AND confirmed_at IS NULL THEN now() ELSE confirmed_at END,
    ready_at = CASE WHEN p_status = 'ready' AND ready_at IS NULL THEN now() ELSE ready_at END,
    delivered_at = CASE WHEN p_status = 'delivered' AND delivered_at IS NULL THEN now() ELSE delivered_at END
  WHERE id = p_order_id;
  
  -- Logger l'événement analytics
  INSERT INTO analytics_events (restaurant_id, event_type, event_data, customer_id, order_id)
  VALUES (
    v_restaurant_id,
    'order_status_updated',
    jsonb_build_object(
      'order_number', v_order_number,
      'old_status', v_old_status,
      'new_status', p_status
    ),
    v_customer_id,
    p_order_id
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'order_id', p_order_id,
    'order_number', v_order_number,
    'old_status', v_old_status,
    'new_status', p_status,
    'updated_at', now()
  );
END;
$$;

-- =====================================================
-- RPC: create_reservation
-- Crée une réservation depuis WhatsApp
-- =====================================================
CREATE OR REPLACE FUNCTION public.create_reservation(
  p_restaurant_id UUID,
  p_customer_phone TEXT,
  p_customer_name TEXT,
  p_reservation_datetime TIMESTAMPTZ,
  p_number_of_people INTEGER DEFAULT 2,
  p_customer_email TEXT DEFAULT NULL,
  p_special_requests TEXT DEFAULT NULL,
  p_notes TEXT DEFAULT NULL,
  p_source TEXT DEFAULT 'whatsapp',
  p_source_message_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_customer_id UUID;
  v_reservation_id UUID;
BEGIN
  -- Créer ou mettre à jour le client
  INSERT INTO customers (restaurant_id, phone, name)
  VALUES (p_restaurant_id, p_customer_phone, p_customer_name)
  ON CONFLICT (restaurant_id, phone)
  DO UPDATE SET
    name = COALESCE(NULLIF(EXCLUDED.name, ''), customers.name),
    last_interaction_at = now(),
    updated_at = now()
  RETURNING id INTO v_customer_id;
  
  -- Créer la réservation
  INSERT INTO chatbot_reservations (
    restaurant_id,
    customer_id,
    customer_name,
    customer_phone,
    customer_email,
    reservation_datetime,
    number_of_people,
    special_requests,
    notes,
    source,
    source_message_id,
    status
  )
  VALUES (
    p_restaurant_id,
    v_customer_id,
    p_customer_name,
    p_customer_phone,
    p_customer_email,
    p_reservation_datetime,
    p_number_of_people,
    p_special_requests,
    p_notes,
    p_source,
    p_source_message_id,
    'pending'
  )
  RETURNING id INTO v_reservation_id;
  
  -- Logger l'événement analytics
  INSERT INTO analytics_events (restaurant_id, event_type, event_data, customer_id, reservation_id)
  VALUES (
    p_restaurant_id,
    'reservation_created',
    jsonb_build_object(
      'reservation_datetime', p_reservation_datetime,
      'number_of_people', p_number_of_people,
      'source', p_source
    ),
    v_customer_id,
    v_reservation_id
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'reservation_id', v_reservation_id,
    'customer_id', v_customer_id,
    'reservation_datetime', p_reservation_datetime,
    'number_of_people', p_number_of_people,
    'status', 'pending'
  );
END;
$$;

-- =====================================================
-- RPC: update_reservation_status
-- Met à jour le statut d'une réservation
-- =====================================================
CREATE OR REPLACE FUNCTION public.update_reservation_status(
  p_reservation_id UUID,
  p_status TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_old_status TEXT;
  v_restaurant_id UUID;
  v_customer_id UUID;
BEGIN
  -- Récupérer l'ancien statut
  SELECT status::TEXT, restaurant_id, customer_id
  INTO v_old_status, v_restaurant_id, v_customer_id
  FROM chatbot_reservations
  WHERE id = p_reservation_id;
  
  IF NOT FOUND THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Reservation not found'
    );
  END IF;
  
  -- Valider le nouveau statut
  IF p_status NOT IN ('pending', 'confirmed', 'cancelled', 'completed', 'no_show') THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Invalid status: ' || p_status
    );
  END IF;
  
  -- Mettre à jour le statut et les timestamps
  UPDATE chatbot_reservations
  SET 
    status = p_status::reservation_status,
    updated_at = now(),
    confirmed_at = CASE WHEN p_status = 'confirmed' AND confirmed_at IS NULL THEN now() ELSE confirmed_at END,
    cancelled_at = CASE WHEN p_status = 'cancelled' AND cancelled_at IS NULL THEN now() ELSE cancelled_at END
  WHERE id = p_reservation_id;
  
  -- Logger l'événement analytics
  INSERT INTO analytics_events (restaurant_id, event_type, event_data, customer_id, reservation_id)
  VALUES (
    v_restaurant_id,
    'reservation_status_updated',
    jsonb_build_object(
      'old_status', v_old_status,
      'new_status', p_status
    ),
    v_customer_id,
    p_reservation_id
  );
  
  RETURN jsonb_build_object(
    'success', true,
    'reservation_id', p_reservation_id,
    'old_status', v_old_status,
    'new_status', p_status,
    'updated_at', now()
  );
END;
$$;