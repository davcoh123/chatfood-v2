-- Add UPDATE policy for ticket_reviews to allow users to modify their own reviews
CREATE POLICY "Users can update their own reviews"
ON public.ticket_reviews
FOR UPDATE
TO public
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());