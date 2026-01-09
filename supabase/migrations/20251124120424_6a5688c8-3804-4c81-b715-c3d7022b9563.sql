-- Migration pour ajouter le champ 'order' aux assets existants dans restaurant_settings
UPDATE public.restaurant_settings
SET assets = (
  SELECT jsonb_agg(
    elem.value || jsonb_build_object('order', elem.ordinality - 1)
  )
  FROM jsonb_array_elements(assets) WITH ORDINALITY AS elem(value, ordinality)
)
WHERE assets IS NOT NULL 
  AND jsonb_typeof(assets) = 'array'
  AND jsonb_array_length(assets) > 0;