-- Fix RLS policies for ticket_messages INSERT operations
-- Drop existing INSERT policies
DROP POLICY IF EXISTS "Users can create messages in their tickets" ON public.ticket_messages;
DROP POLICY IF EXISTS "Admins can create messages in any ticket" ON public.ticket_messages;

-- Recreate user INSERT policy (INSERT only supports WITH CHECK, not USING)
CREATE POLICY "Users can create messages in their tickets"
  ON public.ticket_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    sender_type = 'user' AND
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.support_tickets 
      WHERE id = ticket_messages.ticket_id 
      AND user_id = auth.uid()
    )
  );

-- Recreate admin INSERT policy
CREATE POLICY "Admins can create messages in any ticket"
  ON public.ticket_messages FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_admin() AND sender_type = 'admin'
  );

-- Fix UPDATE policy for support_tickets
DROP POLICY IF EXISTS "Admins can update all tickets" ON public.support_tickets;

CREATE POLICY "Admins can update all tickets"
  ON public.support_tickets FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());