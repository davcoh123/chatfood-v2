import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';

interface VolumeData {
  week: string;
  orders: number;
  growth: number;
}

interface OrdersVolumeChartProps {
  volumeData: VolumeData[];
  isLoading?: boolean;
}

export const OrdersVolumeChart = ({
  volumeData,
  isLoading = false,
}: OrdersVolumeChartProps) => {
  if (isLoading) {
    return <Skeleton className="h-[400px] w-full" />;
  }

  if (volumeData.length === 0) {
    return (
      <div className="flex items-center justify-center h-[400px] text-muted-foreground">
        Aucune donnée de volume disponible
      </div>
    );
  }

  return (
    <div className="h-[400px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={volumeData}>
          <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
          <XAxis dataKey="week" tick={{ fill: 'hsl(var(--muted-foreground))' }} />
          <YAxis tick={{ fill: 'hsl(var(--muted-foreground))' }} />
          <Tooltip 
            contentStyle={{
              backgroundColor: 'hsl(var(--background))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px'
            }}
            formatter={(value: number) => [`${value} commandes`, 'Volume']}
          />
          <Line type="monotone" dataKey="orders" stroke="hsl(var(--primary))" strokeWidth={3} isAnimationActive={true} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
