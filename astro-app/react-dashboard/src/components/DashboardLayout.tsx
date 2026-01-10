import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/AppSidebar';

export const DashboardLayout: React.FC = () => {
  const { user, loading } = useAuth();

  console.log('🏠 [DashboardLayout] Render:', { loading, hasUser: !!user, userId: user?.id });

  useEffect(() => {
    console.log('🏠 [DashboardLayout] useEffect check:', { loading, hasUser: !!user });
    if (!loading && !user) {
      console.log('🏠 [DashboardLayout] No user found, redirecting to /login...');
      // Use absolute URL to redirect to Astro login page (not React Router)
      window.location.href = '/login';
    }
  }, [user, loading]);

  if (loading) {
    console.log('🏠 [DashboardLayout] Still loading, showing spinner...');
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-muted flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    console.log('🏠 [DashboardLayout] No user, returning null (redirect in progress)...');
    return null;
  }

  console.log('🏠 [DashboardLayout] User authenticated, rendering dashboard...');
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-to-br from-background to-muted">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header with Sidebar Trigger */}
          <header className="h-14 flex items-center justify-between border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
            <div className="flex items-center space-x-4">
              <SidebarTrigger className="hover:bg-muted p-2 rounded-md transition-colors" />
              <div className="h-4 w-px bg-border" />
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-auto min-w-0">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};