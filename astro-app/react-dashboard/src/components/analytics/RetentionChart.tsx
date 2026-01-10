import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';

interface RetentionData {
  month: string;
  retention: number;
  newCustomers: number;
  returningCustomers: number;
}

interface RetentionChartProps {
  retentionData: RetentionData[];
  isLoading?: boolean;
}

export const RetentionChart = ({
  retentionData,
  isLoading = false,
}: RetentionChartProps) => {
  if (isLoading) {
    return <Skeleton className="h-[400px] w-full" />;
  }

  if (retentionData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[400px] text-muted-foreground">
        Aucune donnée de rétention disponible
      </div>
    );
  }

  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={retentionData}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis dataKey="month" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
          <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} tickFormatter={(value) => `${value}%`} />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'hsl(var(--background))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px'
            }}
            formatter={(value: number, name: string) => [
              name === 'retention' ? `${value}%` : value,
              name === 'retention' ? 'Rétention' : name === 'newCustomers' ? 'Nouveaux clients' : 'Clients récurrents'
            ]}
          />
          <Line type="monotone" dataKey="retention" stroke="hsl(var(--primary))" strokeWidth={3} isAnimationActive={true} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
