import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface TicketReview {
  id: string;
  ticket_id: string;
  user_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
}

export const useTicketReviews = (passedUserId?: string) => {
  const [userId, setUserId] = useState<string | null>(passedUserId || null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!passedUserId) {
      supabase.auth.getUser().then(({ data }) => {
        if (data.user) setUserId(data.user.id);
      });
    }
  }, [passedUserId]);

  const submitReview = async (ticketId: string, rating: number, comment?: string) => {
    if (!userId) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté",
        variant: "destructive"
      });
      return false;
    }

    try {
      setSubmitting(true);
      
      // Upsert review (insert or update if exists)
      const { error: reviewError } = await supabase
        .from('ticket_reviews')
        .upsert({
          ticket_id: ticketId,
          user_id: userId,
          rating,
          comment: comment || null
        }, {
          onConflict: 'ticket_id'
        });

      if (reviewError) {
        console.error('Error submitting review:', reviewError);
        throw reviewError;
      }

      // Update ticket status to resolved
      const { error: updateError } = await supabase
        .from('support_tickets')
        .update({ 
          status: 'resolved',
          awaiting_review: false,
          resolved_at: new Date().toISOString()
        })
        .eq('id', ticketId);

      if (updateError) {
        console.error('Error updating ticket:', updateError);
        throw updateError;
      }

      toast({
        title: "Merci pour votre avis !",
        description: "Votre évaluation a été enregistrée"
      });

      return true;
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'enregistrer votre avis",
        variant: "destructive"
      });
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const reopenTicket = async (ticketId: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({ 
          status: 'open',
          awaiting_review: false
        })
        .eq('id', ticketId);

      if (error) throw error;

      toast({
        title: "Ticket rouvert",
        description: "Vous pouvez continuer la conversation"
      });

      return true;
    } catch (error: any) {
      console.error('Error reopening ticket:', error);
      toast({
        title: "Erreur",
        description: "Impossible de rouvrir le ticket",
        variant: "destructive"
      });
      return false;
    }
  };

  return {
    submitReview,
    reopenTicket,
    submitting
  };
};
