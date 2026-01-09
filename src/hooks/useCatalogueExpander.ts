import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface CatalogueProduct {
  id: string;
  name: string;
  ingredient: string[];
  description: string;
  unit_price: number;
  currency: string;
  vat_rate: number;
  is_active: boolean;
  tags: string[];
  allergens: string[];
}

export interface CatalogueCategory {
  id: string;
  name: string;
  products: CatalogueProduct[];
}

export function useCatalogueExpander(userId?: string) {
  const [categories, setCategories] = useState<CatalogueCategory[]>([]);
  const queryClient = useQueryClient();

  const addCategories = useMutation({
    mutationFn: async (categoriesToAdd: CatalogueCategory[]) => {
      if (!userId) {
        throw new Error('Utilisateur non identifié');
      }

      const productsToInsert: {
        user_id: string;
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
        sort_order: number;
      }[] = [];
      
      let sortOrder = 0;

      for (const category of categoriesToAdd) {
        for (const product of category.products) {
          productsToInsert.push({
            user_id: userId,
            name: product.name,
            ingredient: product.ingredient || [],
            category: category.name,
            description: product.description || '',
            unit_price: product.unit_price || 0,
            currency: product.currency || 'EUR',
            vat_rate: product.vat_rate || 10,
            is_active: product.is_active !== false,
            tags: product.tags || [],
            allergens: product.allergens || [],
            sort_order: sortOrder++,
          });
        }
      }

      if (productsToInsert.length === 0) {
        throw new Error('Aucun produit à ajouter');
      }

      const { error } = await supabase
        .from('products')
        .insert(productsToInsert);

      if (error) {
        console.error('Error inserting products:', error);
        throw error;
      }

      return { count: productsToInsert.length };
    },
    onSuccess: (data) => {
      toast.success(`${data.count} produit(s) ajouté(s) avec succès`);
      setCategories([]);
      queryClient.invalidateQueries({ queryKey: ['catalogue-items', userId] });
    },
    onError: (error: Error) => {
      console.error('Erreur ajout catalogue:', error);
      toast.error('Erreur lors de l\'ajout', {
        description: error.message,
      });
    },
  });

  return {
    categories,
    setCategories,
    addCategories: addCategories.mutate,
    isAdding: addCategories.isPending,
  };
}
