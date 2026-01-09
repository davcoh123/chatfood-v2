import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface WhatsAppIntegration {
  id: string;
  user_id: string;
  waba_id: string;
  phone_number_id: string;
  business_id: string | null;
  status: string;
  display_phone_number: string | null;
  verified_name: string | null;
  access_token: string;
  created_at: string | null;
  updated_at: string | null;
}

export function useWhatsAppIntegration(userId?: string, includeInactive = false) {
  const { user } = useAuth();
  const targetUserId = userId || user?.id;

  const query = useQuery({
    queryKey: ['whatsapp-integration', targetUserId, includeInactive],
    queryFn: async () => {
      if (!targetUserId) return null;
      
      let queryBuilder = supabase
        .from('whatsapp_integrations')
        .select('*')
        .eq('user_id', targetUserId);
      
      // Pour l'admin, récupérer toutes les intégrations (même inactives)
      if (!includeInactive) {
        queryBuilder = queryBuilder.eq('status', 'active');
      }
      
      const { data, error } = await queryBuilder
        .order('updated_at', { ascending: false })
        .maybeSingle();
      
      if (error) throw error;
      return data as WhatsAppIntegration | null;
    },
    enabled: !!targetUserId,
  });

  return {
    integration: query.data,
    isLoading: query.isLoading,
    refetch: query.refetch,
  };
}
