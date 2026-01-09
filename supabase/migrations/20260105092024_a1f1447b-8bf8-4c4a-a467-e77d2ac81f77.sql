-- Fonction pour générer un slug unique à partir du nom du restaurant
CREATE OR REPLACE FUNCTION public.generate_restaurant_slug(name TEXT, current_user_id UUID)
RETURNS TEXT AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  -- Convertir en minuscules, supprimer les accents, remplacer espaces/caractères spéciaux par tirets
  base_slug := lower(immutable_unaccent(COALESCE(name, 'restaurant')));
  base_slug := regexp_replace(base_slug, '[^a-z0-9]+', '-', 'g');
  base_slug := trim(both '-' from base_slug);
  
  -- Si le slug est vide, utiliser un défaut
  IF base_slug = '' THEN
    base_slug := 'restaurant';
  END IF;
  
  final_slug := base_slug;
  
  -- Vérifier l'unicité, ajouter un suffixe si nécessaire
  WHILE EXISTS (SELECT 1 FROM restaurant_settings WHERE slug = final_slug AND user_id != current_user_id) LOOP
    counter := counter + 1;
    final_slug := base_slug || '-' || counter;
  END LOOP;
  
  RETURN final_slug;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Trigger pour générer automatiquement le slug lors de l'insertion/mise à jour
CREATE OR REPLACE FUNCTION public.handle_restaurant_slug()
RETURNS TRIGGER AS $$
BEGIN
  -- Générer le slug si le nom change ou si le slug est null
  IF NEW.restaurant_name IS NOT NULL AND (TG_OP = 'INSERT' OR NEW.restaurant_name IS DISTINCT FROM OLD.restaurant_name OR NEW.slug IS NULL) THEN
    NEW.slug := generate_restaurant_slug(NEW.restaurant_name, NEW.user_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Supprimer le trigger existant s'il existe
DROP TRIGGER IF EXISTS restaurant_slug_trigger ON restaurant_settings;

-- Créer le trigger
CREATE TRIGGER restaurant_slug_trigger
  BEFORE INSERT OR UPDATE ON restaurant_settings
  FOR EACH ROW
  EXECUTE FUNCTION handle_restaurant_slug();

-- Contrainte unique sur le slug
ALTER TABLE restaurant_settings DROP CONSTRAINT IF EXISTS restaurant_settings_slug_unique;
ALTER TABLE restaurant_settings ADD CONSTRAINT restaurant_settings_slug_unique UNIQUE (slug);

-- Générer les slugs pour les restaurants existants qui n'en ont pas
UPDATE restaurant_settings 
SET slug = generate_restaurant_slug(restaurant_name, user_id) 
WHERE slug IS NULL AND restaurant_name IS NOT NULL;

-- Politique RLS pour l'accès public en lecture aux restaurants avec slug
DROP POLICY IF EXISTS "Public can view restaurants with slug" ON restaurant_settings;
CREATE POLICY "Public can view restaurants with slug"
  ON restaurant_settings
  FOR SELECT
  USING (slug IS NOT NULL AND slug != '');

-- Politique RLS pour l'accès public aux produits actifs des restaurants publics
DROP POLICY IF EXISTS "Public can view active products of public restaurants" ON products;
CREATE POLICY "Public can view active products of public restaurants"
  ON products
  FOR SELECT
  USING (
    is_active = true 
    AND user_id IN (
      SELECT user_id FROM restaurant_settings WHERE slug IS NOT NULL AND slug != ''
    )
  );

-- Politique RLS pour l'accès public aux avis des restaurants publics
DROP POLICY IF EXISTS "Public can view reviews of public restaurants" ON order_reviews;
CREATE POLICY "Public can view reviews of public restaurants"
  ON order_reviews
  FOR SELECT
  USING (
    user_id IN (
      SELECT user_id FROM restaurant_settings WHERE slug IS NOT NULL AND slug != ''
    )
  );