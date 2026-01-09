import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';


export interface CatalogueItem {
  id: string;
  name: string;
  ingredient: string[];
  category: string;
  description: string;
  unit_price: number;
  currency: string;
  vat_rate: number;
  is_active: boolean;
  tags: string[];
  allergens: string[];
}

export const useCatalogue = () => {
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  const userId = profile?.user_id || '';

  // Récupérer les produits depuis Supabase
  const { data: items, isLoading: itemsLoading, error: itemsError } = useQuery<CatalogueItem[]>({
    queryKey: ['catalogue-items', userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', userId)
        .order('category')
        .order('sort_order')
        .order('name');

      if (error) {
        console.error('Error fetching catalogue:', error);
        throw error;
      }

      return (data || []).map((item) => ({
        id: item.id,
        name: item.name,
        ingredient: item.ingredient || [],
        category: item.category,
        description: item.description || '',
        unit_price: item.unit_price,
        currency: item.currency || 'EUR',
        vat_rate: item.vat_rate || 10,
        is_active: item.is_active,
        tags: item.tags || [],
        allergens: item.allergens || [],
      }));
    },
    enabled: !!userId,
  });

  // Mutation pour sauvegarder les produits
  const saveMutation = useMutation({
    mutationFn: async (allItems: CatalogueItem[]) => {
      if (!userId) {
        throw new Error('Utilisateur non connecté');
      }

      // Upsert tous les produits
      const productsToUpsert = allItems.map((item) => ({
        id: item.id,
        user_id: userId,
        name: item.name,
        ingredient: item.ingredient,
        category: item.category,
        description: item.description,
        unit_price: item.unit_price,
        currency: item.currency,
        vat_rate: item.vat_rate,
        is_active: item.is_active,
        tags: item.tags,
        allergens: item.allergens,
        updated_at: new Date().toISOString(),
      }));

      const { error } = await supabase
        .from('products')
        .upsert(productsToUpsert, { onConflict: 'id' });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Modifications enregistrées');
      queryClient.invalidateQueries({ queryKey: ['catalogue-items', userId] });
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });

  // Mutation pour supprimer un produit
  const deleteMutation = useMutation({
    mutationFn: async (item: CatalogueItem) => {
      if (!userId) {
        throw new Error('Utilisateur non connecté');
      }

      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', item.id)
        .eq('user_id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Produit supprimé');
      queryClient.invalidateQueries({ queryKey: ['catalogue-items', userId] });
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });

  return {
    items: items || [],
    isLoading: itemsLoading,
    error: itemsError,
    hasConfig: !!userId,
    saveItems: saveMutation.mutate,
    isSaving: saveMutation.isPending,
    deleteItem: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  };
};
