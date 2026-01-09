import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { subMonths, startOfMonth, endOfMonth, format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface CustomerSegment {
  type: 'vip' | 'regular' | 'new';
  count: number;
  averageSpend: number;
  percentageOfCustomers: number;
  percentageOfRevenue: number;
}

interface RetentionData {
  month: string;
  retention: number;
  newCustomers: number;
  returningCustomers: number;
}

interface CustomerData {
  phone: string;
  totalOrders: number;
  totalSpent: number;
  firstOrderDate: Date;
  lastOrderDate: Date;
}

export function useCustomerAnalytics() {
  const { user } = useAuth();

  // Fetch orders directly - the source of truth for customer data
  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: ['customer-analytics-orders', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('chatbot_orders')
        .select('id, phone, heure_de_commande, price_total, status')
        .eq('user_id', user.id)
        .in('status', ['delivered', 'ready', 'preparing', 'confirmed']);
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!user?.id,
  });

  const now = new Date();
  const thirtyDaysAgo = subMonths(now, 1);

  // Build customer data from orders
  const customerMap: Record<string, CustomerData> = {};
  
  orders?.forEach(order => {
    const phone = order.phone;
    if (!phone) return;
    
    const orderDate = new Date(order.heure_de_commande);
    const orderTotal = order.price_total || 0;
    
    if (!customerMap[phone]) {
      customerMap[phone] = {
        phone,
        totalOrders: 0,
        totalSpent: 0,
        firstOrderDate: orderDate,
        lastOrderDate: orderDate,
      };
    }
    
    customerMap[phone].totalOrders += 1;
    customerMap[phone].totalSpent += orderTotal;
    
    if (orderDate < customerMap[phone].firstOrderDate) {
      customerMap[phone].firstOrderDate = orderDate;
    }
    if (orderDate > customerMap[phone].lastOrderDate) {
      customerMap[phone].lastOrderDate = orderDate;
    }
  });

  const customers = Object.values(customerMap);

  // Total and active customers
  const totalCustomers = customers.length;
  
  const activeCustomers = customers.filter(customer => 
    customer.lastOrderDate >= thirtyDaysAgo
  ).length;

  // Customer segments: VIP (10+ orders), Regular (3-9), New (1-2)
  const vipCustomers = customers.filter(c => c.totalOrders >= 10);
  const regularCustomers = customers.filter(c => c.totalOrders >= 3 && c.totalOrders < 10);
  const newCustomers = customers.filter(c => c.totalOrders < 3);

  const totalRevenue = customers.reduce((sum, c) => sum + c.totalSpent, 0) || 1;

  const segments: CustomerSegment[] = [
    {
      type: 'vip',
      count: vipCustomers.length,
      averageSpend: vipCustomers.length > 0 
        ? Math.round(vipCustomers.reduce((sum, c) => sum + c.totalSpent, 0) / vipCustomers.length)
        : 0,
      percentageOfCustomers: Math.round((vipCustomers.length / (totalCustomers || 1)) * 100),
      percentageOfRevenue: Math.round((vipCustomers.reduce((sum, c) => sum + c.totalSpent, 0) / totalRevenue) * 100),
    },
    {
      type: 'regular',
      count: regularCustomers.length,
      averageSpend: regularCustomers.length > 0
        ? Math.round(regularCustomers.reduce((sum, c) => sum + c.totalSpent, 0) / regularCustomers.length)
        : 0,
      percentageOfCustomers: Math.round((regularCustomers.length / (totalCustomers || 1)) * 100),
      percentageOfRevenue: Math.round((regularCustomers.reduce((sum, c) => sum + c.totalSpent, 0) / totalRevenue) * 100),
    },
    {
      type: 'new',
      count: newCustomers.length,
      averageSpend: newCustomers.length > 0
        ? Math.round(newCustomers.reduce((sum, c) => sum + c.totalSpent, 0) / newCustomers.length)
        : 0,
      percentageOfCustomers: Math.round((newCustomers.length / (totalCustomers || 1)) * 100),
      percentageOfRevenue: Math.round((newCustomers.reduce((sum, c) => sum + c.totalSpent, 0) / totalRevenue) * 100),
    },
  ];

  // Loyal customers (3+ orders)
  const loyalCustomers = customers.filter(c => c.totalOrders >= 3).length;

  // Retention rate (customers who ordered more than once / total customers)
  const returningCustomersCount = customers.filter(c => c.totalOrders > 1).length;
  const retentionRate = totalCustomers > 0 
    ? Math.round((returningCustomersCount / totalCustomers) * 100) 
    : 0;

  // Monthly retention data (last 6 months)
  const retentionData: RetentionData[] = [];
  for (let i = 5; i >= 0; i--) {
    const monthStart = startOfMonth(subMonths(now, i));
    const monthEnd = endOfMonth(subMonths(now, i));
    
    // New customers this month (first order in this month)
    const newThisMonth = customers.filter(customer => 
      customer.firstOrderDate >= monthStart && customer.firstOrderDate <= monthEnd
    ).length;

    // Returning customers this month (had orders before and ordered again this month)
    const returningThisMonth = customers.filter(customer => {
      // First order was before this month
      const isExisting = customer.firstOrderDate < monthStart;
      // Had at least one order this month
      const orderedThisMonth = orders?.some(o => {
        const orderDate = new Date(o.heure_de_commande);
        return o.phone === customer.phone && orderDate >= monthStart && orderDate <= monthEnd;
      });
      return isExisting && orderedThisMonth;
    }).length;

    // Customers who existed before this month
    const existingCustomers = customers.filter(c => c.firstOrderDate < monthStart).length;

    const monthRetention = existingCustomers > 0 
      ? Math.round((returningThisMonth / existingCustomers) * 100)
      : 0;

    retentionData.push({
      month: format(monthStart, 'MMM', { locale: fr }),
      retention: Math.min(monthRetention, 100),
      newCustomers: newThisMonth,
      returningCustomers: returningThisMonth,
    });
  }

  // New customers this month
  const startOfThisMonth = startOfMonth(now);
  const endOfThisMonth = endOfMonth(now);
  
  const newCustomersThisMonth = customers.filter(customer => 
    customer.firstOrderDate >= startOfThisMonth && customer.firstOrderDate <= endOfThisMonth
  ).length;

  const newCustomersPercentage = activeCustomers > 0 
    ? Math.round((newCustomersThisMonth / activeCustomers) * 100) 
    : 0;

  return {
    isLoading: ordersLoading,
    totalCustomers,
    activeCustomers,
    loyalCustomers,
    retentionRate,
    segments,
    retentionData,
    newCustomersThisMonth,
    newCustomersPercentage,
  };
}
