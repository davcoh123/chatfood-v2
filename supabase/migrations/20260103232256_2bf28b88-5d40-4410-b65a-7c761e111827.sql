-- Fix update_order_status: Add ownership verification
CREATE OR REPLACE FUNCTION public.update_order_status(p_order_id uuid, p_status text)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_order_record RECORD;
BEGIN
  -- Vérifier que la commande existe
  SELECT * INTO v_order_record FROM chatbot_orders WHERE id = p_order_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Commande non trouvée');
  END IF;
  
  -- Vérifier que l'utilisateur est propriétaire OU admin
  IF v_order_record.user_id != auth.uid() AND NOT is_admin() THEN
    RETURN json_build_object('success', false, 'error', 'Non autorisé: vous ne possédez pas cette commande');
  END IF;
  
  -- Mettre à jour le statut
  UPDATE chatbot_orders 
  SET 
    status = p_status,
    updated_at = NOW()
  WHERE id = p_order_id;
  
  RETURN json_build_object('success', true, 'order_id', p_order_id, 'status', p_status);
END;
$function$;

-- Fix update_reservation_status: Add ownership verification
CREATE OR REPLACE FUNCTION public.update_reservation_status(p_reservation_id uuid, p_status text)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_reservation_record RECORD;
BEGIN
  -- Vérifier que la réservation existe
  SELECT * INTO v_reservation_record FROM chatbot_reservations WHERE id = p_reservation_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Réservation non trouvée');
  END IF;
  
  -- Vérifier que l'utilisateur est propriétaire OU admin
  IF v_reservation_record.user_id != auth.uid() AND NOT is_admin() THEN
    RETURN json_build_object('success', false, 'error', 'Non autorisé: vous ne possédez pas cette réservation');
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
$function$;

-- Fix create_reservation: Add caller verification for user_id parameter
CREATE OR REPLACE FUNCTION public.create_reservation(p_user_id uuid, p_customer_phone text, p_customer_name text, p_reservation_datetime timestamp with time zone, p_number_of_people integer DEFAULT 2, p_customer_email text DEFAULT NULL::text, p_special_requests text DEFAULT NULL::text, p_notes text DEFAULT NULL::text, p_source text DEFAULT 'dashboard'::text)
 RETURNS json
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_reservation_id UUID;
  v_customer_id UUID;
BEGIN
  -- Vérifier que l'appelant est propriétaire du user_id OU admin
  IF p_user_id != auth.uid() AND NOT is_admin() THEN
    RETURN json_build_object('success', false, 'error', 'Non autorisé: vous ne pouvez pas créer une réservation pour un autre utilisateur');
  END IF;

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
$function$;