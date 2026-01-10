import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, ComposedChart, AreaChart, Area } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';

interface OrdersByDay {
  day: string;
  orders: number;
  percentage: number;
}

interface OrdersByHour {
  hour: string;
  orders: number;
}

interface OrdersTimeChartProps {
  weeklyData: OrdersByDay[];
  hourlyData: OrdersByHour[];
  peakDay?: string;
  peakDayOrders?: number;
  peakHour?: string;
  peakHourOrders?: number;
  weekendVsWeekdayRatio?: number;
  isLoading?: boolean;
}

export const OrdersTimeChart = ({
  weeklyData,
  hourlyData,
  peakDay = 'N/A',
  peakDayOrders = 0,
  peakHour = 'N/A',
  peakHourOrders = 0,
  weekendVsWeekdayRatio = 0,
  isLoading = false,
}: OrdersTimeChartProps) => {
  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-[350px] w-full" />
        <Skeleton className="h-[350px] w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Graphique des jours de la semaine */}
      <div className="h-[350px] w-full">
        <h4 className="text-lg font-semibold mb-4">Répartition par jour de la semaine</h4>
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={weeklyData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="day" 
              className="text-sm"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis 
              yAxisId="orders"
              orientation="left"
              className="text-sm"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis 
              yAxisId="percentage"
              orientation="right"
              className="text-sm"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              tickFormatter={(value) => `${value}%`}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
              formatter={(value: number, name: string) => [
                name === 'orders' ? `${value} commandes` : `${value}%`,
                name === 'orders' ? 'Commandes' : 'Pourcentage'
              ]}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
            />
            
            <Bar 
              yAxisId="orders"
              dataKey="orders" 
              fill="hsl(var(--primary))"
              fillOpacity={0.8}
              radius={[4, 4, 0, 0]}
              isAnimationActive={true}
            />
            
            <Line 
              yAxisId="percentage"
              type="monotone" 
              dataKey="percentage" 
              stroke="hsl(var(--secondary))" 
              strokeWidth={3}
              dot={{ fill: 'hsl(var(--secondary))', strokeWidth: 2, r: 5 }}
              isAnimationActive={true}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Graphique des heures de pointe */}
      <div className="h-[350px] w-full">
        <h4 className="text-lg font-semibold mb-4">Répartition par heure de la journée</h4>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={hourlyData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <defs>
              <linearGradient id="ordersGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="hour" 
              className="text-sm"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis 
              className="text-sm"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
              formatter={(value: number) => [`${value} commandes`, 'Commandes']}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
            />
            <Area 
              type="monotone" 
              dataKey="orders" 
              stroke="hsl(var(--primary))" 
              strokeWidth={3}
              fill="url(#ordersGradient)"
              fillOpacity={0.6}
              isAnimationActive={true}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Statistiques détaillées */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-lg border bg-card text-card-foreground bg-gradient-to-br from-blue-500/5 to-blue-500/10">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Jour le plus actif</p>
            <p className="text-2xl font-bold text-blue-600">{peakDay}</p>
            <p className="text-xs text-muted-foreground">{peakDayOrders} commandes</p>
          </div>
        </div>
        
        <div className="p-4 rounded-lg border bg-card text-card-foreground bg-gradient-to-br from-purple-500/5 to-purple-500/10">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Heure de pointe</p>
            <p className="text-2xl font-bold text-purple-600">{peakHour}</p>
            <p className="text-xs text-muted-foreground">{peakHourOrders} commandes/heure</p>
          </div>
        </div>
        
        <div className="p-4 rounded-lg border bg-card text-card-foreground bg-gradient-to-br from-green-500/5 to-green-500/10">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Weekend vs Semaine</p>
            <p className="text-2xl font-bold text-green-600">{weekendVsWeekdayRatio >= 0 ? '+' : ''}{weekendVsWeekdayRatio}%</p>
            <p className="text-xs text-muted-foreground">{weekendVsWeekdayRatio >= 0 ? 'Plus de' : 'Moins de'} commandes weekend</p>
          </div>
        </div>
      </div>
    </div>
  );
};
