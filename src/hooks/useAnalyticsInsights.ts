import { useMemo } from 'react';
import { useOrdersAnalytics } from './useOrdersAnalytics';
import { useRevenueAnalytics } from './useRevenueAnalytics';
import { useProductsAnalytics } from './useProductsAnalytics';
import { useCustomerAnalytics } from './useCustomerAnalytics';
import { useSatisfactionAnalytics } from './useSatisfactionAnalytics';

export interface Insight {
  type: 'success' | 'info' | 'warning';
  title: string;
  description: string;
  icon: 'TrendingUp' | 'Clock' | 'Star' | 'Users' | 'ShoppingCart';
}

export function useAnalyticsInsights() {
  const { peakDay, peakDayOrders, peakHour, weekendVsWeekdayRatio, ordersGrowth, isLoading: ordersLoading } = useOrdersAnalytics();
  const { growthPercentage, bestCategory, bestCategoryPercentage, isLoading: revenueLoading } = useRevenueAnalytics();
  const { topProduct, isLoading: productsLoading } = useProductsAnalytics();
  const { retentionRate, loyalCustomers, isLoading: customerLoading } = useCustomerAnalytics();
  const { averageRating, ratingChange, isLoading: satisfactionLoading } = useSatisfactionAnalytics();

  const isLoading = ordersLoading || revenueLoading || productsLoading || customerLoading || satisfactionLoading;

  const insights = useMemo<Insight[]>(() => {
    if (isLoading) return [];

    const generatedInsights: Insight[] = [];

    // Revenue growth insight
    if (growthPercentage > 10) {
      generatedInsights.push({
        type: 'success',
        title: 'Croissance des revenus',
        description: `+${growthPercentage}% de revenus ce mois comparé au mois dernier`,
        icon: 'TrendingUp'
      });
    } else if (growthPercentage < -10) {
      generatedInsights.push({
        type: 'warning',
        title: 'Baisse des revenus',
        description: `${growthPercentage}% de revenus ce mois. Analysez les tendances pour comprendre`,
        icon: 'TrendingUp'
      });
    }

    // Peak day insight
    if (peakDay && peakDayOrders > 0) {
      generatedInsights.push({
        type: 'info',
        title: 'Jour de pointe détecté',
        description: `${peakDay} est votre jour le plus actif avec ${peakDayOrders} commandes`,
        icon: 'Clock'
      });
    }

    // Best category insight
    if (bestCategory && bestCategoryPercentage > 0) {
      generatedInsights.push({
        type: 'success',
        title: 'Catégorie star',
        description: `${bestCategory} représente ${bestCategoryPercentage}% de votre chiffre d'affaires`,
        icon: 'ShoppingCart'
      });
    }

    // Satisfaction insight
    if (averageRating >= 4.5) {
      generatedInsights.push({
        type: 'success',
        title: 'Satisfaction exceptionnelle',
        description: `Note moyenne de ${averageRating.toFixed(1)}/5 - Vos clients sont ravis !`,
        icon: 'Star'
      });
    } else if (ratingChange > 0) {
      generatedInsights.push({
        type: 'success',
        title: 'Satisfaction en hausse',
        description: `+${ratingChange.toFixed(1)} points ce mois grâce à vos efforts`,
        icon: 'Star'
      });
    } else if (ratingChange < -0.2) {
      generatedInsights.push({
        type: 'warning',
        title: 'Satisfaction en baisse',
        description: `${ratingChange.toFixed(1)} points ce mois. Analysez les avis récents`,
        icon: 'Star'
      });
    }

    // Retention insight
    if (retentionRate >= 50) {
      generatedInsights.push({
        type: 'success',
        title: 'Excellente fidélisation',
        description: `${retentionRate}% de vos clients reviennent - ${loyalCustomers} clients fidèles`,
        icon: 'Users'
      });
    }

    // Top product insight
    if (topProduct) {
      generatedInsights.push({
        type: 'info',
        title: 'Produit star',
        description: `"${topProduct.name}" domine vos ventes avec ${topProduct.percentage.toFixed(1)}% des commandes`,
        icon: 'ShoppingCart'
      });
    }

    // Weekend vs weekday insight
    if (weekendVsWeekdayRatio > 20) {
      generatedInsights.push({
        type: 'info',
        title: 'Weekend populaire',
        description: `Les weekends génèrent ${weekendVsWeekdayRatio}% de commandes en plus`,
        icon: 'Clock'
      });
    }

    // Return top 3 most relevant insights
    return generatedInsights.slice(0, 3);
  }, [
    isLoading, growthPercentage, peakDay, peakDayOrders, bestCategory, 
    bestCategoryPercentage, averageRating, ratingChange, retentionRate,
    loyalCustomers, topProduct, weekendVsWeekdayRatio
  ]);

  return {
    insights,
    isLoading
  };
}
