import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useAdminTickets = (passedRole?: string) => {
  const [role, setRole] = useState<string | null>(passedRole || null);
  const [awaitingAdminCount, setAwaitingAdminCount] = useState(0);

  useEffect(() => {
    if (!passedRole) {
      supabase.auth.getUser().then(async ({ data }) => {
        if (data.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', data.user.id)
            .single();
          if (profile) setRole(profile.role);
        }
      });
    }
  }, [passedRole]);

  const fetchAwaitingCount = async () => {
    if (role !== 'admin') return;

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
    if (role === 'admin') {
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
  }, [role]);

  return { awaitingAdminCount };
};
