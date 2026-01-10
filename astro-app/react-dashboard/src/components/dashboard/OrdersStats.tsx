import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, DollarSign, Clock, Package } from 'lucide-react';
import { Order } from '@/hooks/useOrders';

interface OrdersStatsProps {
  todayOrders: Order[];
  todayRevenue: number;
  averagePreparationTime: number;
}

export const OrdersStats: React.FC<OrdersStatsProps> = ({ 
  todayOrders, 
  todayRevenue,
  averagePreparationTime 
}) => {
  const completedToday = todayOrders.filter(o => o.status === 'delivered').length;
  const pendingToday = todayOrders.filter(o => ['pending', 'confirmed', 'preparing', 'ready'].includes(o.status)).length;

  const stats = [
    {
      title: 'Commandes du jour',
      value: todayOrders.length,
      subtitle: `${completedToday} livrées, ${pendingToday} en cours`,
      icon: Package,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'CA du jour',
      value: `${todayRevenue.toFixed(2)}€`,
      subtitle: `Moyenne: ${todayOrders.length > 0 ? (todayRevenue / todayOrders.length).toFixed(2) : '0.00'}€ / commande`,
      icon: DollarSign,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Temps moyen',
      value: `${averagePreparationTime} min`,
      subtitle: 'De confirmation à prêt',
      icon: Clock,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: 'Performance',
      value: `${completedToday > 0 ? Math.round((completedToday / todayOrders.length) * 100) : 0}%`,
      subtitle: 'Taux de complétion',
      icon: TrendingUp,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
    },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{stat.subtitle}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Répartition par type de commande */}
      <Card>
        <CardHeader>
          <CardTitle>Répartition par type de commande (aujourd'hui)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {['scheduled_takeaway', 'immediate_takeaway', 'delivery'].map((type) => {
              const count = todayOrders.filter(o => o.commande_type === type).length;
              const percentage = todayOrders.length > 0 ? Math.round((count / todayOrders.length) * 100) : 0;
              const labels: Record<string, string> = {
                scheduled_takeaway: 'Programmé',
                immediate_takeaway: 'Immédiat',
                delivery: 'Livraison',
              };
              
              return (
                <div key={type} className="text-center p-4 bg-muted/30 rounded-lg">
                  <div className="text-2xl font-bold">{count}</div>
                  <div className="text-sm text-muted-foreground">{labels[type]}</div>
                  <div className="text-xs text-muted-foreground mt-1">{percentage}%</div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
