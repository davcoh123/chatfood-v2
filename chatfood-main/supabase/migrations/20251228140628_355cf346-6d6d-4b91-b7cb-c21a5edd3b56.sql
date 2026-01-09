-- Ajouter les colonnes pour le PIN d'enregistrement et le statut
ALTER TABLE whatsapp_integrations 
ADD COLUMN IF NOT EXISTS registration_pin TEXT,
ADD COLUMN IF NOT EXISTS registration_status TEXT DEFAULT 'pending';