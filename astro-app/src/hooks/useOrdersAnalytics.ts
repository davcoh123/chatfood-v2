import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { startOfMonth, endOfMonth, format, getDay, getHours, startOfWeek, endOfWeek, subMonths } from 'date-fns';
import { fr } from 'date-fns/locale';

interface OrdersByDay {
  day: string;
  orders: number;
  percentage: number;
}

interface OrdersByHour {
  hour: string;
  orders: number;
}

interface WeeklyVolume {
  week: string;
  orders: number;
  growth: number;
}

export function useOrdersAnalytics() {
  const { profile } = useAuth();
  const userId = profile?.user_id || '';

  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders-analytics', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('chatbot_orders')
        .select('id, heure_de_commande, status, price_total')
        .eq('user_id', userId)
        .order('heure_de_commande', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
  });

  // Calculate orders this month
  const now = new Date();
  const startOfThisMonth = startOfMonth(now);
  const endOfThisMonth = endOfMonth(now);
  const startOfLastMonth = startOfMonth(subMonths(now, 1));
  const endOfLastMonth = endOfMonth(subMonths(now, 1));

  const ordersThisMonth = orders?.filter(order => {
    const orderDate = new Date(order.heure_de_commande);
    return orderDate >= startOfThisMonth && orderDate <= endOfThisMonth;
  }).length || 0;

  const ordersLastMonth = orders?.filter(order => {
    const orderDate = new Date(order.heure_de_commande);
    return orderDate >= startOfLastMonth && orderDate <= endOfLastMonth;
  }).length || 0;

  const ordersGrowth = ordersLastMonth > 0 
    ? Math.round(((ordersThisMonth - ordersLastMonth) / ordersLastMonth) * 100) 
    : 0;

  // Calculate orders by day of week
  const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  const ordersByDayMap: Record<number, number> = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };
  
  orders?.forEach(order => {
    const dayOfWeek = getDay(new Date(order.heure_de_commande));
    ordersByDayMap[dayOfWeek] = (ordersByDayMap[dayOfWeek] || 0) + 1;
  });

  const totalOrders = orders?.length || 1;
  const ordersByDayOfWeek: OrdersByDay[] = [1, 2, 3, 4, 5, 6, 0].map(dayIndex => ({
    day: dayNames[dayIndex],
    orders: ordersByDayMap[dayIndex],
    percentage: Math.round((ordersByDayMap[dayIndex] / totalOrders) * 100 * 10) / 10,
  }));

  // Find peak day
  const peakDayData = ordersByDayOfWeek.reduce((max, curr) => 
    curr.orders > max.orders ? curr : max, ordersByDayOfWeek[0]);
  const peakDay = peakDayData?.day || 'N/A';

  // Calculate orders by hour
  const ordersByHourMap: Record<number, number> = {};
  for (let i = 0; i < 24; i++) {
    ordersByHourMap[i] = 0;
  }
  
  orders?.forEach(order => {
    const hour = getHours(new Date(order.heure_de_commande));
    ordersByHourMap[hour] = (ordersByHourMap[hour] || 0) + 1;
  });

  const ordersByHour: OrdersByHour[] = Object.entries(ordersByHourMap)
    .filter(([hour]) => parseInt(hour) >= 11 && parseInt(hour) <= 23)
    .map(([hour, count]) => ({
      hour: `${hour}h`,
      orders: count,
    }));

  // Find peak hour
  const peakHourEntry = Object.entries(ordersByHourMap).reduce((max, curr) => 
    curr[1] > max[1] ? curr : max, ['0', 0]);
  const peakHour = `${peakHourEntry[0]}h`;
  const peakHourOrders = peakHourEntry[1];

  // Weekend vs weekday ratio
  const weekendOrders = (ordersByDayMap[0] || 0) + (ordersByDayMap[6] || 0);
  const weekdayOrders = (ordersByDayMap[1] || 0) + (ordersByDayMap[2] || 0) + 
                        (ordersByDayMap[3] || 0) + (ordersByDayMap[4] || 0) + 
                        (ordersByDayMap[5] || 0);
  const weekendVsWeekdayRatio = weekdayOrders > 0 
    ? Math.round(((weekendOrders / 2) / (weekdayOrders / 5) - 1) * 100)
    : 0;

  // Calculate weekly volume (last 8 weeks)
  const weeklyVolume: WeeklyVolume[] = [];
  for (let i = 7; i >= 0; i--) {
    const weekStart = startOfWeek(subMonths(now, i * 0.25), { weekStartsOn: 1 });
    const weekEnd = endOfWeek(subMonths(now, i * 0.25), { weekStartsOn: 1 });
    
    const weekOrders = orders?.filter(order => {
      const orderDate = new Date(order.heure_de_commande);
      return orderDate >= weekStart && orderDate <= weekEnd;
    }).length || 0;

    const weekLabel = format(weekStart, "'S'w MMM", { locale: fr });
    
    weeklyVolume.push({
      week: weekLabel,
      orders: weekOrders,
      growth: 0, // Will be calculated after
    });
  }

  // Calculate growth for each week
  for (let i = 1; i < weeklyVolume.length; i++) {
    const prev = weeklyVolume[i - 1].orders;
    const curr = weeklyVolume[i].orders;
    weeklyVolume[i].growth = prev > 0 ? Math.round(((curr - prev) / prev) * 100) : 0;
  }

  return {
    orders,
    isLoading,
    ordersThisMonth,
    ordersLastMonth,
    ordersGrowth,
    ordersByDayOfWeek,
    ordersByHour,
    peakDay,
    peakDayOrders: peakDayData?.orders || 0,
    peakHour,
    peakHourOrders,
    weekendVsWeekdayRatio,
    weeklyVolume,
    totalOrders: orders?.length || 0,
  };
}
