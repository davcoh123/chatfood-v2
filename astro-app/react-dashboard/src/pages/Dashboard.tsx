import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useRestaurantSettings } from '@/hooks/useRestaurantSettings';
import StarterDashboard from './dashboards/StarterDashboard';
import ProDashboard from './dashboards/ProDashboard';
import PremiumDashboard from './dashboards/PremiumDashboard';

const Dashboard = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { settings, isLoading: settingsLoading } = useRestaurantSettings(profile?.user_id);

  // Redirect admin users to the admin dashboard
  useEffect(() => {
    if (profile?.role === 'admin') {
      navigate('/admin/dashboard', { replace: true });
    }
  }, [profile, navigate]);

  // Route based on subscription plan
  if (!profile) {
    return null;
  }

  // Loading state
  if (settingsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse h-8 w-48 bg-muted rounded-lg" />
      </div>
    );
  }

  switch(profile?.plan) {
    case 'premium':
      return <PremiumDashboard />;
    case 'pro':
      return <ProDashboard />;
    case 'starter':
    default:
      return <StarterDashboard />;
  }
};

export default Dashboard;
