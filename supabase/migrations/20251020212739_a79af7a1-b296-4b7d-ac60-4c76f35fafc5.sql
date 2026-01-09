-- Migration: Harmonize section_id values in dashboard_configurations
-- This updates old plan-prefixed section IDs to simplified IDs

-- Update Starter plan section IDs
UPDATE dashboard_configurations 
SET section_id = 'whatsapp_messages' 
WHERE section_id = 'starter_stat_whatsapp';

UPDATE dashboard_configurations 
SET section_id = 'reservations' 
WHERE section_id = 'starter_stat_reservations';

-- Update Pro plan section IDs
UPDATE dashboard_configurations 
SET section_id = 'daily_revenue' 
WHERE section_id = 'pro_stat_revenue';

UPDATE dashboard_configurations 
SET section_id = 'daily_orders' 
WHERE section_id = 'pro_stat_orders';

UPDATE dashboard_configurations 
SET section_id = 'active_customers' 
WHERE section_id = 'pro_stat_customers';

UPDATE dashboard_configurations 
SET section_id = 'satisfaction' 
WHERE section_id = 'pro_stat_satisfaction';

-- Update Premium plan section IDs
UPDATE dashboard_configurations 
SET section_id = 'daily_revenue' 
WHERE section_id = 'premium_stat_revenue';

UPDATE dashboard_configurations 
SET section_id = 'daily_orders' 
WHERE section_id = 'premium_stat_orders';

UPDATE dashboard_configurations 
SET section_id = 'active_customers' 
WHERE section_id = 'premium_stat_customers';

UPDATE dashboard_configurations 
SET section_id = 'restaurants' 
WHERE section_id = 'premium_stat_restaurants';