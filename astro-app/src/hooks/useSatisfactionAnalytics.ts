import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { subMonths, startOfMonth, endOfMonth, format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface RatingDistribution {
  rating: string;
  count: number;
  percentage: number;
}

interface RatingTrend {
  month: string;
  rating: number;
  totalReviews: number;
}

export function useSatisfactionAnalytics() {
  const { profile } = useAuth();
  const userId = profile?.user_id || '';

  // First try order_reviews table
  const { data: orderReviews, isLoading: reviewsLoading } = useQuery({
    queryKey: ['satisfaction-reviews', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('order_reviews')
        .select('id, rating, comment, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
  });

  // Also fetch orders with review_rating as fallback
  const { data: ordersWithRatings, isLoading: ordersLoading } = useQuery({
    queryKey: ['satisfaction-orders', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('chatbot_orders')
        .select('id, review_rating, heure_de_commande')
        .eq('user_id', userId)
        .not('review_rating', 'is', null)
        .order('heure_de_commande', { ascending: false });
      
      if (error) throw error;
      return data || [];
    },
    enabled: !!userId,
  });

  const isLoading = reviewsLoading || ordersLoading;

  // Combine reviews from both sources
  // Use order_reviews if available, otherwise use chatbot_orders.review_rating
  const reviews = orderReviews && orderReviews.length > 0
    ? orderReviews.map(r => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        created_at: r.created_at,
      }))
    : ordersWithRatings?.map(o => ({
        id: o.id,
        rating: o.review_rating,
        comment: null,
        created_at: o.heure_de_commande,
      })) || [];

  const now = new Date();
  const startOfThisMonth = startOfMonth(now);
  const endOfThisMonth = endOfMonth(now);
  const startOfLastMonth = startOfMonth(subMonths(now, 1));
  const endOfLastMonth = endOfMonth(subMonths(now, 1));

  // Total reviews
  const totalReviews = reviews.length;

  // Average rating
  const validReviews = reviews.filter(r => r.rating !== null && r.rating !== undefined);
  const averageRating = validReviews.length > 0
    ? Math.round((validReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / validReviews.length) * 10) / 10
    : 0;

  // Rating this month vs last month
  const reviewsThisMonth = reviews.filter(r => {
    const reviewDate = new Date(r.created_at || '');
    return reviewDate >= startOfThisMonth && reviewDate <= endOfThisMonth;
  });

  const reviewsLastMonth = reviews.filter(r => {
    const reviewDate = new Date(r.created_at || '');
    return reviewDate >= startOfLastMonth && reviewDate <= endOfLastMonth;
  });

  const avgThisMonth = reviewsThisMonth.length > 0
    ? reviewsThisMonth.reduce((sum, r) => sum + (r.rating || 0), 0) / reviewsThisMonth.length
    : 0;

  const avgLastMonth = reviewsLastMonth.length > 0
    ? reviewsLastMonth.reduce((sum, r) => sum + (r.rating || 0), 0) / reviewsLastMonth.length
    : 0;

  const ratingChange = Math.round((avgThisMonth - avgLastMonth) * 10) / 10;

  // Rating distribution
  const ratingCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  validReviews.forEach(review => {
    const rating = Math.round(review.rating || 0);
    if (rating >= 1 && rating <= 5) {
      ratingCounts[rating]++;
    }
  });

  const ratingsDistribution: RatingDistribution[] = [5, 4, 3, 2, 1].map(rating => ({
    rating: `${rating} étoile${rating > 1 ? 's' : ''}`,
    count: ratingCounts[rating],
    percentage: totalReviews > 0 ? Math.round((ratingCounts[rating] / totalReviews) * 100) : 0,
  }));

  // Rating trend (last 6 months)
  const ratingTrend: RatingTrend[] = [];
  for (let i = 5; i >= 0; i--) {
    const monthStart = startOfMonth(subMonths(now, i));
    const monthEnd = endOfMonth(subMonths(now, i));
    
    const monthReviews = reviews.filter(r => {
      const reviewDate = new Date(r.created_at || '');
      return reviewDate >= monthStart && reviewDate <= monthEnd;
    });

    const monthAvg = monthReviews.length > 0
      ? Math.round((monthReviews.reduce((sum, r) => sum + (r.rating || 0), 0) / monthReviews.length) * 10) / 10
      : 0;

    ratingTrend.push({
      month: format(monthStart, 'MMM', { locale: fr }),
      rating: monthAvg,
      totalReviews: monthReviews.length,
    });
  }

  return {
    isLoading,
    reviews,
    totalReviews,
    averageRating,
    ratingChange,
    ratingsDistribution,
    ratingTrend,
    reviewsThisMonth: reviewsThisMonth.length,
  };
}
