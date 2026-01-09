-- Créer la table des messages de tickets
CREATE TABLE public.ticket_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('user', 'admin')),
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  read_at TIMESTAMP WITH TIME ZONE
);

-- Créer la table des avis/reviews
CREATE TABLE public.ticket_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(ticket_id)
);

-- Modifier la table support_tickets pour ajouter les nouveaux champs
ALTER TABLE public.support_tickets 
  ADD COLUMN awaiting_review BOOLEAN DEFAULT false,
  ADD COLUMN last_message_at TIMESTAMP WITH TIME ZONE;

-- Mettre à jour les statuts existants
UPDATE public.support_tickets SET last_message_at = created_at WHERE last_message_at IS NULL;

-- Enable RLS sur les nouvelles tables
ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_reviews ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour ticket_messages
CREATE POLICY "Users can view messages from their tickets"
  ON public.ticket_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.support_tickets 
      WHERE id = ticket_messages.ticket_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create messages in their tickets"
  ON public.ticket_messages FOR INSERT
  WITH CHECK (
    sender_type = 'user' AND
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.support_tickets 
      WHERE id = ticket_messages.ticket_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Admins can view all messages"
  ON public.ticket_messages FOR SELECT
  USING (public.is_admin());

CREATE POLICY "Admins can create messages in any ticket"
  ON public.ticket_messages FOR INSERT
  WITH CHECK (
    public.is_admin() AND sender_type = 'admin'
  );

CREATE POLICY "Admins can mark messages as read"
  ON public.ticket_messages FOR UPDATE
  USING (public.is_admin());

-- Politiques RLS pour ticket_reviews
CREATE POLICY "Users can view their own reviews"
  ON public.ticket_reviews FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create reviews for their tickets"
  ON public.ticket_reviews FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.support_tickets 
      WHERE id = ticket_reviews.ticket_id 
      AND user_id = auth.uid()
      AND awaiting_review = true
    )
  );

CREATE POLICY "Admins can view all reviews"
  ON public.ticket_reviews FOR SELECT
  USING (public.is_admin());

-- Créer des index pour les performances
CREATE INDEX idx_ticket_messages_ticket_id ON public.ticket_messages(ticket_id);
CREATE INDEX idx_ticket_messages_created_at ON public.ticket_messages(created_at);
CREATE INDEX idx_ticket_reviews_ticket_id ON public.ticket_reviews(ticket_id);
CREATE INDEX idx_support_tickets_last_message ON public.support_tickets(last_message_at);

-- Trigger pour mettre à jour last_message_at automatiquement
CREATE OR REPLACE FUNCTION public.update_ticket_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.support_tickets 
  SET last_message_at = NEW.created_at,
      status = CASE 
        WHEN NEW.sender_type = 'user' THEN 'awaiting_admin'
        WHEN NEW.sender_type = 'admin' THEN 'awaiting_user'
        ELSE status
      END
  WHERE id = NEW.ticket_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_message_created
  AFTER INSERT ON public.ticket_messages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_ticket_last_message();

-- Activer Realtime pour les nouvelles tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.ticket_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ticket_reviews;

-- Configurer REPLICA IDENTITY pour Realtime
ALTER TABLE public.ticket_messages REPLICA IDENTITY FULL;
ALTER TABLE public.ticket_reviews REPLICA IDENTITY FULL;
ALTER TABLE public.support_tickets REPLICA IDENTITY FULL;