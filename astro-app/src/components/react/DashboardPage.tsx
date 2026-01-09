/**
 * DashboardPage - Page Dashboard avec sélection par plan
 * Migré depuis la version React
 */

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import StarterDashboard from '@/components/dashboards/StarterDashboard';
import ProDashboard from '@/components/dashboards/ProDashboard';
import PremiumDashboard from '@/components/dashboards/PremiumDashboard';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      refetchOnWindowFocus: false,
    },
  },
});

export interface DashboardPageProps {
  userId: string;
  firstName: string;
  plan: 'starter' | 'pro' | 'premium';
  onboardingCompleted: boolean;
}

function DashboardContent({ userId, firstName, plan, onboardingCompleted }: DashboardPageProps) {
  // Render dashboard based on plan
  switch(plan) {
    case 'premium':
      return <PremiumDashboard userId={userId} firstName={firstName} />;
    case 'pro':
      return <ProDashboard userId={userId} firstName={firstName} />;
    case 'starter':
    default:
      return <StarterDashboard userId={userId} firstName={firstName} onboardingCompleted={onboardingCompleted} />;
  }
}

export function DashboardPage(props: DashboardPageProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <DashboardContent {...props} />
      <Toaster />
    </QueryClientProvider>
  );
}

export default DashboardPage;
