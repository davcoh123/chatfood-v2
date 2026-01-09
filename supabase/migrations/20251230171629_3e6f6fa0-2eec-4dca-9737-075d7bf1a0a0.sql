-- Add onboarding_completed field to restaurant_settings
ALTER TABLE restaurant_settings 
ADD COLUMN IF NOT EXISTS onboarding_completed boolean DEFAULT false;