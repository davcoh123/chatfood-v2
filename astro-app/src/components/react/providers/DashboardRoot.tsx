import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';

interface Profile {
  id: string;
  user_id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  role: 'admin' | 'user';
  plan: 'starter' | 'pro' | 'premium';
  created_at: string;
  updated_at: string;
}

interface DashboardRootProps {
  children: React.ReactNode;
  user: any | null;
  session: any | null;
  profile: Profile | null;
}

// Create a single global QueryClient instance
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 10 * 60 * 1000, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

/**
 * DashboardRoot - Provider universel pour le dashboard Astro
 * 
 * Ce composant résout l'architecture cassée de la migration React→Astro en:
 * 1. Fournissant un QueryClient global unique (évite la fragmentation du cache)
 * 2. Wrappant AuthProvider avec user/session/profile depuis Astro.locals
 * 3. Permettant à tous les hooks d'utiliser useAuth() comme dans l'ancien React
 * 
 * Utilisation dans les pages .astro:
 * ```astro
 * <DashboardRoot 
 *   client:only="react"
 *   user={Astro.locals.user}
 *   session={Astro.locals.session}
 *   profile={Astro.locals.profile}
 * >
 *   <YourComponent />
 * </DashboardRoot>
 * ```
 */
export const DashboardRoot: React.FC<DashboardRootProps> = ({ 
  children, 
  user, 
  session, 
  profile 
}) => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider 
        initialUser={user} 
        initialSession={session} 
        initialProfile={profile}
      >
        {children}
      </AuthProvider>
    </QueryClientProvider>
  );
};
