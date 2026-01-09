-- Add UPDATE policy for support_tickets to allow users to finalize or reopen their tickets
CREATE POLICY "Users can finalize or reopen their tickets"
ON public.support_tickets
FOR UPDATE
TO public
USING (user_id = auth.uid() AND awaiting_review = true)
WITH CHECK (user_id = auth.uid() AND awaiting_review = false AND status IN ('open', 'resolved'));