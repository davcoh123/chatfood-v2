import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, subMonths, subWeeks, format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface WeeklyRevenue {
  week: string;
  revenue: number;
  orders: number;
}

interface CategoryRevenue {
  name: string;
  revenue: number;
  percentage: number;
  color: string;
}

interface MonthlyGrowth {
  month: string;
  revenue: number;
  growth: number;
}

// Palette de couleurs contrastées - pas de jaune clair
const CATEGORY_PALETTE = [
  '#3B82F6', // blue
  '#10B981', // emerald
  '#F59E0B', // amber (contrasted)
  '#EF4444', // red
  '#8B5CF6', // violet
  '#EC4899', // pink
  '#06B6D4', // cyan
  '#F97316', // orange
  '#14B8A6', // teal
  '#6366F1', // indigo
  '#84CC16', // lime
  '#D946EF', // fuchsia
  '#0EA5E9', // sky
  '#22C55E', // green
  '#A855F7', // purple
];

export function useRevenueAnalytics() {
  const { user } = useAuth();

  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ['revenue-orders', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('chatbot_orders')
        .select('id, heure_de_commande, status, price_total, commande_item')
        .eq('user_id', user.id)
        .eq('status', 'delivered')
        .order('heure_de_commande', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const { data: products } = useQuery({
    queryKey: ['products-for-revenue', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('products')
        .select('id, name, category, unit_price')
        .eq('user_id', user.id);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const now = new Date();
  const startOfThisMonth = startOfMonth(now);
  const endOfThisMonth = endOfMonth(now);
  const startOfLastMonth = startOfMonth(subMonths(now, 1));
  const endOfLastMonth = endOfMonth(subMonths(now, 1));

  // Revenue this month
  const revenueThisMonth = orders?.filter(order => {
    const orderDate = new Date(order.heure_de_commande);
    return orderDate >= startOfThisMonth && orderDate <= endOfThisMonth;
  }).reduce((sum, order) => sum + (order.price_total || 0), 0) || 0;

  // Revenue last month
  const revenueLastMonth = orders?.filter(order => {
    const orderDate = new Date(order.heure_de_commande);
    return orderDate >= startOfLastMonth && orderDate <= endOfLastMonth;
  }).reduce((sum, order) => sum + (order.price_total || 0), 0) || 0;

  // Growth percentage
  const growthPercentage = revenueLastMonth > 0 
    ? Math.round(((revenueThisMonth - revenueLastMonth) / revenueLastMonth) * 100) 
    : (revenueThisMonth > 0 ? 100 : 0);

  // Weekly revenue (last 12 weeks)
  const weeklyRevenue: WeeklyRevenue[] = [];
  for (let i = 11; i >= 0; i--) {
    const weekStart = startOfWeek(subWeeks(now, i), { weekStartsOn: 1 });
    const weekEnd = endOfWeek(subWeeks(now, i), { weekStartsOn: 1 });
    
    const weekOrders = orders?.filter(order => {
      const orderDate = new Date(order.heure_de_commande);
      return orderDate >= weekStart && orderDate <= weekEnd;
    }) || [];

    const weekRevenue = weekOrders.reduce((sum, order) => sum + (order.price_total || 0), 0);
    const weekLabel = format(weekStart, "'S'w MMM", { locale: fr });
    
    weeklyRevenue.push({
      week: weekLabel,
      revenue: Math.round(weekRevenue),
      orders: weekOrders.length,
    });
  }

  // Average weekly revenue
  const averageWeeklyRevenue = weeklyRevenue.length > 0
    ? Math.round(weeklyRevenue.reduce((sum, w) => sum + w.revenue, 0) / weeklyRevenue.length)
    : 0;

  // Revenue by category - use category from order items directly
  const categoryRevenueMap: Record<string, number> = {};
  
  orders?.forEach(order => {
    const items = order.commande_item as any[];
    if (Array.isArray(items)) {
      items.forEach(item => {
        // First try to get category from the item itself
        let category = item.category;
        
        // If not in item, look up from products
        if (!category) {
          const product = products?.find(p => p.id === item.product_id || p.name === item.name);
          category = product?.category;
        }
        
        // Skip items without category (don't add to "Autres")
        if (!category) return;
        
        const itemRevenue = (item.unit_price || item.price || 0) * (item.quantity || 1);
        categoryRevenueMap[category] = (categoryRevenueMap[category] || 0) + itemRevenue;
      });
    }
  });

  const totalCategoryRevenue = Object.values(categoryRevenueMap).reduce((sum, val) => sum + val, 0) || 1;
  
  const revenueByCategory: CategoryRevenue[] = Object.entries(categoryRevenueMap)
    .sort((a, b) => b[1] - a[1])
    .map(([name, revenue], index) => ({
      name,
      revenue: Math.round(revenue),
      percentage: Math.round((revenue / totalCategoryRevenue) * 100),
      color: CATEGORY_PALETTE[index % CATEGORY_PALETTE.length],
    }));

  // Best category
  const bestCategory = revenueByCategory[0]?.name || 'N/A';
  const bestCategoryPercentage = revenueByCategory[0]?.percentage || 0;

  // Monthly growth (last 6 months) - no fake targets or previous year data
  const monthlyGrowth: MonthlyGrowth[] = [];
  for (let i = 5; i >= 0; i--) {
    const monthStart = startOfMonth(subMonths(now, i));
    const monthEnd = endOfMonth(subMonths(now, i));
    const prevMonthStart = startOfMonth(subMonths(now, i + 1));
    const prevMonthEnd = endOfMonth(subMonths(now, i + 1));
    
    const monthOrders = orders?.filter(order => {
      const orderDate = new Date(order.heure_de_commande);
      return orderDate >= monthStart && orderDate <= monthEnd;
    }) || [];

    const prevMonthOrders = orders?.filter(order => {
      const orderDate = new Date(order.heure_de_commande);
      return orderDate >= prevMonthStart && orderDate <= prevMonthEnd;
    }) || [];

    const revenue = monthOrders.reduce((sum, order) => sum + (order.price_total || 0), 0);
    const prevRevenue = prevMonthOrders.reduce((sum, order) => sum + (order.price_total || 0), 0);
    
    // Handle growth calculation properly
    let growth = 0;
    if (prevRevenue > 0) {
      growth = Math.round(((revenue - prevRevenue) / prevRevenue) * 100);
    } else if (revenue > 0) {
      growth = 100; // First month with revenue = 100% growth
    }
    
    const monthLabel = format(monthStart, 'MMM', { locale: fr });
    
    monthlyGrowth.push({
      month: monthLabel,
      revenue: Math.round(revenue),
      growth,
    });
  }

  // Average growth (only count months with data)
  const monthsWithRevenue = monthlyGrowth.filter(m => m.revenue > 0);
  const averageGrowth = monthsWithRevenue.length > 1
    ? Math.round(monthsWithRevenue.slice(1).reduce((sum, m) => sum + m.growth, 0) / (monthsWithRevenue.length - 1))
    : 0;

  // Best month
  const bestMonth = monthlyGrowth.reduce((max, curr) => 
    curr.revenue > max.revenue ? curr : max, monthlyGrowth[0]);

  return {
    orders,
    isLoading: ordersLoading,
    revenueThisMonth,
    revenueLastMonth,
    growthPercentage,
    weeklyRevenue,
    averageWeeklyRevenue,
    revenueByCategory,
    bestCategory,
    bestCategoryPercentage,
    monthlyGrowth,
    averageGrowth,
    bestMonth: bestMonth?.month || 'N/A',
    bestMonthGrowth: bestMonth?.growth || 0,
  };
}
