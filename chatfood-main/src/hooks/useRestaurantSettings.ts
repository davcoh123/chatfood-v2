import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export interface OpeningHours {
  day: string;
  slot1: string;
  slot2: string;
}

export interface RestaurantAsset {
  id: string;
  url: string;
  description: string;
  filename: string;
  created_at: string;
  order: number;
}

export interface ProductSuggestion {
  trigger_product_id: string;
  suggested_product_id: string;
  type: 'product' | 'menu' | 'addon';
}

export interface DailyMenuSchedule {
  day: string;
  slot: 'midi' | 'soir';
  start_time: string;
  end_time: string;
  enabled: boolean;
}

export interface DailyMenuProduct {
  product_id: string;
  is_temporary: boolean;
  name?: string;
  price?: number;
}

export interface DailyMenuConfig {
  schedules: DailyMenuSchedule[];
  products: DailyMenuProduct[];
  menu_price: number;
  menu_label: string;
}

export interface RestaurantSettings {
  id: string;
  user_id: string;
  
  // User number (sequential)
  user_number: number;
  
  // Public profile slug
  slug: string | null;
  
  // Informations du restaurant
  restaurant_name: string | null;
  siret: string | null;
  
  // Chatbot
  chatbot_name: string;
  chatbot_active: boolean;
  chatbot_prompt: string | null;
  
  // Chatbot Controls (Pro+)
  order_time_enabled: boolean;
  order_time_minutes: number;
  manual_order_confirmation: boolean;
  product_suggestions: ProductSuggestion[];
  
  // Customer Reviews
  customer_reviews_enabled: boolean;
  customer_reviews_delay_hours: number;
  customer_reviews_message: string;
  
  // Daily Menu
  daily_menu_enabled: boolean;
  daily_menu_config: DailyMenuConfig;
  
  // Adresse
  address_street: string | null;
  address_postal_code: string | null;
  address_city: string | null;
  
  // Horaires
  opening_hours: OpeningHours[];
  
  // Assets
  assets: RestaurantAsset[];
  
  // Disabled ingredients (for availability management)
  disabled_ingredients: string[];
  
  // WhatsApp Business
  phone_number_id: string | null;
  whatsapp_business_id: string | null;
  whatsapp_access_token: string | null;
  
  // Reservations
  reservations_webhook_url: string | null;
  
  // GPS Coordinates
  longitude: number | null;
  latitude: number | null;
  
  // Customization
  theme_color: string | null;
  cover_image_url: string | null;
  featured_categories: string[] | null;
  category_order: string[] | null;
  
  // Online Orders
  online_orders_enabled: boolean;
  
  // Timestamps
  created_at: string;
  updated_at: string;
  
  // Onboarding
  onboarding_completed: boolean;
}

export function useRestaurantSettings(passedUserId?: string) {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const userId = passedUserId ?? user?.id;

  const { data: settings, isLoading } = useQuery({
    queryKey: ['restaurant-settings', userId],
    queryFn: async () => {
      if (!userId) return null;

      const { data, error } = await supabase
        .from('restaurant_settings')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) throw error;

      // Si pas de settings, créer les valeurs par défaut
      if (!data) {
        const defaultSettings = {
          user_id: userId,
          chatbot_name: 'ChatFood Bot',
          chatbot_active: false, // Désactivé par défaut jusqu'à création du catalogue
          opening_hours: [
            { day: 'lundi', slot1: '', slot2: '' },
            { day: 'mardi', slot1: '', slot2: '' },
            { day: 'mercredi', slot1: '', slot2: '' },
            { day: 'jeudi', slot1: '', slot2: '' },
            { day: 'vendredi', slot1: '', slot2: '' },
            { day: 'samedi', slot1: '', slot2: '' },
            { day: 'dimanche', slot1: '', slot2: '' },
          ],
        };

        const { data: newSettings, error: insertError } = await supabase
          .from('restaurant_settings')
          .insert(defaultSettings)
          .select()
          .single();

        if (insertError) throw insertError;
        return {
          ...newSettings,
          opening_hours: newSettings.opening_hours as unknown as OpeningHours[],
          assets: (newSettings.assets || []) as unknown as RestaurantAsset[],
        } as unknown as RestaurantSettings;
      }

      return {
        ...data,
        opening_hours: data.opening_hours as unknown as OpeningHours[],
        assets: (data.assets || []) as unknown as RestaurantAsset[],
      } as unknown as RestaurantSettings;
    },
    enabled: !!userId,
  });

  const updateMutation = useMutation({
    mutationFn: async (updates: Partial<RestaurantSettings>) => {
      if (!userId) throw new Error('User ID required');

      const payload = {
        ...updates,
        opening_hours: updates.opening_hours as any,
        assets: updates.assets as any,
        product_suggestions: updates.product_suggestions as any,
        daily_menu_config: updates.daily_menu_config as any,
      };

      const { data, error } = await supabase
        .from('restaurant_settings')
        .update(payload)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurant-settings', userId] });
      toast.success('Paramètres enregistrés avec succès');
    },
    onError: (error) => {
      toast.error('Erreur lors de la sauvegarde', {
        description: error.message,
      });
    },
  });

  return {
    settings,
    isLoading,
    updateSettings: updateMutation.mutate,
    isUpdating: updateMutation.isPending,
  };
}
