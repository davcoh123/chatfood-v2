import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { CreateTicketInput } from '@/schemas/support';

export interface SupportTicket {
  id: string;
  user_id: string;
  user_email: string;
  user_plan: string;
  ticket_type: string;
  subject: string;
  description: string;
  priority: string;
  status: string;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  resolved_by: string | null;
  admin_notes: string | null;
  awaiting_review: boolean;
  last_message_at: string | null;
}

export const useSupportTickets = (passedUserId?: string) => {
  const [userId, setUserId] = useState<string | null>(passedUserId || null);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!passedUserId) {
      supabase.auth.getUser().then(({ data }) => {
        if (data.user) setUserId(data.user.id);
      });
    }
  }, [passedUserId]);

  const fetchUserTickets = async () => {
    if (!userId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('user_id', userId)
        .order('last_message_at', { ascending: false });

      if (error) throw error;
      setTickets(data || []);

      // Count unread tickets (awaiting_user status means admin replied)
      const unread = data?.filter(t => t.status === 'awaiting_user').length || 0;
      setUnreadCount(unread);
    } catch (error: any) {
      console.error('Error fetching tickets:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger vos tickets",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createTicket = async (data: CreateTicketInput) => {
    if (!userId) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour créer un ticket",
        variant: "destructive"
      });
      return false;
    }

    try {
      console.debug('[createTicket] start', { userId });
      
      // Get user email
      const { data: authData } = await supabase.auth.getUser();
      const email = authData.user?.email || '(unknown)';
      
      // Get user plan directly from user_subscriptions table
      console.debug('[createTicket] fetching plan');
      const { data: sub, error: subError } = await supabase
        .from('user_subscriptions')
        .select('plan')
        .eq('user_id', userId)
        .maybeSingle();

      if (subError) {
        console.error('[createTicket] error fetching plan:', subError);
      }

      const userPlan = sub?.plan || 'starter';
      console.debug('[createTicket] plan retrieved:', userPlan);

      // Insert ticket
      console.debug('[createTicket] inserting ticket', { 
        user_id: userId, 
        email, 
        userPlan, 
        ticket_type: data.ticket_type 
      });
      
      const { error: insertError } = await supabase
        .from('support_tickets')
        .insert({
          user_id: userId,
          user_email: email,
          user_plan: userPlan,
          ticket_type: data.ticket_type,
          subject: data.subject,
          description: data.description,
          priority: data.priority,
          status: 'open'
        });

      if (insertError) {
        console.error('[createTicket] insert error:', insertError);
        throw insertError;
      }

      console.debug('[createTicket] ticket inserted successfully');

      toast({
        title: "Ticket créé avec succès !",
        description: "Notre équipe vous répondra sous 24-48h"
      });

      // Refresh tickets list
      console.debug('[createTicket] refreshing tickets list');
      await fetchUserTickets();
      console.debug('[createTicket] done');
      
      return true;
    } catch (error: any) {
      console.error('[createTicket] error:', error);
      toast({
        title: "Erreur",
        description: error.message || "Impossible de créer le ticket",
        variant: "destructive"
      });
      return false;
    }
  };

  useEffect(() => {
    if (userId) {
      fetchUserTickets();

      // Subscribe to real-time updates for user's tickets
      const channel = supabase
        .channel('user-tickets')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'support_tickets',
            filter: `user_id=eq.${userId}`
          },
          () => {
            fetchUserTickets();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [userId]);

  return {
    tickets,
    loading,
    unreadCount,
    createTicket,
    refreshTickets: fetchUserTickets
  };
};
