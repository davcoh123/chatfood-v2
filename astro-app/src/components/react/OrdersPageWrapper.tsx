/**
 * OrdersPageWrapper - Wrapper pour la page commandes avec tous les providers
 */

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { OrdersPanel } from '@/components/dashboard/OrdersPanel';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

interface OrdersPageWrapperProps {
  userId: string;
  userPlan?: string;
}

export function OrdersPageWrapper({ userId, userPlan }: OrdersPageWrapperProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <OrdersPanel userId={userId} userPlan={userPlan} />
      <Toaster />
    </QueryClientProvider>
  );
}

export default OrdersPageWrapper;
