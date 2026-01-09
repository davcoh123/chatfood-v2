import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';

interface TopProduct {
  name: string;
  sales: number;
  revenue: number;
  category: string;
  percentage: number;
}

interface PopularProductsChartProps {
  products: TopProduct[];
  categoryColors?: Record<string, string>;
  isLoading?: boolean;
}

const DEFAULT_CATEGORY_COLORS: Record<string, string> = {
  'Pizzas': '#FF6B6B',
  'Burgers': '#4ECDC4', 
  'Salades': '#96CEB4',
  'Pâtes': '#45B7D1',
  'Desserts': '#FFEAA7',
  'Boissons': '#A29BFE',
  'Entrées': '#FD79A8',
  'Autres': '#B2BEC3',
};

export const PopularProductsChart = ({
  products,
  categoryColors = DEFAULT_CATEGORY_COLORS,
  isLoading = false,
}: PopularProductsChartProps) => {
  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-[400px] w-full" />
        <Skeleton className="h-[350px] w-full" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex items-center justify-center h-[400px] text-muted-foreground">
        Aucune donnée de produit disponible
      </div>
    );
  }

  const getCategoryColor = (category: string) => {
    return categoryColors[category] || categoryColors['Autres'] || '#B2BEC3';
  };

  return (
    <div className="space-y-8">
      {/* Graphique en barres des produits les plus vendus */}
      <div className="h-[400px] w-full">
        <h4 className="text-lg font-semibold mb-4">Top {Math.min(products.length, 8)} des produits les plus vendus</h4>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={products.slice(0, 8)}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 80,
            }}
          >
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="name" 
              className="text-sm"
              tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
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
              formatter={(value: number, name: string, props: any) => [
                name === 'sales' ? `${value} ventes` : `€${value}`,
                name === 'sales' ? 'Ventes' : 'Revenus'
              ]}
              labelFormatter={(label: string, payload: any) => {
                const data = payload?.[0]?.payload;
                return data ? `${label} (${data.category})` : label;
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
            />
            <Bar 
              dataKey="sales" 
              radius={[4, 4, 0, 0]}
              isAnimationActive={true}
            >
              {products.slice(0, 8).map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={getCategoryColor(entry.category)} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Graphique en secteurs pour la répartition */}
      <div className="h-[350px] w-full">
        <h4 className="text-lg font-semibold mb-4">Répartition des ventes par produit</h4>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={products.slice(0, 6)}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percentage }) => `${name.split(' ')[0]} ${percentage}%`}
              outerRadius={120}
              fill="#8884d8"
              dataKey="sales"
              isAnimationActive={true}
            >
              {products.slice(0, 6).map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={getCategoryColor(entry.category)} 
                />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
              }}
              formatter={(value: number, name: string, props: any) => [
                `${value} ventes (${props.payload.percentage}%)`,
                'Ventes'
              ]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Tableau détaillé */}
      <div className="space-y-4">
        <h4 className="text-lg font-semibold">Détails par produit</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {products.slice(0, 4).map((product, index) => (
            <div 
              key={product.name}
              className="p-4 rounded-lg border bg-card text-card-foreground"
              style={{ 
                borderLeft: `4px solid ${getCategoryColor(product.category)}` 
              }}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h5 className="font-semibold text-sm truncate">{product.name}</h5>
                  <span className="text-xs bg-muted px-2 py-1 rounded">{product.category}</span>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Ventes:</span>
                    <span className="font-semibold">{product.sales}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Revenus:</span>
                    <span className="font-semibold">€{product.revenue}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Part:</span>
                    <span className="font-semibold text-primary">{product.percentage}%</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
