import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export function MaintenanceGuard() {
  const { profile, loading: authLoading } = useAuth();
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkMaintenanceMode();
  }, []);

  const checkMaintenanceMode = async () => {
    try {
      // Use public edge function to check maintenance mode (no auth required)
      const { data, error } = await supabase.functions.invoke('public-get-maintenance');

      if (error) {
        console.error('Error checking maintenance mode:', error);
        setMaintenanceMode(false); // Default to false on error
      } else {
        setMaintenanceMode(data?.maintenance_mode === true);
      }
    } catch (error) {
      console.error('Error checking maintenance mode:', error);
      setMaintenanceMode(false); // Default to false on error
    } finally {
      setLoading(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Chargement...</div>
      </div>
    );
  }

  // Si maintenance mode ET user n'est pas admin, rediriger
  if (maintenanceMode && profile?.role !== 'admin') {
    return <Navigate to="/maintenance" replace />;
  }

  return <Outlet />;
}
