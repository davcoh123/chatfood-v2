import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect } from 'react';

// Validation du format slug
export const isValidSlug = (slug: string) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) && slug.length >= 3;

// Normalisation automatique
export const normalizeSlug = (input: string) => {
  return input
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // Supprimer accents
    .replace(/[^a-z0-9\s-]/g, '') // Garder uniquement alphanumériques
    .replace(/\s+/g, '-') // Espaces → tirets
    .replace(/-+/g, '-') // Multiples tirets → un seul
    .replace(/^-|-$/g, ''); // Supprimer tirets début/fin
};

export function useSlugAvailability(slug: string, currentUserId: string) {
  const [debouncedSlug, setDebouncedSlug] = useState(slug);

  // Debounce the slug value
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSlug(slug);
    }, 300);
    return () => clearTimeout(timer);
  }, [slug]);

  const { data, isLoading, error } = useQuery({
    queryKey: ['slug-availability', debouncedSlug],
    queryFn: async () => {
      if (!isValidSlug(debouncedSlug)) {
        return { isAvailable: false, reason: 'invalid' as const };
      }

      const { data, error } = await supabase
        .from('restaurant_settings')
        .select('user_id')
        .eq('slug', debouncedSlug)
        .neq('user_id', currentUserId)
        .maybeSingle();

      if (error) throw error;

      return { 
        isAvailable: !data, 
        reason: data ? 'taken' as const : 'available' as const 
      };
    },
    enabled: debouncedSlug.length >= 3 && isValidSlug(debouncedSlug),
    staleTime: 10000,
    refetchOnWindowFocus: false,
  });

  const isChecking = isLoading && debouncedSlug !== slug;

  return {
    isAvailable: data?.isAvailable ?? false,
    reason: data?.reason ?? (slug.length < 3 ? 'too-short' : !isValidSlug(slug) ? 'invalid' : undefined),
    isChecking: isLoading || debouncedSlug !== slug,
    error,
  };
}
