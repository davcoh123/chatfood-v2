import { useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
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

export function useAnalyticsExport() {
  const { profile } = useAuth();
  const [isExporting, setIsExporting] = useState(false);

  const { 
    revenueThisMonth, 
    revenueLastMonth, 
    growthPercentage, 
    averageWeeklyRevenue,
    weeklyRevenue,
    revenueByCategory,
  } = useRevenueAnalytics();

  const { 
    ordersThisMonth, 
    ordersGrowth, 
    ordersByDayOfWeek,
    peakDay,
    peakHour,
  } = useOrdersAnalytics();

  const { 
    totalCustomers, 
    activeCustomers, 
    retentionRate,
    newCustomersThisMonth,
    segments,
  } = useCustomerAnalytics();

  const { 
    topProducts, 
    totalSales,
  } = useProductsAnalytics();

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
      const restaurantName = profile?.first_name 
        ? `Restaurant de ${profile.first_name}` 
        : 'Mon Restaurant';
      
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
      const restaurantName = profile?.first_name 
        ? `Restaurant de ${profile.first_name}` 
        : 'Mon Restaurant';
      
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
