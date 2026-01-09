import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface PublicRestaurant {
  restaurant_name: string | null;
  slug: string | null;
  address_street: string | null;
  address_postal_code: string | null;
  address_city: string | null;
  latitude: number | null;
  longitude: number | null;
  opening_hours: OpeningHours[];
  assets: RestaurantAsset[];
  user_id: string;
  theme_color: string | null;
  cover_image_url: string | null;
  featured_categories: string[] | null;
  category_order: string[] | null;
  online_orders_enabled: boolean | null;
  chatbot_active: boolean | null;
}

export interface OpeningHours {
  day: string;
  slot1: string;
  slot2: string;
}

export interface RestaurantAsset {
  url: string;
  filename: string;
  description?: string;
  type?: string;
}

export interface PublicProduct {
  id: string;
  name: string;
  description: string | null;
  category: string;
  unit_price: number;
  currency: string | null;
  allergens: string[] | null;
  tags: string[] | null;
  is_active: boolean;
}

export interface PublicReview {
  id: string;
  rating: number | null;
  comment: string | null;
  created_at: string | null;
}

export function usePublicRestaurant(slug: string | undefined) {
  // Fetch restaurant settings by slug using secure public view
  // This view only exposes safe fields - no WhatsApp tokens or sensitive data
  const { data: restaurant, isLoading: isLoadingRestaurant, error: restaurantError } = useQuery({
    queryKey: ['public-restaurant', slug],
    queryFn: async () => {
      if (!slug) return null;
      
      const { data, error } = await supabase
        .from('public_restaurant_view')
        .select('restaurant_name, slug, address_street, address_postal_code, address_city, latitude, longitude, opening_hours, assets, user_id, theme_color, cover_image_url, featured_categories, category_order, online_orders_enabled, chatbot_active')
        .eq('slug', slug)
        .maybeSingle();
      
      if (error) throw error;
      if (!data) return null;
      
      return {
        ...data,
        opening_hours: (data.opening_hours as unknown as OpeningHours[]) || [],
        assets: (data.assets as unknown as RestaurantAsset[]) || [],
      } as PublicRestaurant;
    },
    enabled: !!slug,
    staleTime: 5 * 60 * 1000, // Cache 5 minutes
  });

  // Fetch products for this restaurant
  const { data: products, isLoading: isLoadingProducts } = useQuery({
    queryKey: ['public-products', restaurant?.user_id],
    queryFn: async () => {
      if (!restaurant?.user_id) return [];
      
      const { data, error } = await supabase
        .from('products')
        .select('id, name, description, category, unit_price, currency, allergens, tags, is_active')
        .eq('user_id', restaurant.user_id)
        .eq('is_active', true)
        .order('category')
        .order('sort_order');
      
      if (error) throw error;
      return (data || []) as PublicProduct[];
    },
    enabled: !!restaurant?.user_id,
    staleTime: 5 * 60 * 1000,
  });

  // Fetch reviews for this restaurant
  const { data: reviews, isLoading: isLoadingReviews } = useQuery({
    queryKey: ['public-reviews', restaurant?.user_id],
    queryFn: async () => {
      if (!restaurant?.user_id) return [];
      
      const { data, error } = await supabase
        .from('order_reviews')
        .select('id, rating, comment, created_at')
        .eq('user_id', restaurant.user_id)
        .not('rating', 'is', null)
        .order('created_at', { ascending: false })
        .limit(20);
      
      if (error) throw error;
      return (data || []) as PublicReview[];
    },
    enabled: !!restaurant?.user_id,
    staleTime: 5 * 60 * 1000,
  });

  // Calculate average rating
  const averageRating = reviews && reviews.length > 0
    ? reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / reviews.length
    : null;

  // Check if restaurant is currently open
  const isOpen = (() => {
    if (!restaurant?.opening_hours) return null;
    
    const now = new Date();
    const dayNames = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
    const todayName = dayNames[now.getDay()];
    const todayHours = restaurant.opening_hours.find(h => h.day === todayName);
    
    if (!todayHours || (!todayHours.slot1 && !todayHours.slot2)) return false;
    
    const currentTime = now.getHours() * 60 + now.getMinutes();
    
    const parseTimeSlot = (slot: string) => {
      // Parse formats like "12h-14h30" or "12:00-14:30"
      const match = slot.match(/(\d{1,2})[h:]?(\d{0,2})\s*[-–]\s*(\d{1,2})[h:]?(\d{0,2})/);
      if (!match) return null;
      
      const startHour = parseInt(match[1]);
      const startMin = parseInt(match[2] || '0');
      const endHour = parseInt(match[3]);
      const endMin = parseInt(match[4] || '0');
      
      return {
        start: startHour * 60 + startMin,
        end: endHour * 60 + endMin,
      };
    };
    
    for (const slot of [todayHours.slot1, todayHours.slot2]) {
      if (!slot) continue;
      const parsed = parseTimeSlot(slot);
      if (parsed && currentTime >= parsed.start && currentTime <= parsed.end) {
        return true;
      }
    }
    
    return false;
  })();

  // Get unique categories from products, respecting custom order
  const categories = (() => {
    if (!products) return [];
    
    const uniqueCategories = [...new Set(products.map(p => p.category))];
    
    // If restaurant has a custom order, use it
    if (restaurant?.category_order && restaurant.category_order.length > 0) {
      const orderedCategories = restaurant.category_order.filter(c => uniqueCategories.includes(c));
      const newCategories = uniqueCategories.filter(c => !restaurant.category_order!.includes(c));
      return [...orderedCategories, ...newCategories];
    }
    
    return uniqueCategories;
  })();

  // Get featured categories for header display
  const featuredCategories = restaurant?.featured_categories && restaurant.featured_categories.length > 0
    ? restaurant.featured_categories.filter(c => categories.includes(c))
    : categories.slice(0, 3);

  return {
    restaurant,
    products,
    reviews,
    categories,
    featuredCategories,
    averageRating,
    reviewCount: reviews?.length || 0,
    isOpen,
    isLoading: isLoadingRestaurant || isLoadingProducts || isLoadingReviews,
    notFound: !isLoadingRestaurant && !restaurant && !restaurantError,
  };
}
