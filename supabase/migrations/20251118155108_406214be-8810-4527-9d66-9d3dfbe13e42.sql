-- Allow users to insert their own dashboard configurations
CREATE POLICY "Users can insert their own dashboard configs"
ON public.dashboard_configurations FOR INSERT
WITH CHECK (auth.uid() = user_id);