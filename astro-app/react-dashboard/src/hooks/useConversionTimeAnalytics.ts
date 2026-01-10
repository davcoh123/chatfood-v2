import { useMemo } from 'react';
import { useAnalyticsData } from './analytics/useAnalyticsData';

export interface ConversionTimeData {
  timeRange: string;
  customers: number;
  percentage: number;
}

export interface ConversionMetrics {
  averageConversionTime: number; // in minutes
  fastestConversion: number;
  slowestConversion: number;
  medianConversionTime: number;
  totalConversions: number;
  conversionRate: number; // % of contacts who place an order
}

export function useConversionTimeAnalytics() {
  const { orders, messages, isLoading } = useAnalyticsData();

  const analytics = useMemo(() => {
    if (!messages.length || !orders.length) {
      return {
        conversionTimeData: [] as ConversionTimeData[],
        metrics: {
          averageConversionTime: 0,
          fastestConversion: 0,
          slowestConversion: 0,
          medianConversionTime: 0,
          totalConversions: 0,
          conversionRate: 0,
        } as ConversionMetrics,
      };
    }

    // Only consider RECEIVED messages (from customers to restaurant)
    // Messages with status 'receive' or 'received' have customer number in from_number
    const receivedMessages = messages.filter(m => 
      m.status === 'receive' || m.status === 'received' || m.status === null
    );

    // Group messages by phone to find first message per customer
    const firstMessageByPhone: Record<string, Date> = {};
    receivedMessages.forEach(message => {
      const phone = message.from_number;
      if (!phone) return;
      
      const messageDate = new Date(message.created_at);
      
      if (!firstMessageByPhone[phone] || messageDate < firstMessageByPhone[phone]) {
        firstMessageByPhone[phone] = messageDate;
      }
    });

    // Group orders by phone to find first order per customer
    const firstOrderByPhone: Record<string, Date> = {};
    orders.forEach(order => {
      const phone = order.phone;
      if (!phone) return;
      
      const orderDate = new Date(order.heure_de_commande);
      
      if (!firstOrderByPhone[phone] || orderDate < firstOrderByPhone[phone]) {
        firstOrderByPhone[phone] = orderDate;
      }
    });

    // Calculate conversion time for each customer
    const conversionTimes: number[] = [];
    const uniqueContacts = new Set(Object.keys(firstMessageByPhone));
    const uniqueCustomers = new Set(Object.keys(firstOrderByPhone));

    Object.entries(firstMessageByPhone).forEach(([phone, firstMessageDate]) => {
      const firstOrderDate = firstOrderByPhone[phone];
      if (firstOrderDate && firstOrderDate >= firstMessageDate) {
        const conversionTimeMs = firstOrderDate.getTime() - firstMessageDate.getTime();
        const conversionTimeMinutes = conversionTimeMs / (1000 * 60);
        // Only count conversions within 24 hours (reasonable window)
        if (conversionTimeMinutes >= 0 && conversionTimeMinutes <= 24 * 60) {
          conversionTimes.push(conversionTimeMinutes);
        }
      }
    });

    // Sort for median calculation
    const sortedTimes = [...conversionTimes].sort((a, b) => a - b);

    // Calculate metrics
    const totalConversions = conversionTimes.length;
    const averageConversionTime = totalConversions > 0 
      ? Math.round(conversionTimes.reduce((sum, t) => sum + t, 0) / totalConversions * 10) / 10
      : 0;
    const fastestConversion = sortedTimes[0] || 0;
    const slowestConversion = sortedTimes[sortedTimes.length - 1] || 0;
    const medianConversionTime = totalConversions > 0 
      ? sortedTimes[Math.floor(sortedTimes.length / 2)] 
      : 0;
    const conversionRate = uniqueContacts.size > 0 
      ? Math.round((uniqueCustomers.size / uniqueContacts.size) * 100)
      : 0;

    // Group by time ranges (adjusted for more realistic ranges)
    const timeRanges = [
      { label: '< 5 min', min: 0, max: 5 },
      { label: '5-15 min', min: 5, max: 15 },
      { label: '15-30 min', min: 15, max: 30 },
      { label: '30-60 min', min: 30, max: 60 },
      { label: '1h+', min: 60, max: Infinity },
    ];

    const conversionTimeData: ConversionTimeData[] = timeRanges.map(range => {
      const count = conversionTimes.filter(t => t >= range.min && t < range.max).length;
      return {
        timeRange: range.label,
        customers: count,
        percentage: totalConversions > 0 ? Math.round((count / totalConversions) * 100) : 0,
      };
    });

    return {
      conversionTimeData,
      metrics: {
        averageConversionTime,
        fastestConversion: Math.round(fastestConversion * 10) / 10,
        slowestConversion: Math.round(slowestConversion * 10) / 10,
        medianConversionTime: Math.round(medianConversionTime * 10) / 10,
        totalConversions,
        conversionRate,
      },
    };
  }, [orders, messages]);

  return {
    ...analytics,
    isLoading,
  };
}
