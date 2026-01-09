-- =====================================================
-- RPC FUNCTIONS FOR N8N AI AGENT TOOLS
-- Replaces Google Sheets Tools with Supabase queries
-- =====================================================

-- =====================================================
-- 1. GET_CATALOG - Replaces "catalogue" tool
-- Returns all active products for a restaurant
-- =====================================================
CREATE OR REPLACE FUNCTION public.get_catalog(p_restaurant_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'product_id', p.product_id,
      'name', p.name,
      'description', COALESCE(p.description, ''),
      'category', p.category,
      'ingredient', COALESCE(p.ingredient, ARRAY[]::TEXT[]),
      'unit_price', p.unit_price,
      'currency', COALESCE(p.currency, 'EUR'),
      'vat_rate', COALESCE(p.vat_rate, 10.00),
      'is_active', p.is_active,
      'tags', COALESCE(p.tags, ARRAY[]::TEXT[]),
      'allergens', COALESCE(p.allergens, ARRAY[]::TEXT[])
    )
    ORDER BY p.category, p.sort_order NULLS LAST, p.name
  ), '[]'::JSONB)
  INTO result
  FROM products p
  WHERE p.restaurant_id = p_restaurant_id
    AND p.is_active = true;
  
  RETURN result;
END;
$$;

-- =====================================================
-- 2. GET_CUSTOMER_HISTORY - Replaces "data" tool
-- Returns customer profile, last orders, recent messages
-- =====================================================
CREATE OR REPLACE FUNCTION public.get_customer_history(
  p_restaurant_id UUID,
  p_phone TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_customer_id UUID;
  v_customer JSONB;
  v_last_orders JSONB;
  v_recent_messages JSONB;
  v_normalized_phone TEXT;
BEGIN
  -- Normalize phone number
  v_normalized_phone := regexp_replace(p_phone, '[^0-9+]', '', 'g');
  
  -- Find customer
  SELECT id INTO v_customer_id
  FROM customers
  WHERE restaurant_id = p_restaurant_id
    AND (phone = p_phone OR phone_normalized = v_normalized_phone)
  LIMIT 1;
  
  -- If customer found, get their info
  IF v_customer_id IS NOT NULL THEN
    -- Customer profile
    SELECT jsonb_build_object(
      'id', c.id,
      'name', c.name,
      'phone', c.phone,
      'language', c.language,
      'preferences', c.preferences,
      'last_order_summary', c.last_order_summary,
      'total_orders', c.total_orders,
      'total_spent', c.total_spent,
      'first_interaction_at', c.first_interaction_at,
      'last_interaction_at', c.last_interaction_at
    )
    INTO v_customer
    FROM customers c
    WHERE c.id = v_customer_id;
    
    -- Last 5 orders with items
    SELECT COALESCE(jsonb_agg(order_data), '[]'::JSONB)
    INTO v_last_orders
    FROM (
      SELECT jsonb_build_object(
        'order_id', o.id,
        'order_number', o.order_number,
        'status', o.status,
        'order_type', o.order_type,
        'total_amount', o.total_amount,
        'created_at', o.created_at,
        'items', COALESCE((
          SELECT jsonb_agg(jsonb_build_object(
            'product_id', oi.product_id,
            'product_name', oi.product_name,
            'quantity', oi.quantity,
            'line_total', oi.line_total,
            'addons', oi.addons,
            'menu_choices', oi.menu_choices
          ))
          FROM chatbot_order_items oi
          WHERE oi.order_id = o.id
        ), '[]'::JSONB)
      ) AS order_data
      FROM chatbot_orders o
      WHERE o.customer_id = v_customer_id
      ORDER BY o.created_at DESC
      LIMIT 5
    ) sub;
    
    -- Last 10 messages
    SELECT COALESCE(jsonb_agg(msg_data), '[]'::JSONB)
    INTO v_recent_messages
    FROM (
      SELECT jsonb_build_object(
        'direction', m.direction,
        'message_type', m.message_type,
        'body', m.body,
        'created_at', m.created_at
      ) AS msg_data
      FROM chatbot_messages m
      WHERE m.customer_id = v_customer_id
      ORDER BY m.created_at DESC
      LIMIT 10
    ) sub;
  ELSE
    v_customer := NULL;
    v_last_orders := '[]'::JSONB;
    v_recent_messages := '[]'::JSONB;
  END IF;
  
  RETURN jsonb_build_object(
    'customer', v_customer,
    'last_orders', v_last_orders,
    'recent_messages', v_recent_messages
  );
END;
$$;

-- =====================================================
-- 3. GET_ADDONS - Replaces "addons_lookup" tool
-- Returns applicable addons for product/category/global
-- =====================================================
CREATE OR REPLACE FUNCTION public.get_addons(
  p_restaurant_id UUID,
  p_product_id TEXT DEFAULT NULL,
  p_category TEXT DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'addon_id', a.addon_id,
      'label', a.label,
      'price', a.price,
      'applies_to_type', a.applies_to_type,
      'applies_to_value', a.applies_to_value,
      'max_per_item', a.max_per_item
    )
    ORDER BY a.sort_order NULLS LAST, a.label
  ), '[]'::JSONB)
  INTO result
  FROM addons a
  WHERE a.restaurant_id = p_restaurant_id
    AND a.is_active = true
    AND (
      -- Global addons always apply
      a.applies_to_type = 'global'
      -- Product-specific addons (supports pipe-separated list)
      OR (p_product_id IS NOT NULL 
          AND a.applies_to_type = 'product' 
          AND a.applies_to_value LIKE '%' || p_product_id || '%')
      -- Category addons
      OR (p_category IS NOT NULL 
          AND a.applies_to_type = 'category' 
          AND a.applies_to_value = p_category)
    );
  
  RETURN result;
