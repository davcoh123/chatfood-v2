-- Supprimer les anciennes fonctions RPC pour les recréer avec nouveaux paramètres
DROP FUNCTION IF EXISTS public.get_catalog(uuid);
DROP FUNCTION IF EXISTS public.get_addons(uuid, text, text);
DROP FUNCTION IF EXISTS public.get_menus(uuid);
DROP FUNCTION IF EXISTS public.get_customer_history(uuid, text);
DROP FUNCTION IF EXISTS public.create_order(uuid, text, text, text, jsonb, text, timestamp with time zone, text, text, text, text, text, text, uuid);
DROP FUNCTION IF EXISTS public.log_message(uuid, text, text, text, text, text, text, text, jsonb, jsonb, text, text);
DROP FUNCTION IF EXISTS public.create_reservation(uuid, text, text, timestamp with time zone, integer, text, text, text, text, uuid);
DROP FUNCTION IF EXISTS public.update_order_status(uuid, text);
DROP FUNCTION IF EXISTS public.update_reservation_status(uuid, text);