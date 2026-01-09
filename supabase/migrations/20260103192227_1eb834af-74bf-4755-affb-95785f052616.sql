-- Table pour stocker les tokens d'impersonation admin
CREATE TABLE public.admin_impersonation_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  token TEXT NOT NULL UNIQUE,
  target_user_id UUID NOT NULL,
  target_user_email TEXT NOT NULL,
  created_by UUID NOT NULL,
  created_by_email TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '24 hours'),
  revoked BOOLEAN DEFAULT FALSE,
  revoked_at TIMESTAMPTZ,
  used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour recherche rapide
CREATE INDEX idx_impersonation_tokens_token ON admin_impersonation_tokens(token);
CREATE INDEX idx_impersonation_tokens_target ON admin_impersonation_tokens(target_user_id);
CREATE INDEX idx_impersonation_tokens_expires ON admin_impersonation_tokens(expires_at);

-- RLS
ALTER TABLE admin_impersonation_tokens ENABLE ROW LEVEL SECURITY;

-- Seuls les admins peuvent gérer les tokens
CREATE POLICY "Admins can manage impersonation tokens"
ON admin_impersonation_tokens
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());