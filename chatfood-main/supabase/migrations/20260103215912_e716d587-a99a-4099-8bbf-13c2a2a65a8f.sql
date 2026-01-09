ALTER TABLE admin_impersonation_tokens 
ADD COLUMN IF NOT EXISTS single_use BOOLEAN DEFAULT true;