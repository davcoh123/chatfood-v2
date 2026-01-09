import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface Customizations {
  title?: string;
  description?: string;
  webhook_url?: string;
  icon?: string;
  color?: string;
}

interface DashboardConfig {
  id: string;
  section_id: string;
  customizations: Customizations;
  is_active: boolean;
}

interface MetricData {
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
}

export const useDashboardConfig = (sectionId: string, options?: { userId?: string }) => {
  const [authUserId, setAuthUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!options?.userId) {
      supabase.auth.getUser().then(({ data }) => {
        if (data.user) setAuthUserId(data.user.id);
      });
    }
  }, [options?.userId]);

  const userId = options?.userId || authUserId || '';

  // Fetch configuration from database
  const { data: config, isLoading: configLoading } = useQuery<DashboardConfig | null>({
    queryKey: ['dashboard-config', userId, sectionId],
    queryFn: async () => {
      if (!userId) return null;

      const { data, error } = await supabase
        .from('dashboard_configurations')
        .select('*')
        .eq('user_id', userId)
        .eq('section_id', sectionId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching dashboard config:', error);
        return null;
      }

      if (!data) return null;

      return {
        ...data,
        customizations: data.customizations as Customizations,
      };
    },
    enabled: !!userId,
  });

  // Calculer les métriques directement depuis Supabase
  const { data: metricData, isLoading: valueLoading } = useQuery<MetricData | null>({
    queryKey: ['dashboard-metric', userId, sectionId],
    queryFn: async () => {
      if (!userId) return null;

      try {
        // Métriques calculées depuis Supabase
        if (sectionId === 'whatsapp_messages') {
          const { count, error } = await supabase
            .from('chatbot_messages')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId);

          if (error) throw error;
          return { value: count || 0 };
        }

        if (sectionId === 'orders') {
          const { count, error } = await supabase
            .from('chatbot_orders')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId);

          if (error) throw error;
          return { value: count || 0 };
        }

        if (sectionId === 'revenue') {
          const today = new Date().toISOString().split('T')[0];
          const { data, error } = await supabase
            .from('chatbot_orders')
            .select('price_total')
            .eq('user_id', userId)
            .eq('status', 'delivered')
            .gte('heure_de_commande', `${today}T00:00:00`);

          if (error) throw error;
          const total = (data || []).reduce((sum, order) => sum + (order.price_total || 0), 0);
          return { value: `${total.toFixed(2)}€` };
        }

        if (sectionId === 'reservations') {
          const today = new Date().toISOString().split('T')[0];
          const { count, error } = await supabase
            .from('chatbot_reservations')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .gte('reservation_datetime', `${today}T00:00:00`);

          if (error) throw error;
          return { value: count || 0 };
        }

        return null;
      } catch (error) {
        console.error('Error fetching metric data:', error);
        return null;
      }
    },
    enabled: !!userId && ['whatsapp_messages', 'orders', 'revenue', 'reservations'].includes(sectionId),
    refetchInterval: 30000,
    retry: 1,
  });

  return {
    config,
    title: config?.customizations?.title,
    description: config?.customizations?.description,
    value: metricData?.value?.toString() || null,
    change: metricData?.change,
    changeType: metricData?.changeType,
    icon: config?.customizations?.icon,
    color: config?.customizations?.color,
    isLoading: configLoading || valueLoading,
    hasWebhook: false,
  };
};
