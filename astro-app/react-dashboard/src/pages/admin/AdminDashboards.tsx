import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AdminDashboardEditor } from '@/components/admin/AdminDashboardEditor';
import { Loader2 } from 'lucide-react';

import { MessageSquare, Calendar, TrendingUp, Users, Star, ShoppingCart, UtensilsCrossed } from 'lucide-react';

interface Profile {
  user_id: string;
  email: string;
  first_name: string;
  last_name: string;
}

interface UserSubscription {
  plan: string;
}

const DASHBOARD_SECTIONS = {
  starter: [
    { id: 'conversations', title: 'Conversations WhatsApp', type: 'conversations', icon: MessageSquare, color: 'text-green-600' },
    { id: 'whatsapp_messages', title: 'Messages WhatsApp', type: 'metric', icon: MessageSquare, color: 'text-green-600' },
    { id: 'orders', title: 'Nombre de commandes', type: 'metric', icon: ShoppingCart, color: 'text-orange-600' },
    { id: 'reservations_calendar', title: 'Calendrier de Réservations', type: 'calendar', icon: Calendar, color: 'text-blue-600' },
    { id: 'catalogue', title: 'Catalogue', type: 'catalogue', icon: UtensilsCrossed, color: 'text-orange-600' },
  ],
  pro: [
    { id: 'conversations', title: 'Conversations WhatsApp', type: 'conversations', icon: MessageSquare, color: 'text-green-600' },
    { id: 'daily_revenue', title: 'Revenu du jour', type: 'metric', icon: TrendingUp, color: 'text-emerald-600' },
    { id: 'daily_orders', title: 'Commandes', type: 'metric', icon: Calendar, color: 'text-blue-600' },
    { id: 'active_customers', title: 'Clients', type: 'metric', icon: Users, color: 'text-purple-600' },
    { id: 'satisfaction', title: 'Satisfaction', type: 'metric', icon: Star, color: 'text-yellow-600' },
    { id: 'reservations_calendar', title: 'Calendrier de Réservations', type: 'calendar', icon: Calendar, color: 'text-blue-600' },
    { id: 'catalogue', title: 'Catalogue', type: 'catalogue', icon: UtensilsCrossed, color: 'text-orange-600' },
  ],
  premium: [
    { id: 'conversations', title: 'Conversations WhatsApp', type: 'conversations', icon: MessageSquare, color: 'text-green-600' },
    { id: 'daily_revenue', title: 'Revenu Total', type: 'metric', icon: TrendingUp, color: 'text-emerald-600' },
    { id: 'daily_orders', title: 'Commandes', type: 'metric', icon: Calendar, color: 'text-blue-600' },
    { id: 'active_customers', title: 'Clients Actifs', type: 'metric', icon: Users, color: 'text-purple-600' },
    { id: 'restaurants', title: 'Restaurants', type: 'metric', icon: Star, color: 'text-yellow-600' },
    { id: 'reservations_calendar', title: 'Calendrier de Réservations', type: 'calendar', icon: Calendar, color: 'text-blue-600' },
    { id: 'catalogue', title: 'Catalogue', type: 'catalogue', icon: UtensilsCrossed, color: 'text-orange-600' },
  ],
};

export default function AdminDashboards() {
  const [selectedUserId, setSelectedUserId] = useState<string>('');

  // Fetch all users
  const { data: users, isLoading: usersLoading } = useQuery({
    queryKey: ['admin-users-list'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, email, first_name, last_name')
        .order('email');

      if (error) throw error;
      return data as Profile[];
    },
  });

  // Fetch selected user's plan
  const { data: userPlan, isLoading: planLoading } = useQuery({
    queryKey: ['user-plan', selectedUserId],
    queryFn: async () => {
      if (!selectedUserId) return null;

      const { data, error } = await supabase
        .from('user_subscriptions')
        .select('plan')
        .eq('user_id', selectedUserId)
        .single();

      if (error) throw error;
      return data as UserSubscription;
    },
    enabled: !!selectedUserId,
  });

  // Fetch all configs for selected user
  const { data: configs, refetch: refetchConfigs } = useQuery({
    queryKey: ['dashboard-configs-all', selectedUserId],
    queryFn: async () => {
      if (!selectedUserId) return [];

      const { data, error } = await supabase
        .from('dashboard_configurations')
        .select('*')
        .eq('user_id', selectedUserId);

      if (error) throw error;
      return data;
    },
    enabled: !!selectedUserId,
  });

  const selectedUser = users?.find(u => u.user_id === selectedUserId);
  const plan = userPlan?.plan as keyof typeof DASHBOARD_SECTIONS || 'starter';
  const sections = DASHBOARD_SECTIONS[plan] || DASHBOARD_SECTIONS.starter;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Gestion des Dashboards</h1>
        <p className="text-muted-foreground mt-2">
          Personnalisez les dashboards utilisateurs et configurez les webhooks Zapier
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Sélectionner un utilisateur</CardTitle>
          <CardDescription>
            Choisissez un utilisateur pour personnaliser son dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          {usersLoading ? (
            <div className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span className="text-sm text-muted-foreground">Chargement...</span>
            </div>
          ) : (
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un utilisateur" />
              </SelectTrigger>
              <SelectContent>
                {users?.map((user) => (
                  <SelectItem key={user.user_id} value={user.user_id}>
                    {user.email} - {user.first_name} {user.last_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </CardContent>
      </Card>

      {selectedUser && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>{selectedUser.first_name} {selectedUser.last_name}</CardTitle>
                <CardDescription>{selectedUser.email}</CardDescription>
              </div>
              {planLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Badge className="uppercase">{plan}</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {planLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <AdminDashboardEditor
                userId={selectedUserId}
                userName={`${selectedUser.first_name} ${selectedUser.last_name}`}
                plan={plan}
                sections={sections}
                configs={configs || []}
                onConfigSave={() => refetchConfigs()}
              />
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
