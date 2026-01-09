import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useRevenueAnalytics } from './useRevenueAnalytics';
import { useOrdersAnalytics } from './useOrdersAnalytics';
import { useCustomerAnalytics } from './useCustomerAnalytics';
import { useProductsAnalytics } from './useProductsAnalytics';
import { useSatisfactionAnalytics } from './useSatisfactionAnalytics';
import { 
  exportAnalyticsPDF, 
  exportAnalyticsExcel, 
  AnalyticsExportData 
} from '@/utils/analyticsExport';

export function useAnalyticsExport(passedUserId?: string) {
  const [restaurantName, setRestaurantName] = useState<string>('Restaurant');
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    const fetchRestaurantName = async () => {
      const userId = passedUserId || (await supabase.auth.getUser()).data.user?.id;
      if (userId) {
        const { data } = await supabase
          .from('restaurant_settings')
          .select('restaurant_name')
          .eq('user_id', userId)
          .single();
        if (data?.restaurant_name) setRestaurantName(data.restaurant_name);
      }
    };
    fetchRestaurantName();
  }, [passedUserId]);

  const { 
    revenueThisMonth, 
    revenueLastMonth, 
    growthPercentage, 
    averageWeeklyRevenue,
    weeklyRevenue,
    revenueByCategory,
  } = useRevenueAnalytics(passedUserId);

  const { 
    ordersThisMonth, 
    ordersGrowth, 
    ordersByDayOfWeek,
    peakDay,
    peakHour,
  } = useOrdersAnalytics(passedUserId);

  const { 
    totalCustomers, 
    activeCustomers, 
    retentionRate,
    newCustomersThisMonth,
    segments,
  } = useCustomerAnalytics(passedUserId);

  const { 
    topProducts, 
    totalSales,
  } = useProductsAnalytics(passedUserId);

  const { 
    averageRating, 
    totalReviews,
    ratingsDistribution,
  } = useSatisfactionAnalytics();

  const buildExportData = (): AnalyticsExportData => {
    return {
      revenue: {
        thisMonth: revenueThisMonth,
        lastMonth: revenueLastMonth,
        growth: growthPercentage,
        weeklyAverage: averageWeeklyRevenue,
        weekly: weeklyRevenue.map(w => ({
          week: w.week,
          revenue: w.revenue,
          orders: w.orders,
        })),
        byCategory: revenueByCategory.map(c => ({
          name: c.name,
          revenue: c.revenue,
          percentage: c.percentage,
        })),
      },
      orders: {
        thisMonth: ordersThisMonth,
        growth: ordersGrowth,
        byDay: ordersByDayOfWeek.map(d => ({
          day: d.day,
          orders: d.orders,
          percentage: d.percentage,
        })),
        peakDay,
        peakHour,
      },
      customers: {
        total: totalCustomers,
        active: activeCustomers,
        retentionRate,
        newThisMonth: newCustomersThisMonth,
        segments: segments.map(s => ({
          type: s.type === 'vip' ? 'VIP' : s.type === 'regular' ? 'Régulier' : 'Nouveau',
          count: s.count,
          averageSpend: s.averageSpend,
          revenuePercentage: s.percentageOfRevenue,
        })),
      },
      products: {
        top: topProducts.map(p => ({
          name: p.name,
          sales: p.sales,
          revenue: p.revenue,
          category: p.category,
        })),
        totalSales,
      },
      satisfaction: {
        averageRating,
        totalReviews,
        distribution: ratingsDistribution.map(r => ({
          rating: r.rating,
          count: r.count,
          percentage: r.percentage,
        })),
      },
    };
  };

  const exportPDF = async () => {
    setIsExporting(true);
    try {
      const data = buildExportData();
      
      await exportAnalyticsPDF(data, restaurantName);
      toast.success('Rapport PDF téléchargé');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast.error('Erreur lors de l\'export PDF');
    } finally {
      setIsExporting(false);
    }
  };

  const exportExcel = async () => {
    setIsExporting(true);
    try {
      const data = buildExportData();
      
      await exportAnalyticsExcel(data, restaurantName);
      toast.success('Rapport Excel téléchargé');
    } catch (error) {
      console.error('Error exporting Excel:', error);
      toast.error('Erreur lors de l\'export Excel');
    } finally {
      setIsExporting(false);
    }
  };

  return {
    exportPDF,
    exportExcel,
    isExporting,
  };
}
