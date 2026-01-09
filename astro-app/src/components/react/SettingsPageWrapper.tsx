/**
 * SettingsPageWrapper - Wrapper pour la page paramètres avec tous les providers
 */

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import SettingsPage from '@/components/react/SettingsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

interface SettingsPageWrapperProps {
  userId: string;
  userEmail: string;
}

export function SettingsPageWrapper({ userId, userEmail }: SettingsPageWrapperProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <SettingsPage userId={userId} userEmail={userEmail} />
      <Toaster />
    </QueryClientProvider>
  );
}

export default SettingsPageWrapper;
