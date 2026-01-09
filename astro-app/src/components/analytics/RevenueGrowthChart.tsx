import React from 'react';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, ComposedChart, Bar } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';

interface GrowthData {
  month: string;
  revenue: number;
  growth: number;
}

interface RevenueGrowthChartProps {
  growthData: GrowthData[];
  averageGrowth?: number;
  bestMonth?: string;
  bestMonthGrowth?: number;
  isLoading?: boolean;
}

export const RevenueGrowthChart = ({
  growthData,
  averageGrowth = 0,
  bestMonth = 'N/A',
  bestMonthGrowth = 0,
  isLoading = false,
}: RevenueGrowthChartProps) => {
  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-[400px] w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-24" />)}
        </div>
      </div>
    );
  }

  if (growthData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[400px] text-muted-foreground">
        Aucune donnée de croissance disponible
      </div>
    );
  }

  // Calculate total revenue over the period
  const totalRevenue = growthData.reduce((sum, d) => sum + d.revenue, 0);
  const monthsWithRevenue = growthData.filter(d => d.revenue > 0).length;

  return (
    <div className="space-y-8">
      {/* Graphique principal de croissance */}
      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart
            data={growthData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <defs>
              <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="month" 
              className="text-sm"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis 
              yAxisId="revenue"
              orientation="left"
              className="text-sm"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              tickFormatter={(value) => `€${value}`}
            />
            <YAxis 
              yAxisId="growth"
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
              formatter={(value: number, name: string) => {
                if (name === 'revenue') {
                  return [`€${value}`, 'Revenus'];
                }
                return [`${value}%`, 'Croissance'];
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
            />
            
            {/* Revenus actuels */}
            <Area 
              yAxisId="revenue"
              type="monotone" 
              dataKey="revenue" 
              stroke="hsl(var(--primary))" 
              strokeWidth={3}
              fill="url(#growthGradient)"
              fillOpacity={0.6}
              isAnimationActive={true}
            />
            
            {/* Pourcentage de croissance */}
            <Bar 
              yAxisId="growth"
              dataKey="growth" 
              fill="hsl(var(--accent))"
              fillOpacity={0.7}
              radius={[2, 2, 0, 0]}
              isAnimationActive={true}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Métriques de croissance */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-lg border bg-card text-card-foreground bg-gradient-to-br from-green-500/5 to-green-500/10">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Croissance moyenne</p>
            <p className="text-2xl font-bold text-green-600">{averageGrowth >= 0 ? '+' : ''}{averageGrowth}%</p>
            <p className="text-xs text-muted-foreground">Sur {monthsWithRevenue} mois avec activité</p>
          </div>
        </div>
        
        <div className="p-4 rounded-lg border bg-card text-card-foreground bg-gradient-to-br from-blue-500/5 to-blue-500/10">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Meilleur mois</p>
            <p className="text-2xl font-bold text-blue-600">{bestMonth}</p>
            <p className="text-xs text-muted-foreground">{bestMonthGrowth >= 0 ? '+' : ''}{bestMonthGrowth}% de croissance</p>
          </div>
        </div>
        
        <div className="p-4 rounded-lg border bg-card text-card-foreground bg-gradient-to-br from-purple-500/5 to-purple-500/10">
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Revenus totaux</p>
            <p className="text-2xl font-bold text-purple-600">€{totalRevenue.toLocaleString('fr-FR')}</p>
            <p className="text-xs text-muted-foreground">Sur la période</p>
          </div>
        </div>
      </div>
    </div>
  );
};
