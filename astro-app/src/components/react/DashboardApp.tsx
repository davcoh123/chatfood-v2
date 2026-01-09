/**
 * DashboardApp - Composant React principal pour le dashboard
 * Gère l'affichage du bon dashboard selon le plan utilisateur
 */

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { SidebarProvider } from '@/components/ui/sidebar';
import AppSidebar from '@/components/AppSidebar';
import StarterDashboard from '@/components/dashboard/dashboards/StarterDashboard';
import ProDashboard from '@/components/dashboard/dashboards/ProDashboard';
import PremiumDashboard from '@/components/dashboard/dashboards/PremiumDashboard';

interface DashboardAppProps {
  userId: string;
  userEmail: string;
  initialPlan?: 'starter' | 'pro' | 'premium';
  initialRole?: 'admin' | 'user';
  supabaseUrl: string;
  supabaseAnonKey: string;
}

export default function DashboardApp({
  userId,
  userEmail,
  initialPlan = 'starter',
  initialRole = 'user',
  supabaseUrl,
  supabaseAnonKey
}: DashboardAppProps) {
  const [plan, setPlan] = useState(initialPlan);
  const [role, setRole] = useState(initialRole);
  const [isLoading, setIsLoading] = useState(true);
  const [restaurantName, setRestaurantName] = useState('');

  const supabase = createBrowserClient(supabaseUrl, supabaseAnonKey);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Fetch role
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', userId)
          .single();

        if (roleData?.role) {
          setRole(roleData.role);
          // Redirect admin to admin dashboard
          if (roleData.role === 'admin') {
            window.location.href = '/admin';
            return;
          }
        }

        // Fetch plan
        const { data: subData } = await supabase
          .from('user_subscriptions')
          .select('plan')
          .eq('user_id', userId)
          .single();

        if (subData?.plan) {
          setPlan(subData.plan);
        }

        // Fetch restaurant name
        const { data: settingsData } = await supabase
          .from('restaurant_settings')
          .select('restaurant_name')
          .eq('user_id', userId)
          .single();

        if (settingsData?.restaurant_name) {
          setRestaurantName(settingsData.restaurant_name);
        }

      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [userId, supabase]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const renderDashboard = () => {
    switch (plan) {
      case 'premium':
        return <PremiumDashboard />;
      case 'pro':
        return <ProDashboard />;
      case 'starter':
      default:
        return <StarterDashboard />;
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            {renderDashboard()}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
