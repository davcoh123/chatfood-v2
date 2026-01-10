import React, { useEffect, useState } from 'react';
import { Users, UserPlus, Shield, AlertTriangle, Activity, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AdminStats {
  totalUsers: number;
  newUsersThisWeek: number;
  activeUsers: number;
  blockedAccounts: number;
  failedAttemptsToday: number;
  adminCount: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    newUsersThisWeek: 0,
    activeUsers: 0,
    blockedAccounts: 0,
    failedAttemptsToday: 0,
    adminCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const fetchAdminStats = async () => {
    try {
      // Total users
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // New users this week
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const { count: newUsersThisWeek } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', weekAgo.toISOString());

      // Admin count - now from user_roles table
      const { count: adminCount } = await supabase
        .from('user_roles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'admin');

      // Blocked accounts
      const { count: blockedAccounts } = await supabase
        .from('security_blocks')
        .select('*', { count: 'exact', head: true })
        .gt('blocked_until', new Date().toISOString());

      // Failed attempts today
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const { count: failedAttemptsToday } = await supabase
        .from('login_attempts')
        .select('*', { count: 'exact', head: true })
        .eq('success', false)
        .gte('attempt_time', todayStart.toISOString());

      setStats({
        totalUsers: totalUsers || 0,
        newUsersThisWeek: newUsersThisWeek || 0,
        activeUsers: 0, // TODO: Implement based on last login tracking
        blockedAccounts: blockedAccounts || 0,
        failedAttemptsToday: failedAttemptsToday || 0,
        adminCount: adminCount || 0,
      });
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      toast.error('Erreur lors du chargement des statistiques');
    } finally {
      setLoading(false);
    }
  };

  const statsCards = [
    {
      title: 'Total Utilisateurs',
      value: stats.totalUsers,
      description: `dont ${stats.adminCount} administrateurs`,
      icon: Users,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Nouveaux Utilisateurs',
      value: stats.newUsersThisWeek,
      description: 'Cette semaine',
      icon: UserPlus,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Utilisateurs Actifs',
      value: stats.activeUsers,
      description: '7 derniers jours',
      icon: Activity,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: 'Comptes Bloqués',
      value: stats.blockedAccounts,
      description: 'Actuellement',
      icon: Shield,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
    },
    {
      title: 'Tentatives Échouées',
      value: stats.failedAttemptsToday,
      description: "Aujourd'hui",
      icon: AlertTriangle,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
    {
      title: 'Taux de Croissance',
      value: stats.totalUsers > 0 ? `+${Math.round((stats.newUsersThisWeek / stats.totalUsers) * 100)}%` : '0%',
      description: 'Cette semaine',
      icon: TrendingUp,
      color: 'text-cyan-500',
      bgColor: 'bg-cyan-500/10',
    },
  ];

  if (loading) {
    return (
      <div className="p-8 space-y-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Administrateur</h1>
        <p className="text-muted-foreground mt-2">
          Vue d'ensemble de la plateforme et des utilisateurs
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {statsCards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title} className="hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                <div className={`p-2 rounded-lg ${card.bgColor}`}>
                  <Icon className={`h-4 w-4 ${card.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Accès Rapides</CardTitle>
            <CardDescription>Actions administrateur fréquentes</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <a
              href="/admin/users"
              className="block p-4 rounded-lg border hover:bg-muted transition-colors"
            >
              <div className="font-medium">Gestion des Utilisateurs</div>
              <div className="text-sm text-muted-foreground">
                Voir, modifier et gérer tous les comptes utilisateurs
              </div>
            </a>
            <a
              href="/admin/security"
              className="block p-4 rounded-lg border hover:bg-muted transition-colors"
            >
              <div className="font-medium">Sécurité & Logs</div>
              <div className="text-sm text-muted-foreground">
                Consulter les logs de sécurité et les tentatives de connexion
              </div>
            </a>
            <a
              href="/admin/settings"
              className="block p-4 rounded-lg border hover:bg-muted transition-colors"
            >
              <div className="font-medium">Paramètres Système</div>
              <div className="text-sm text-muted-foreground">
                Configurer les paramètres de la plateforme
              </div>
            </a>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Alertes Récentes</CardTitle>
            <CardDescription>Événements nécessitant votre attention</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.blockedAccounts > 0 && (
              <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 mb-2">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-red-500" />
                  <span className="font-medium">
                    {stats.blockedAccounts} compte(s) bloqué(s)
                  </span>
                </div>
              </div>
            )}
            {stats.failedAttemptsToday > 10 && (
              <div className="p-4 rounded-lg bg-orange-500/10 border border-orange-500/20 mb-2">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                  <span className="font-medium">
                    Activité suspecte détectée ({stats.failedAttemptsToday} tentatives échouées)
                  </span>
                </div>
              </div>
            )}
            {stats.blockedAccounts === 0 && stats.failedAttemptsToday <= 10 && (
              <div className="text-sm text-muted-foreground">
                Aucune alerte pour le moment. Tout fonctionne normalement.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
