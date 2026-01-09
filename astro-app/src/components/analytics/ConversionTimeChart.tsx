import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';

interface ConversionTimeData {
  timeRange: string;
  customers: number;
  percentage: number;
}

interface ConversionTimeChartProps {
  data?: ConversionTimeData[];
  isLoading?: boolean;
}

export const ConversionTimeChart = ({ data = [], isLoading = false }: ConversionTimeChartProps) => {
  if (isLoading) {
    return <Skeleton className="h-[400px] w-full" />;
  }

  if (data.length === 0) {
    return (
      <div className="h-[400px] w-full flex items-center justify-center text-muted-foreground">
        Pas de données de conversion disponibles
      </div>
    );
  }

  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="conversionGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis dataKey="timeRange" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
          <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'hsl(var(--background))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px'
            }}
            formatter={(value: number) => [`${value} clients`, 'Clients']}
          />
          <Area type="monotone" dataKey="customers" stroke="hsl(var(--primary))" fill="url(#conversionGradient)" isAnimationActive={true} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ConversionTimeChart;
