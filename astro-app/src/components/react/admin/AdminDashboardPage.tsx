import { useEffect, useState } from 'react';
import { Users, UserPlus, Shield, AlertTriangle, Activity, TrendingUp, Ticket, Settings, Lock, LayoutDashboard, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AdminStats {
  totalUsers: number;
  newUsersThisWeek: number;
  activeUsers: number;
  blockedAccounts: number;
  failedAttemptsToday: number;
  adminCount: number;
  openTickets: number;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    newUsersThisWeek: 0,
    activeUsers: 0,
    blockedAccounts: 0,
    failedAttemptsToday: 0,
    adminCount: 0,
    openTickets: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const fetchAdminStats = async () => {
    try {
      const { count: totalUsers } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const { count: newUsersThisWeek } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', weekAgo.toISOString());

      const { count: adminCount } = await supabase
        .from('user_roles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'admin');

      const { count: blockedAccounts } = await supabase
        .from('security_blocks')
        .select('*', { count: 'exact', head: true })
        .gt('blocked_until', new Date().toISOString());

      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      const { count: failedAttemptsToday } = await supabase
        .from('login_attempts')
        .select('*', { count: 'exact', head: true })
        .eq('success', false)
        .gte('attempt_time', todayStart.toISOString());

      const { count: openTickets } = await supabase
        .from('support_tickets')
        .select('*', { count: 'exact', head: true })
        .in('status', ['open', 'awaiting_admin', 'in_progress']);

      setStats({
        totalUsers: totalUsers || 0,
        newUsersThisWeek: newUsersThisWeek || 0,
        activeUsers: 0,
        blockedAccounts: blockedAccounts || 0,
        failedAttemptsToday: failedAttemptsToday || 0,
        adminCount: adminCount || 0,
        openTickets: openTickets || 0,
      });
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      toast.error('Erreur lors du chargement des statistiques');
    } finally {
      setLoading(false);
    }
  };

  const adminLinks = [
    { href: '/admin/users', icon: Users, label: 'Utilisateurs', description: 'Gérer les comptes utilisateurs' },
    { href: '/admin/tickets', icon: Ticket, label: 'Tickets', description: 'Support et demandes', badge: stats.openTickets },
    { href: '/admin/security', icon: Lock, label: 'Sécurité', description: 'Logs et blocages' },
    { href: '/admin/settings', icon: Settings, label: 'Paramètres', description: 'Configuration système' },
    { href: '/admin/dashboards', icon: LayoutDashboard, label: 'Dashboards', description: 'Aperçu des restaurants' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Administration</h1>
        <p className="text-gray-500">Vue d'ensemble du système</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">Total utilisateurs</p>
              <Users className="h-4 w-4 text-blue-600" />
            </div>
            {loading ? <Skeleton className="h-8 w-16" /> : (
              <p className="text-2xl font-bold">{stats.totalUsers}</p>
            )}
            <p className="text-xs text-green-600">+{stats.newUsersThisWeek} cette semaine</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">Tickets ouverts</p>
              <Ticket className="h-4 w-4 text-orange-600" />
            </div>
            {loading ? <Skeleton className="h-8 w-16" /> : (
              <p className="text-2xl font-bold text-orange-600">{stats.openTickets}</p>
            )}
            <p className="text-xs text-gray-400">En attente</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">Comptes bloqués</p>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </div>
            {loading ? <Skeleton className="h-8 w-16" /> : (
              <p className="text-2xl font-bold text-red-600">{stats.blockedAccounts}</p>
            )}
            <p className="text-xs text-gray-400">{stats.failedAttemptsToday} échecs aujourd'hui</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm text-gray-500">Administrateurs</p>
              <Shield className="h-4 w-4 text-purple-600" />
            </div>
            {loading ? <Skeleton className="h-8 w-16" /> : (
              <p className="text-2xl font-bold text-purple-600">{stats.adminCount}</p>
            )}
            <p className="text-xs text-gray-400">Actifs</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {adminLinks.map((link) => (
          <a key={link.href} href={link.href}>
            <Card className="hover:border-green-500 hover:shadow-md transition-all cursor-pointer group">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 bg-gray-100 group-hover:bg-green-100 rounded-lg transition-colors">
                  <link.icon className="h-6 w-6 text-gray-600 group-hover:text-green-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">{link.label}</p>
                    {link.badge && link.badge > 0 && (
                      <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs rounded-full">
                        {link.badge}
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{link.description}</p>
                </div>
                <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-green-600 group-hover:translate-x-1 transition-all" />
              </CardContent>
            </Card>
          </a>
        ))}
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Activité récente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-8">
            Les logs d'activité apparaîtront ici
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
