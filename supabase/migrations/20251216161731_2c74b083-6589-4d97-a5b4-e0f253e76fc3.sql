-- Révoquer l'accès anonyme aux fonctions sensibles du chatbot
-- Ces fonctions seront accessibles uniquement via Edge Function authentifiée

-- Note: On vérifie d'abord si les fonctions existent avant de révoquer
DO $$
BEGIN
  -- Révoquer get_catalog si existe
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_catalog') THEN
    EXECUTE 'REVOKE EXECUTE ON FUNCTION public.get_catalog FROM anon';
  END IF;
  
  -- Révoquer get_customer_history si existe
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_customer_history') THEN
    EXECUTE 'REVOKE EXECUTE ON FUNCTION public.get_customer_history FROM anon';
  END IF;
  
  -- Révoquer get_addons (la fonction RPC, pas la table) si existe
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_addons') THEN
    EXECUTE 'REVOKE EXECUTE ON FUNCTION public.get_addons FROM anon';
  END IF;
  
  -- Révoquer get_menus (la fonction RPC) si existe
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'get_menus') THEN
    EXECUTE 'REVOKE EXECUTE ON FUNCTION public.get_menus FROM anon';
  END IF;
  
  -- Révoquer create_order si existe
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'create_order') THEN
    EXECUTE 'REVOKE EXECUTE ON FUNCTION public.create_order FROM anon';
  END IF;
  
  -- Révoquer log_message si existe
  IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'log_message') THEN
    EXECUTE 'REVOKE EXECUTE ON FUNCTION public.log_message FROM anon';
  END IF;
END $$;