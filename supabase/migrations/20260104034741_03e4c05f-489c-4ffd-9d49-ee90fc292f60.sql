-- Fix 1: order_reviews RLS - Replace catch-all with explicit policies

-- Drop the catch-all blocking policy
DROP POLICY IF EXISTS "Block anonymous access to order reviews" ON public.order_reviews;

-- Keep existing SELECT policies (Users can view own, Admins can view all)
-- Add explicit INSERT policy (service role only via Edge Functions)
CREATE POLICY "System can insert reviews via service role"
  ON public.order_reviews FOR INSERT
  WITH CHECK (false); -- Only service role can bypass this

-- Add explicit UPDATE policy (no updates allowed)
CREATE POLICY "No updates to reviews"
  ON public.order_reviews FOR UPDATE
  USING (false);

-- Add explicit DELETE policy (no deletes allowed)
CREATE POLICY "No deletes to reviews"
  ON public.order_reviews FOR DELETE
  USING (false);

-- Fix 2: get_addons SQL injection - Add input validation in function
CREATE OR REPLACE FUNCTION public.get_addons(
  p_restaurant_id UUID,
  p_product_id TEXT DEFAULT NULL,
  p_category TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  label TEXT,
  price NUMERIC,
  max_per_item INTEGER,
  applies_to_type TEXT,
  applies_to_value TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Validate UUID format for product_id to prevent injection
  IF p_product_id IS NOT NULL AND p_product_id !~ '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
    RAISE EXCEPTION 'Invalid product_id format - must be a valid UUID';
  END IF;
  
  -- Validate category format (alphanumeric, spaces, accents, underscores, hyphens, max 100 chars)
  IF p_category IS NOT NULL AND p_category !~ '^[a-zA-Z0-9À-ÿ\s_\-]{1,100}$' THEN
    RAISE EXCEPTION 'Invalid category format';
  END IF;

  RETURN QUERY
  SELECT 
    a.id,
    a.label,
    a.price,
    a.max_per_item,
    a.applies_to_type::TEXT,
    a.applies_to_value
  FROM addons a
  WHERE a.user_id = p_restaurant_id
    AND a.is_active = true
    AND (
      -- Global addons (apply to everything)
      a.applies_to_type = 'global'
      -- Category-specific addons
      OR (p_category IS NOT NULL 
          AND a.applies_to_type = 'category' 
          AND a.applies_to_value = p_category)
      -- Product-specific addons (supports pipe-separated list)
      OR (p_product_id IS NOT NULL 
          AND a.applies_to_type = 'product' 
          AND a.applies_to_value LIKE '%' || p_product_id || '%')
    )
  ORDER BY a.sort_order NULLS LAST, a.label;
END;
$$;