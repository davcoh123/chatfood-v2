import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

// useSubscription hook - fetches plan from Supabase if not passed
export const useSubscription = (passedPlan?: string) => {
  const [fetchedPlan, setFetchedPlan] = useState<string | null>(null);
  
  // Fetch plan from Supabase if not passed
  useEffect(() => {
    if (!passedPlan) {
      supabase.auth.getUser().then(async ({ data }) => {
        if (data.user) {
          const { data: sub } = await supabase
            .from('user_subscriptions')
            .select('plan')
            .eq('user_id', data.user.id)
            .maybeSingle();
          if (sub?.plan) setFetchedPlan(sub.plan);
        }
      });
    }
  }, [passedPlan]);
  
  // Use passed plan, fetched plan, or default to starter
  const plan = passedPlan || fetchedPlan || 'starter';
  
  // Feature access based on plan
  const canAccessAnalytics = plan === 'pro' || plan === 'premium';
  const canAccessPromotions = plan === 'pro' || plan === 'premium';
  const canAccessReservations = plan === 'premium';
  const canAccessMultiRestaurants = plan === 'premium';
  const canAccessAdvancedAI = plan === 'premium';
  const canAccessAdvancedCatalogue = plan === 'pro' || plan === 'premium';
  const canAccessOrderStats = plan === 'pro' || plan === 'premium';
  const canAccessCustomerReviews = plan === 'pro' || plan === 'premium';
  const canAccessDailyMenu = plan === 'pro' || plan === 'premium';
  
  return { 
    plan, 
    canAccessAnalytics, 
    canAccessPromotions,
    canAccessReservations,
    canAccessMultiRestaurants,
    canAccessAdvancedAI,
    canAccessAdvancedCatalogue,
    canAccessOrderStats,
    canAccessCustomerReviews,
    canAccessDailyMenu
  };
};
