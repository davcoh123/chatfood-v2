import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface CatalogueProduct {
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

interface CatalogueCategory {
  id: string;
  name: string;
  products: CatalogueProduct[];
}

export function useCatalogueCreator() {
  const [categories, setCategories] = useState<CatalogueCategory[]>([]);
  const { profile } = useAuth();
  const queryClient = useQueryClient();
  const userId = profile?.user_id || '';

  // Mutation pour créer le catalogue directement dans Supabase
  const createCatalogue = useMutation({
    mutationFn: async (categoriesToCreate: CatalogueCategory[]) => {
      if (!userId) {
        throw new Error('Utilisateur non identifié');
      }

      // Transformer les catégories en produits
      const productsToInsert: any[] = [];
      let sortOrder = 0;

      for (const category of categoriesToCreate) {
        for (const product of category.products) {
          productsToInsert.push({
            user_id: userId,
            name: product.name,
            ingredient: product.ingredient,
            category: category.name,
            description: product.description,
            unit_price: product.unit_price,
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
        throw new Error('Aucun produit à créer');
      }

      // Insérer les produits dans Supabase
      const { error } = await supabase
        .from('products')
        .insert(productsToInsert);

      if (error) {
        console.error('Error inserting products:', error);
        throw error;
      }

      return { 
        items: productsToInsert,
        count: productsToInsert.length,
      };
    },
    onSuccess: (data) => {
      toast.success(`Catalogue créé avec succès ! ${data.count} produits ajoutés.`);
      setCategories([]);
      queryClient.invalidateQueries({ queryKey: ['catalogue-items'] });
    },
    onError: (error) => {
      console.error('Erreur création catalogue:', error);
      toast.error('Erreur lors de la création du catalogue.');
    },
  });

  return {
    categories,
    setCategories,
    createCatalogue: createCatalogue.mutate,
    isCreating: createCatalogue.isPending,
    hasWebhook: !!userId,
  };
}

export type { CatalogueCategory, CatalogueProduct };
