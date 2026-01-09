import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';

interface CategoryRevenueData {
  name: string;
  revenue: number;
  percentage: number;
  color: string;
}

interface RevenueCategoryChartProps {
  categoryData: CategoryRevenueData[];
  isLoading?: boolean;
}

export const RevenueCategoryChart = ({
  categoryData,
  isLoading = false,
}: RevenueCategoryChartProps) => {
  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-[300px] w-full" />
        <Skeleton className="h-[300px] w-full" />
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} className="h-24" />)}
        </div>
      </div>
    );
  }

  if (categoryData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-muted-foreground">
        Aucune donnée de catégorie disponible
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Graphique en secteurs */}
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={categoryData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percentage }) => `${name} ${percentage}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="revenue"
              isAnimationActive={true}
            >
              {categoryData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
              formatter={(value: number) => [`€${value}`, 'Revenus']}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Graphique en barres pour une vue détaillée */}
      <div className="h-[300px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={categoryData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 5,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="name" 
              className="text-sm"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis 
              className="text-sm"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
              tickFormatter={(value) => `€${value}`}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
              formatter={(value: number) => [`€${value}`, 'Revenus']}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
            />
            <Bar 
              dataKey="revenue" 
              radius={[4, 4, 0, 0]}
              isAnimationActive={true}
            >
              {categoryData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Tableau de détails */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {categoryData.slice(0, 5).map((category) => (
          <div 
            key={category.name}
            className="p-4 rounded-lg border bg-card text-card-foreground"
            style={{ borderLeft: `4px solid ${category.color}` }}
          >
            <div className="space-y-2">
              <h4 className="font-semibold text-sm">{category.name}</h4>
              <div className="space-y-1">
                <p className="text-2xl font-bold">€{category.revenue}</p>
                <p className="text-xs text-muted-foreground">{category.percentage}% du total</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
