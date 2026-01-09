import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// Cache configuration
const STALE_TIME = 5 * 60 * 1000; // 5 minutes - data is considered fresh
const GC_TIME = 30 * 60 * 1000;   // 30 minutes - keep in cache after unmount

export interface AnalyticsOrder {
  id: string;
  heure_de_commande: string;
  status: string;
  price_total: number;
  commande_item: any;
  phone: string;
}

export interface AnalyticsMessage {
  id: string;
  from_number: string;
  to_number: string;
  created_at: string;
  body: string | null;
  message_type: string;
  status: string | null;
}

export interface AnalyticsProduct {
  id: string;
  name: string;
  category: string;
  unit_price: number;
}

export interface AnalyticsCustomer {
  id: string;
  phone: string;
  name: string | null;
  total_orders: number | null;
  total_spent: number | null;
  first_interaction_at: string;
  last_interaction_at: string;
}

export interface AnalyticsReview {
  id: string;
  rating: number | null;
  comment: string | null;
  created_at: string | null;
}

export function useAnalyticsData() {
  const { user } = useAuth();

  // Orders - all statuses for general analytics
  const ordersQuery = useQuery({
    queryKey: ['analytics-data-orders', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('chatbot_orders')
        .select('id, heure_de_commande, status, price_total, commande_item, phone')
        .eq('user_id', user.id)
        .order('heure_de_commande', { ascending: false });
      
      if (error) throw error;
      return (data || []) as AnalyticsOrder[];
    },
    enabled: !!user?.id,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
    refetchOnWindowFocus: false,
  });

  // Delivered orders - for revenue analytics
  const deliveredOrdersQuery = useQuery({
    queryKey: ['analytics-data-delivered-orders', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('chatbot_orders')
        .select('id, heure_de_commande, status, price_total, commande_item, phone')
        .eq('user_id', user.id)
        .eq('status', 'delivered')
        .order('heure_de_commande', { ascending: false });
      
      if (error) throw error;
      return (data || []) as AnalyticsOrder[];
    },
    enabled: !!user?.id,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
    refetchOnWindowFocus: false,
  });

  // Messages - for conversion time analytics
  const messagesQuery = useQuery({
    queryKey: ['analytics-data-messages', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('chatbot_messages')
        .select('id, from_number, to_number, created_at, body, message_type, status')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      return (data || []) as AnalyticsMessage[];
    },
    enabled: !!user?.id,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
    refetchOnWindowFocus: false,
  });

  // Products
  const productsQuery = useQuery({
    queryKey: ['analytics-data-products', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('products')
        .select('id, name, category, unit_price')
        .eq('user_id', user.id);
      
      if (error) throw error;
      return (data || []) as AnalyticsProduct[];
    },
    enabled: !!user?.id,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
    refetchOnWindowFocus: false,
  });

  // Customers
  const customersQuery = useQuery({
    queryKey: ['analytics-data-customers', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('customers')
        .select('id, phone, name, total_orders, total_spent, first_interaction_at, last_interaction_at')
        .eq('user_id', user.id);
      
      if (error) throw error;
      return (data || []) as AnalyticsCustomer[];
    },
    enabled: !!user?.id,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
    refetchOnWindowFocus: false,
  });

  // Reviews
  const reviewsQuery = useQuery({
    queryKey: ['analytics-data-reviews', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from('order_reviews')
        .select('id, rating, comment, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data || []) as AnalyticsReview[];
    },
    enabled: !!user?.id,
    staleTime: STALE_TIME,
    gcTime: GC_TIME,
    refetchOnWindowFocus: false,
  });

  const isLoading = 
    ordersQuery.isLoading || 
    deliveredOrdersQuery.isLoading ||
    messagesQuery.isLoading || 
    productsQuery.isLoading || 
    customersQuery.isLoading || 
    reviewsQuery.isLoading;

  return {
    orders: ordersQuery.data || [],
    deliveredOrders: deliveredOrdersQuery.data || [],
    messages: messagesQuery.data || [],
    products: productsQuery.data || [],
    customers: customersQuery.data || [],
    reviews: reviewsQuery.data || [],
    isLoading,
    // Individual loading states
    ordersLoading: ordersQuery.isLoading,
    messagesLoading: messagesQuery.isLoading,
    productsLoading: productsQuery.isLoading,
    customersLoading: customersQuery.isLoading,
    reviewsLoading: reviewsQuery.isLoading,
  };
}
