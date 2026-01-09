-- Add GPS coordinates columns to restaurant_settings
ALTER TABLE restaurant_settings 
ADD COLUMN longitude NUMERIC,
ADD COLUMN latitude NUMERIC;