END;
$$;

-- =====================================================
-- 4. GET_MENUS - Replaces "menus_lookup" tool
-- Returns active menus with their choice groups
-- =====================================================
CREATE OR REPLACE FUNCTION public.get_menus(p_restaurant_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  result JSONB;
BEGIN
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'menu_id', m.menu_id,
      'label', m.label,
      'description', COALESCE(m.description, ''),
      'menu_price', m.menu_price,
      'available_days', m.available_days,
      'start_time', m.start_time::TEXT,
      'end_time', m.end_time::TEXT,
      'choices', COALESCE((
        SELECT jsonb_agg(
          jsonb_build_object(
            'choice_index', mc.choice_index,
            'choice_label', mc.choice_label,
            'product_ids', mc.product_ids
          )
          ORDER BY mc.choice_index
        )
        FROM chatbot_menu_choices mc
        WHERE mc.menu_id = m.id
      ), '[]'::JSONB)
    )
    ORDER BY m.sort_order NULLS LAST, m.label
  ), '[]'::JSONB)
  INTO result
  FROM chatbot_menus m
  WHERE m.restaurant_id = p_restaurant_id
    AND m.is_active = true;
  
  RETURN result;
END;
$$;

-- =====================================================
-- 5. CREATE_ORDER - Replaces sheet_id_cart append
-- Creates order with items, updates customer stats
-- =====================================================
CREATE OR REPLACE FUNCTION public.create_order(
  p_restaurant_id UUID,
  p_customer_phone TEXT,
  p_customer_name TEXT DEFAULT NULL,
  p_order_type TEXT DEFAULT 'pickup',
  p_items JSONB DEFAULT '[]'::JSONB,
  p_fulfillment_mode TEXT DEFAULT NULL,
  p_fulfillment_arrival_time TIMESTAMPTZ DEFAULT NULL,
  p_fulfillment_address TEXT DEFAULT NULL,
  p_fulfillment_postal_code TEXT DEFAULT NULL,
  p_fulfillment_city TEXT DEFAULT NULL,
  p_fulfillment_first_name TEXT DEFAULT NULL,
  p_fulfillment_last_name TEXT DEFAULT NULL,
  p_notes TEXT DEFAULT NULL,
  p_source_message_id UUID DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_customer_id UUID;
  v_order_id UUID;
  v_order_number TEXT;
  v_total NUMERIC(10,2) := 0;
  v_item JSONB;
  v_next_number INTEGER;
BEGIN
  -- Create or update customer
  INSERT INTO customers (restaurant_id, phone, name)
  VALUES (p_restaurant_id, p_customer_phone, p_customer_name)
  ON CONFLICT (restaurant_id, phone) 
  DO UPDATE SET 
    name = COALESCE(NULLIF(EXCLUDED.name, ''), customers.name),
    last_interaction_at = now(),
    updated_at = now()
  RETURNING id INTO v_customer_id;
  
  -- Generate unique order number
  SELECT COALESCE(MAX(
    NULLIF(regexp_replace(order_number, '[^0-9]', '', 'g'), '')::INTEGER
  ), 0) + 1
  INTO v_next_number
  FROM chatbot_orders
  WHERE restaurant_id = p_restaurant_id;
  
  v_order_number := 'CMD-' || LPAD(v_next_number::TEXT, 4, '0');
  
  -- Create order
  INSERT INTO chatbot_orders (
    restaurant_id, customer_id, order_number,
    customer_name, customer_phone, 
    status, order_type, 
    fulfillment_mode, fulfillment_arrival_time,
    fulfillment_address, fulfillment_postal_code, fulfillment_city,
    fulfillment_first_name, fulfillment_last_name,
    notes, source_message_id
  )
  VALUES (
    p_restaurant_id, v_customer_id, v_order_number,
    p_customer_name, p_customer_phone,
    'pending', p_order_type::order_type_enum,
    p_fulfillment_mode, p_fulfillment_arrival_time,
    p_fulfillment_address, p_fulfillment_postal_code, p_fulfillment_city,
    p_fulfillment_first_name, p_fulfillment_last_name,
    p_notes, p_source_message_id
  )
  RETURNING id INTO v_order_id;
  
  -- Insert order items
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    INSERT INTO chatbot_order_items (
      order_id, item_type, product_id, product_name,
      quantity, unit_price, line_total, addons, menu_choices
    )
    VALUES (
      v_order_id,
      COALESCE(v_item->>'item_type', 'product'),
      v_item->>'product_id',
      v_item->>'product_name',
      COALESCE((v_item->>'quantity')::INTEGER, 1),
      COALESCE((v_item->>'unit_price')::NUMERIC, 0),
      COALESCE((v_item->>'line_total')::NUMERIC, 0),
      COALESCE(v_item->'addons', '[]'::JSONB),
      COALESCE(v_item->'menu_choices', '{}'::JSONB)
    );
    
    v_total := v_total + COALESCE((v_item->>'line_total')::NUMERIC, 0);
  END LOOP;
  
  -- Update order total
  UPDATE chatbot_orders 
  SET total_amount = v_total, subtotal = v_total
  WHERE id = v_order_id;
  
  -- Update customer stats
  UPDATE customers SET
    total_orders = COALESCE(total_orders, 0) + 1,
    total_spent = COALESCE(total_spent, 0) + v_total,
    last_order_summary = jsonb_build_object(
      'order_number', v_order_number,
      'total', v_total,
      'items_count', jsonb_array_length(p_items),
      'created_at', now()
    ),
    updated_at = now()
  WHERE id = v_customer_id;
  
  -- Log analytics event
  INSERT INTO analytics_events (restaurant_id, event_type, event_data, customer_id, order_id)
  VALUES (
    p_restaurant_id, 
    'order_created',
    jsonb_build_object(
      'order_number', v_order_number, 
      'total', v_total, 
      'items_count', jsonb_array_length(p_items),
      'order_type', p_order_type
    ),
    v_customer_id,
    v_order_id
  );
  
  RETURN jsonb_build_object(
    'order_id', v_order_id,
    'order_number', v_order_number,
    'total_amount', v_total,
    'customer_id', v_customer_id,
    'status', 'pending'
  );
END;
$$;

-- =====================================================
-- 6. LOG_MESSAGE - Replaces sheet_id_analytics_message append
-- Logs message and creates analytics event
-- =====================================================
CREATE OR REPLACE FUNCTION public.log_message(
  p_restaurant_id UUID,
  p_direction TEXT,
  p_message_type TEXT DEFAULT 'text',
  p_body TEXT DEFAULT NULL,
  p_from_number TEXT DEFAULT NULL,
  p_to_number TEXT DEFAULT NULL,
  p_whatsapp_message_id TEXT DEFAULT NULL,
  p_session_id TEXT DEFAULT NULL,
  p_raw_payload JSONB DEFAULT NULL,
  p_ai_response JSONB DEFAULT NULL,
  p_ai_model TEXT DEFAULT NULL,
  p_transcription TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_customer_id UUID;
  v_message_id UUID;
  v_customer_phone TEXT;
BEGIN
  -- Determine customer phone based on direction
  IF p_direction = 'inbound' THEN
    v_customer_phone := p_from_number;
  ELSE
    v_customer_phone := p_to_number;
  END IF;
  
  -- Create or get customer
  IF v_customer_phone IS NOT NULL THEN
    INSERT INTO customers (restaurant_id, phone)
    VALUES (p_restaurant_id, v_customer_phone)
    ON CONFLICT (restaurant_id, phone) 
    DO UPDATE SET last_interaction_at = now()
    RETURNING id INTO v_customer_id;
  END IF;
  
  -- Insert message
  INSERT INTO chatbot_messages (
    restaurant_id, customer_id, direction, message_type,
    body, transcription, raw_payload, ai_response, ai_model,
    from_number, to_number, whatsapp_message_id, session_id
  )
  VALUES (
    p_restaurant_id, v_customer_id, 
    p_direction::message_direction, 
    p_message_type::message_type,
    p_body, p_transcription, p_raw_payload, p_ai_response, p_ai_model,
    p_from_number, p_to_number, p_whatsapp_message_id, p_session_id
  )
  RETURNING id INTO v_message_id;
  
  -- Log analytics event
  INSERT INTO analytics_events (
    restaurant_id, event_type, event_data, 
    customer_id, message_id, session_id
  )
  VALUES (
    p_restaurant_id,
    CASE WHEN p_direction = 'inbound' THEN 'message_received' ELSE 'message_sent' END,
    jsonb_build_object(
      'message_type', p_message_type,
      'body_length', COALESCE(length(p_body), 0),
      'has_ai_response', p_ai_response IS NOT NULL,
      'has_transcription', p_transcription IS NOT NULL
    ),
    v_customer_id,
    v_message_id,
    p_session_id
  );
  
  RETURN v_message_id;
END;
$$;

-- =====================================================
-- GRANT EXECUTE permissions
-- =====================================================
GRANT EXECUTE ON FUNCTION public.get_catalog(UUID) TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION public.get_customer_history(UUID, TEXT) TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION public.get_addons(UUID, TEXT, TEXT) TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION public.get_menus(UUID) TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION public.create_order(UUID, TEXT, TEXT, TEXT, JSONB, TEXT, TIMESTAMPTZ, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, UUID) TO authenticated, anon, service_role;
GRANT EXECUTE ON FUNCTION public.log_message(UUID, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, JSONB, JSONB, TEXT, TEXT) TO authenticated, anon, service_role;