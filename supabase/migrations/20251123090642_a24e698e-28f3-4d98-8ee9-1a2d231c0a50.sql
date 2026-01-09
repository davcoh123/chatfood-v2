-- Créer le bucket pour les assets des restaurants
INSERT INTO storage.buckets (id, name, public)
VALUES ('restaurant-assets', 'restaurant-assets', true);

-- RLS Policy : Les utilisateurs peuvent uploader leurs propres assets
CREATE POLICY "Users can upload their own restaurant assets"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'restaurant-assets' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- RLS Policy : Les utilisateurs peuvent voir leurs propres assets
CREATE POLICY "Users can view their own restaurant assets"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'restaurant-assets' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- RLS Policy : Les utilisateurs peuvent supprimer leurs propres assets
CREATE POLICY "Users can delete their own restaurant assets"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'restaurant-assets' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- RLS Policy : Tout le monde peut lire les assets (car bucket public)
CREATE POLICY "Public can view restaurant assets"
ON storage.objects
FOR SELECT
TO public
USING (bucket_id = 'restaurant-assets');