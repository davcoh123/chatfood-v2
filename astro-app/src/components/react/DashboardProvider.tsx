/**
 * DashboardProvider - Wrapper pour tous les composants dashboard
 * Fournit le contexte React Query et Auth nécessaires
 */

import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';

// Create a client for each provider instance
const createQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      refetchOnWindowFocus: false,
    },
  },
});

interface DashboardProviderProps {
  children: React.ReactNode;
  userId: string;
  userEmail?: string;
  userPlan?: string;
  userRole?: string;
}

// Context for user data from SSR
interface UserContextType {
  userId: string;
  userEmail: string;
  userPlan: string;
  userRole: string;
}

const UserContext = React.createContext<UserContextType | null>(null);

export const useUser = () => {
  const context = React.useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within DashboardProvider');
  }
  return context;
};

export function DashboardProvider({ 
  children, 
  userId,
  userEmail = '',
  userPlan = 'starter',
  userRole = 'user'
}: DashboardProviderProps) {
  // Create query client instance for this provider
  const [queryClient] = React.useState(() => createQueryClient());

  const userValue: UserContextType = {
    userId,
    userEmail,
    userPlan,
    userRole,
  };

  return (
    <QueryClientProvider client={queryClient}>
      <UserContext.Provider value={userValue}>
        {children}
        <Toaster />
      </UserContext.Provider>
    </QueryClientProvider>
  );
}

export default DashboardProvider;
