/**
 * AnalyticsPageWrapper - Wrapper pour la page analytics avec tous les providers
 */

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import AnalyticsPage from '@/components/react/AnalyticsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

interface AnalyticsPageWrapperProps {
  userId: string;
  userPlan: string;
}

export function AnalyticsPageWrapper({ userId, userPlan }: AnalyticsPageWrapperProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <AnalyticsPage userId={userId} userPlan={userPlan} />
      <Toaster />
    </QueryClientProvider>
  );
}

export default AnalyticsPageWrapper;
