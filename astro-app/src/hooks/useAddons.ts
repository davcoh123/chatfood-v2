import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';


export interface Addon {
  id?: string;
  label: string;
  price: number;
  applies_to_type: 'product' | 'category' | 'global';
  applies_to_value: string | null;
  max_per_item: number | null;
  is_active: boolean;
}

export const useAddons = (options?: { userId?: string }) => {
  const queryClient = useQueryClient();
  const [authUserId, setAuthUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!options?.userId) {
      supabase.auth.getUser().then(({ data }) => {
        if (data.user) setAuthUserId(data.user.id);
      });
    }
  }, [options?.userId]);

  const userId = options?.userId || authUserId || '';

  // Récupérer les add-ons depuis Supabase
  const { data: addons, isLoading, error } = useQuery<Addon[]>({
    queryKey: ['addons', userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data, error } = await supabase
        .from('addons')
        .select('*')
        .eq('user_id', userId)
        .order('sort_order')
        .order('label');

      if (error) {
        console.error('Error fetching addons:', error);
        throw error;
      }

      return (data || []).map((addon) => ({
        id: addon.id,
        label: addon.label,
        price: addon.price,
        applies_to_type: addon.applies_to_type,
        applies_to_value: addon.applies_to_value,
        max_per_item: addon.max_per_item,
        is_active: addon.is_active,
      }));
    },
    enabled: !!userId,
  });

  // Mutation pour sauvegarder tous les add-ons
  const saveMutation = useMutation({
    mutationFn: async (allAddons: Addon[]) => {
      if (!userId) {
        throw new Error('Utilisateur non connecté');
      }

      const addonsToUpsert = allAddons.map((addon) => ({
        id: addon.id,
        user_id: userId,
        label: addon.label,
        price: addon.price,
        applies_to_type: addon.applies_to_type,
        applies_to_value: addon.applies_to_value,
        max_per_item: addon.max_per_item,
        is_active: addon.is_active,
        updated_at: new Date().toISOString(),
      }));

      const { error } = await supabase
        .from('addons')
        .upsert(addonsToUpsert, { onConflict: 'id' });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Suppléments enregistrés');
      queryClient.invalidateQueries({ queryKey: ['addons', userId] });
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });

  // Mutation pour sauvegarder un seul add-on
  const saveAddonMutation = useMutation({
    mutationFn: async (addon: Addon) => {
      if (!userId) {
        throw new Error('Utilisateur non connecté');
      }

      const { error } = await supabase
        .from('addons')
        .upsert({
          id: addon.id,
          user_id: userId,
          label: addon.label,
          price: addon.price,
          applies_to_type: addon.applies_to_type,
          applies_to_value: addon.applies_to_value,
          max_per_item: addon.max_per_item,
          is_active: addon.is_active,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' });

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Supplément enregistré');
      queryClient.invalidateQueries({ queryKey: ['addons', userId] });
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });

  // Mutation pour supprimer un add-on
  const deleteMutation = useMutation({
    mutationFn: async (addon: Addon) => {
      if (!userId || !addon.id) {
        throw new Error('Utilisateur non connecté');
      }

      const { error } = await supabase
        .from('addons')
        .delete()
        .eq('id', addon.id)
        .eq('user_id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Supplément supprimé');
      queryClient.invalidateQueries({ queryKey: ['addons', userId] });
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });

  return {
    addons: addons || [],
    isLoading,
    error,
    hasConfig: !!userId,
    saveAddons: saveMutation.mutate,
    saveAddon: saveAddonMutation.mutate,
    isSaving: saveMutation.isPending || saveAddonMutation.isPending,
    deleteAddon: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  };
};
