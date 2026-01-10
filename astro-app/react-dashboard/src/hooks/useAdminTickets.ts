import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useAdminTickets = () => {
  const { profile } = useAuth();
  const [awaitingAdminCount, setAwaitingAdminCount] = useState(0);

  const fetchAwaitingCount = async () => {
    if (profile?.role !== 'admin') return;

    try {
      const { data, error } = await supabase
        .from('support_tickets')
        .select('id', { count: 'exact', head: true })
        .in('status', ['open', 'awaiting_admin']);

      if (error) throw error;
      setAwaitingAdminCount(data?.length || 0);
    } catch (error) {
      console.error('Error fetching admin tickets count:', error);
    }
  };

  useEffect(() => {
    if (profile?.role === 'admin') {
      fetchAwaitingCount();

      // Subscribe to real-time updates
      const channel = supabase
        .channel('admin-tickets-count')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'support_tickets'
          },
          () => {
            fetchAwaitingCount();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [profile?.role]);

  return { awaitingAdminCount };
};
