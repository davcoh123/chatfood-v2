import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export interface Menu {
  id?: string;
  label: string;
  choice1_label: string | null;
  choice1_productid: string[];
  choice2_label: string | null;
  choice2_productid: string[];
  choice3_label: string | null;
  choice3_productid: string[];
  choice4_label: string | null;
  choice4_productid: string[];
  menu_price: number;
  days: string;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

export const useMenus = (options?: { userId?: string }) => {
  const queryClient = useQueryClient();
  const { profile } = useAuth();
  const userId = options?.userId ?? profile?.user_id;

  // Récupérer les menus depuis Supabase
  const { data: menus, isLoading, error } = useQuery<Menu[]>({
    queryKey: ['menus', userId],
    queryFn: async () => {
      if (!userId) return [];

      const { data: menusData, error: menusError } = await supabase
        .from('chatbot_menus')
        .select('*')
        .eq('user_id', userId)
        .order('label');

      if (menusError) {
        console.error('Error fetching menus:', menusError);
        throw menusError;
      }

      return (menusData || []).map((menu: any) => ({
        id: menu.id,
        label: menu.label,
        choice1_label: menu.choice1_label || null,
        choice1_productid: menu.choice1_productid || [],
        choice2_label: menu.choice2_label || null,
        choice2_productid: menu.choice2_productid || [],
        choice3_label: menu.choice3_label || null,
        choice3_productid: menu.choice3_productid || [],
        choice4_label: menu.choice4_label || null,
        choice4_productid: menu.choice4_productid || [],
        menu_price: menu.menu_price,
        days: menu.available_days || '',
        start_time: menu.start_time || '',
        end_time: menu.end_time || '',
        is_active: menu.is_active,
      }));
    },
    enabled: !!userId,
  });

  // Mutation pour sauvegarder tous les menus
  const saveMutation = useMutation({
    mutationFn: async (allMenus: Menu[]) => {
      if (!userId) {
        throw new Error('Utilisateur non connecté');
      }

      for (const menu of allMenus) {
        await saveMenuToDb(menu, userId);
      }
    },
    onSuccess: () => {
      toast.success('Menus enregistrés');
      queryClient.invalidateQueries({ queryKey: ['menus', userId] });
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });

  // Mutation pour sauvegarder un seul menu
  const saveMenuMutation = useMutation({
    mutationFn: async (menu: Menu) => {
      if (!userId) {
        throw new Error('Utilisateur non connecté');
      }
      await saveMenuToDb(menu, userId);
    },
    onSuccess: () => {
      toast.success('Menu enregistré');
      queryClient.invalidateQueries({ queryKey: ['menus', userId] });
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });

  // Fonction helper pour sauvegarder un menu dans la DB
  const saveMenuToDb = async (menu: Menu, targetUserId: string) => {
    const { error: menuError } = await supabase
      .from('chatbot_menus')
      .upsert({
        id: menu.id,
        user_id: targetUserId,
        label: menu.label,
        choice1_label: menu.choice1_label,
        choice1_productid: menu.choice1_productid,
        choice2_label: menu.choice2_label,
        choice2_productid: menu.choice2_productid,
        choice3_label: menu.choice3_label,
        choice3_productid: menu.choice3_productid,
        choice4_label: menu.choice4_label,
        choice4_productid: menu.choice4_productid,
        menu_price: menu.menu_price,
        available_days: menu.days,
        start_time: menu.start_time || null,
        end_time: menu.end_time || null,
        is_active: menu.is_active,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'id' });

    if (menuError) throw menuError;
  };

  // Mutation pour supprimer un menu
  const deleteMutation = useMutation({
    mutationFn: async (menu: Menu) => {
      if (!userId || !menu.id) {
        throw new Error('Utilisateur non connecté');
      }

      const { error } = await supabase
        .from('chatbot_menus')
        .delete()
        .eq('id', menu.id)
        .eq('user_id', userId);

      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Menu supprimé');
      queryClient.invalidateQueries({ queryKey: ['menus', userId] });
    },
    onError: (error) => {
      toast.error(`Erreur: ${error.message}`);
    },
  });

  // Lookup d'un menu spécifique (pour édition)
  const lookupMutation = useMutation({
    mutationFn: async (menuId: string) => {
      if (!userId) {
        throw new Error('Utilisateur non connecté');
      }

      const { data, error } = await supabase
        .from('chatbot_menus')
        .select('*')
        .eq('user_id', userId)
        .eq('id', menuId)
        .single();

      if (error) throw error;

      return {
        id: data.id,
        label: data.label,
        choice1_label: data.choice1_label || null,
        choice1_productid: data.choice1_productid || [],
        choice2_label: data.choice2_label || null,
        choice2_productid: data.choice2_productid || [],
        choice3_label: data.choice3_label || null,
        choice3_productid: data.choice3_productid || [],
        choice4_label: data.choice4_label || null,
        choice4_productid: data.choice4_productid || [],
        menu_price: data.menu_price,
        days: data.available_days || '',
        start_time: data.start_time || '',
        end_time: data.end_time || '',
        is_active: data.is_active,
      } as Menu;
    },
  });

  return {
    menus: menus || [],
    isLoading,
    error,
    hasConfig: !!userId,
    saveMenus: saveMutation.mutate,
    saveMenu: saveMenuMutation.mutate,
    isSaving: saveMutation.isPending || saveMenuMutation.isPending,
    deleteMenu: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
    lookupMenu: lookupMutation.mutateAsync,
    isLookingUp: lookupMutation.isPending,
  };
};
