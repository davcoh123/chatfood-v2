import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface OrderReview {
  id: string;
  user_id: string;
  order_id: string;
  customer_phone: string | null;
  rating: number;
  comment: string | null;
  created_at: string;
}

export interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  recentReviews: OrderReview[];
}

export function useOrderReviews(passedUserId?: string) {
  const [authUserId, setAuthUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!passedUserId) {
      supabase.auth.getUser().then(({ data }) => {
        if (data.user) setAuthUserId(data.user.id);
      });
    }
  }, [passedUserId]);

  const userId = passedUserId || authUserId || '';

  const { data: reviews, isLoading } = useQuery({
    queryKey: ['order-reviews', userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from('order_reviews')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      return data as OrderReview[];
    },
    enabled: !!userId,
  });

  const stats: ReviewStats = {
    averageRating: reviews && reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0,
    totalReviews: reviews?.length || 0,
    recentReviews: reviews?.slice(0, 5) || [],
  };

  return {
    reviews,
    stats,
    isLoading,
  };
}
