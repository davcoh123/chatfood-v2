-- Table pour stocker les intégrations WhatsApp de chaque restaurant
CREATE TABLE public.whatsapp_integrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Identifiants Meta/WhatsApp
  waba_id TEXT NOT NULL,
  phone_number_id TEXT NOT NULL,
  business_id TEXT,
  
  -- Token d'accès système (sensible)
  access_token TEXT NOT NULL,
  
  -- Statut de l'intégration
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'revoked', 'error')),
  
  -- Métadonnées
  display_phone_number TEXT,
  verified_name TEXT,
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Contrainte d'unicité : un seul WABA par utilisateur
  UNIQUE(user_id, waba_id)
);

-- Index pour les recherches fréquentes
CREATE INDEX idx_whatsapp_integrations_user_id ON public.whatsapp_integrations(user_id);
CREATE INDEX idx_whatsapp_integrations_status ON public.whatsapp_integrations(status);

-- Activer RLS
ALTER TABLE public.whatsapp_integrations ENABLE ROW LEVEL SECURITY;

-- Bloquer accès anonyme
CREATE POLICY "Block anonymous access to whatsapp_integrations"
  ON public.whatsapp_integrations FOR ALL
  USING (auth.uid() IS NOT NULL);

-- Les utilisateurs peuvent voir leurs propres intégrations
CREATE POLICY "Users can view their own integrations"
  ON public.whatsapp_integrations FOR SELECT
  USING (auth.uid() = user_id);

-- Les utilisateurs peuvent insérer leurs propres intégrations
CREATE POLICY "Users can insert their own integrations"
  ON public.whatsapp_integrations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Les utilisateurs peuvent mettre à jour leurs propres intégrations
CREATE POLICY "Users can update their own integrations"
  ON public.whatsapp_integrations FOR UPDATE
  USING (auth.uid() = user_id);

-- Les admins peuvent tout gérer
CREATE POLICY "Admins can manage all whatsapp_integrations"
  ON public.whatsapp_integrations FOR ALL
  USING (is_admin())
  WITH CHECK (is_admin());

-- Trigger pour updated_at
CREATE TRIGGER update_whatsapp_integrations_updated_at
  BEFORE UPDATE ON public.whatsapp_integrations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();