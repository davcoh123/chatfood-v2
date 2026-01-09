-- Create dashboard_configurations table
CREATE TABLE public.dashboard_configurations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan subscription_plan NOT NULL,
  section_id TEXT NOT NULL,
  section_type TEXT NOT NULL,
  customizations JSONB NOT NULL DEFAULT '{}'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, section_id)
);

-- Create dashboard_metric_values table for caching
CREATE TABLE public.dashboard_metric_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  section_id TEXT NOT NULL,
  value TEXT NOT NULL,
  fetched_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, section_id)
);

-- Indexes for performance
CREATE INDEX idx_dashboard_config_user ON public.dashboard_configurations(user_id);
CREATE INDEX idx_dashboard_config_plan ON public.dashboard_configurations(plan);
CREATE INDEX idx_metric_values_user ON public.dashboard_metric_values(user_id);

-- Enable RLS
ALTER TABLE public.dashboard_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboard_metric_values ENABLE ROW LEVEL SECURITY;

-- RLS Policies for dashboard_configurations
CREATE POLICY "Admins can manage all dashboard configs"
ON public.dashboard_configurations FOR ALL
USING (is_admin())
WITH CHECK (is_admin());

CREATE POLICY "Users can view their own dashboard configs"
ON public.dashboard_configurations FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Block anonymous access to dashboard configs"
ON public.dashboard_configurations
AS RESTRICTIVE
FOR ALL
TO anon
USING (false);

-- RLS Policies for dashboard_metric_values
CREATE POLICY "Users can view their own metric values"
ON public.dashboard_metric_values FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Block anonymous access to metric values"
ON public.dashboard_metric_values
AS RESTRICTIVE
FOR ALL
TO anon
USING (false);

-- Trigger for updated_at
CREATE TRIGGER update_dashboard_configurations_updated_at
  BEFORE UPDATE ON public.dashboard_configurations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();