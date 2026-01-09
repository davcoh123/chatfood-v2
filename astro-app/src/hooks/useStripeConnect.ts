import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface StripeAccountStatus {
  connected: boolean;
  account_id?: string;
  onboarding_status: 'not_started' | 'pending' | 'pending_verification' | 'complete';
  charges_enabled: boolean;
  payouts_enabled: boolean;
  details_submitted?: boolean;
  payments_enabled: boolean;
  platform_fee_percent: number;
  requirements?: any;
}

export function useStripeConnect(passedUserId?: string) {
  const [userId, setUserId] = useState<string | null>(passedUserId || null);
  const [status, setStatus] = useState<StripeAccountStatus | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);

  // Get userId from auth if not passed
  useEffect(() => {
    if (!passedUserId) {
      supabase.auth.getUser().then(({ data }) => {
        if (data.user) setUserId(data.user.id);
      });
    }
  }, [passedUserId]);

  const fetchStatus = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.access_token) {
        setIsLoading(false);
        return;
      }

      const response = await fetch(
        'https://dcwfgxbwpecnjbhrhrib.supabase.co/functions/v1/stripe-account-status',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.session.access_token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setStatus({
          connected: data.connected,
          account_id: data.account_id,
          onboarding_status: data.onboarding_status,
          charges_enabled: data.charges_enabled || false,
          payouts_enabled: data.payouts_enabled || false,
          details_submitted: data.details_submitted,
          payments_enabled: data.payments_enabled || false,
          platform_fee_percent: data.platform_fee_percent || 5,
          requirements: data.requirements,
        });
      } else {
        console.error('Error fetching Stripe status:', data.error);
      }
    } catch (error) {
      console.error('Error fetching Stripe status:', error);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const startOnboarding = async () => {
    if (!userId) return;

    setIsConnecting(true);
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.access_token) {
        toast.error('Session expirée, veuillez vous reconnecter');
        return;
      }

      const response = await fetch(
        'https://dcwfgxbwpecnjbhrhrib.supabase.co/functions/v1/stripe-create-account',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.session.access_token}`,
          },
          body: JSON.stringify({
            base_url: window.location.origin,
          }),
        }
      );

      const data = await response.json();

      if (response.ok && data.success && data.onboarding_url) {
        window.location.href = data.onboarding_url;
      } else {
        toast.error(data.error || 'Erreur lors de la connexion Stripe');
      }
    } catch (error) {
      console.error('Error starting Stripe onboarding:', error);
      toast.error('Erreur lors de la connexion Stripe');
    } finally {
      setIsConnecting(false);
    }
  };

  const openDashboard = async () => {
    if (!user || !status?.connected) return;

    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.access_token) {
        toast.error('Session expirée, veuillez vous reconnecter');
        return;
      }

      const response = await fetch(
        'https://dcwfgxbwpecnjbhrhrib.supabase.co/functions/v1/stripe-dashboard-link',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.session.access_token}`,
          },
        }
      );

      const data = await response.json();

      if (response.ok && data.success && data.dashboard_url) {
        window.open(data.dashboard_url, '_blank');
      } else {
        toast.error(data.error || 'Erreur lors de l\'ouverture du dashboard');
      }
    } catch (error) {
      console.error('Error opening Stripe dashboard:', error);
      toast.error('Erreur lors de l\'ouverture du dashboard');
    }
  };

  const togglePayments = async (enabled: boolean) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('restaurant_settings')
        .update({ payments_enabled: enabled })
        .eq('user_id', user.id);

      if (error) throw error;

      setStatus((prev) => (prev ? { ...prev, payments_enabled: enabled } : null));
      toast.success(enabled ? 'Paiements en ligne activés' : 'Paiements en ligne désactivés');
    } catch (error) {
      console.error('Error toggling payments:', error);
      toast.error('Erreur lors de la mise à jour');
    }
  };

  return {
    status,
    isLoading,
    isConnecting,
    startOnboarding,
    openDashboard,
    togglePayments,
    refetch: fetchStatus,
  };
}
