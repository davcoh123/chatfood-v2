/**
 * ConversationsPageWrapper - Wrapper pour la page conversations avec tous les providers
 */

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { ConversationsWidget } from '@/components/dashboard/ConversationsWidget';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
      refetchInterval: 30000, // Auto-refresh conversations every 30s
    },
  },
});

interface ConversationsPageWrapperProps {
  userId: string;
}

export function ConversationsPageWrapper({ userId }: ConversationsPageWrapperProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <ConversationsWidget userId={userId} />
      <Toaster />
    </QueryClientProvider>
  );
}

export default ConversationsPageWrapper;
