/**
 * CataloguePageWrapper - Wrapper pour la page catalogue avec tous les providers
 */

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import CataloguePage from '@/components/react/CataloguePage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

interface CataloguePageWrapperProps {
  userId: string;
}

export function CataloguePageWrapper({ userId }: CataloguePageWrapperProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <CataloguePage userId={userId} />
      <Toaster />
    </QueryClientProvider>
  );
}

export default CataloguePageWrapper;
