import { useQuery } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useRestaurantCategories(passedUserId?: string) {
  const [authUserId, setAuthUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!passedUserId) {
      supabase.auth.getUser().then(({ data }) => {
        if (data.user) setAuthUserId(data.user.id);
      });
    }
  }, [passedUserId]);

  const userId = passedUserId || authUserId || '';

  return useQuery({
    queryKey: ['restaurant-categories', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      const { data, error } = await supabase
        .from('products')
        .select('category')
        .eq('user_id', userId)
        .eq('is_active', true);
      
      if (error) throw error;
      
      // Extract unique categories
      const categories = [...new Set(data?.map(p => p.category) || [])];
      return categories.filter(Boolean).sort();
    },
    enabled: !!userId,
  });
}
