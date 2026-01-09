import { useAuth } from '@/contexts/AuthContext';

export const useSubscription = () => {
  const { profile } = useAuth();
  
  const plan = profile?.plan || 'starter';
  
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
