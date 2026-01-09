import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export interface TicketMessage {
  id: string;
  ticket_id: string;
  sender_id: string;
  sender_type: 'user' | 'admin';
  message: string;
  created_at: string;
  read_at: string | null;
}

export const useTicketMessages = (ticketId: string | null) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchMessages = async () => {
    if (!ticketId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('ticket_messages')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages((data as TicketMessage[]) || []);
    } catch (error: any) {
      console.error('Error fetching messages:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les messages",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async (message: string, senderType: 'user' | 'admin' = 'user') => {
    if (!ticketId || !user) return false;

    console.debug('[sendMessage] start', { ticketId, senderType, userId: user.id });

    try {
      const { error } = await supabase
        .from('ticket_messages')
        .insert({
          ticket_id: ticketId,
          sender_id: user.id,
          sender_type: senderType,
          message
        });

      if (error) {
        console.error('[sendMessage] insert error:', error);
        throw error;
      }

      console.debug('[sendMessage] success');

      toast({
        title: "Message envoyé",
        description: senderType === 'user' ? "Votre message a été envoyé à l'équipe support" : "Message envoyé à l'utilisateur"
      });

      return true;
    } catch (error: any) {
      console.error('[sendMessage] error:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible d'envoyer le message",
        variant: "destructive"
      });
      return false;
    }
  };

  useEffect(() => {
    if (ticketId && user) {
      fetchMessages();

      // Subscribe to real-time updates
      const channel = supabase
        .channel(`ticket-messages-${ticketId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'ticket_messages',
            filter: `ticket_id=eq.${ticketId}`
          },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              setMessages(prev => [...prev, payload.new as TicketMessage]);
            }
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [ticketId, user]);

  return {
    messages,
    loading,
    sendMessage,
    refreshMessages: fetchMessages
  };
};
