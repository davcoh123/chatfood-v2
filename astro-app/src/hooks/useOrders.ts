import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useEffect, useState } from 'react';

export interface OrderItem {
  product_id?: string;
  name: string;
  unit_price: string;
  qty: number;
  line_total: string;
  addons?: Array<{ addon_id: string; label: string; price: string; qty: number; line_total: string }>;
  menu_choices?: { choice1?: string; choice2?: string; choice3?: string; choice4?: string };
}

export interface ProductInfo {
  id: string;
  name: string;
  category: string;
}

export interface Order {
  id: string;
  name: string;
  phone: string;
  commande_item: OrderItem[];
  price_total: number;
  note: string | null;
  commande_type: string;
  horaire_recup: string | null;
  heure_de_commande: string;
  status: string;
}

export const useOrders = (passedUserId?: string) => {
  const queryClient = useQueryClient();
  const [authUserId, setAuthUserId] = useState<string | null>(null);
  
  // Get userId from Supabase auth if not passed
  useEffect(() => {
    if (!passedUserId) {
      supabase.auth.getUser().then(({ data }) => {
        if (data.user) setAuthUserId(data.user.id);
      });
    }
  }, [passedUserId]);
  
  const userId = passedUserId || authUserId || '';

  // Récupérer les produits pour enrichir les commandes avec les catégories
  const { data: products = [] } = useQuery<ProductInfo[]>({
    queryKey: ['products-for-orders', userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from('products')
        .select('id, name, category')
        .eq('user_id', userId);

      if (error) {
        console.error('Error fetching products:', error);
        return [];
      }

      return (data || []).map((p) => ({
        id: p.id,
        name: p.name,
        category: p.category,
      }));
    },
    enabled: !!userId,
  });

  // Récupérer les commandes depuis Supabase
  const { data: orders = [], isLoading, error } = useQuery<Order[]>({
    queryKey: ['orders', userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from('chatbot_orders')
        .select('*')
        .eq('user_id', userId)
        .order('heure_de_commande', { ascending: false });

      if (error) {
        console.error('Error fetching orders:', error);
        throw error;
      }

      return (data || []).map((order) => ({
        id: order.id,
        name: order.name || 'Client',
        phone: order.phone,
        commande_item: Array.isArray(order.commande_item) ? (order.commande_item as unknown as OrderItem[]) : [],
        price_total: order.price_total || 0,
        note: order.note,
        commande_type: order.commande_type,
        horaire_recup: order.horaire_recup,
        heure_de_commande: order.heure_de_commande,
        status: order.status || 'pending',
      }));
    },
    enabled: !!userId,
    refetchInterval: 30000,
  });

  // Mutation pour mettre à jour le statut directement
  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, newStatus }: { orderId: string; newStatus: string }) => {
      if (!userId) throw new Error('Utilisateur non connecté');
      
      const { error } = await supabase
        .from('chatbot_orders')
        .update({ status: newStatus })
        .eq('id', orderId)
        .eq('user_id', userId);

      if (error) throw error;
      
      // Si la commande passe en "delivered", déclencher la demande d'avis
      if (newStatus === 'delivered') {
        try {
          console.log('Order delivered, triggering review request for order:', orderId);
          const { error: funcError } = await supabase.functions.invoke('trigger-review-request', {
            body: { order_id: orderId }
          });
          
          if (funcError) {
            console.error('Error triggering review request:', funcError);
            // On ne bloque pas la mise à jour du statut si l'envoi échoue
          }
        } catch (err) {
          console.error('Failed to invoke trigger-review-request:', err);
        }
      }
      
      return { success: true };
    },
    onSuccess: () => {
      toast.success('Statut de commande mis à jour');
      queryClient.invalidateQueries({ queryKey: ['orders', userId] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const getPendingOrders = () => {
    return orders.filter(order => 
      ['pending', 'confirmed', 'preparing', 'ready'].includes(order.status)
    );
  };

  const getTodayOrders = () => {
    const today = new Date().toISOString().split('T')[0];
    return orders.filter(order => order.heure_de_commande.startsWith(today));
  };

  const getOrdersHistory = () => {
    return orders.filter(order => 
      ['delivered', 'cancelled'].includes(order.status)
    );
  };

  const getTodayRevenue = () => {
    return getTodayOrders()
      .filter(order => order.status === 'delivered')
      .reduce((sum, order) => sum + order.price_total, 0);
  };

  const getAveragePreparationTime = () => {
    // Sans les colonnes confirmed_at et ready_at, on ne peut plus calculer
    // Retourne 0 ou une valeur par défaut
    return 0;
  };

  return {
    orders,
    products,
    isLoading,
    error,
    getPendingOrders,
    getTodayOrders,
    getOrdersHistory,
    getTodayRevenue,
    getAveragePreparationTime,
    updateOrderStatus: updateStatusMutation.mutate,
    isUpdating: updateStatusMutation.isPending,
  };
};
