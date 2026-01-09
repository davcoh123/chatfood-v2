import { useState, useMemo, useEffect } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, AlertTriangle, Loader2, Leaf } from 'lucide-react';
import { CatalogueItem } from '@/hooks/useCatalogue';
import { useRestaurantSettings } from '@/hooks/useRestaurantSettings';
import { toast } from 'sonner';

interface IngredientsManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  items: CatalogueItem[];
  saveItems: (items: CatalogueItem[]) => void;
  userId?: string;
}

export function IngredientsManager({ 
  open, 
  onOpenChange, 
  items, 
  saveItems,
  userId 
}: IngredientsManagerProps) {
  const { settings, updateSettings, isUpdating } = useRestaurantSettings(userId);
  const [searchTerm, setSearchTerm] = useState('');
  const [disabledIngredients, setDisabledIngredients] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);

  // Initialize from settings
  useEffect(() => {
    if (settings?.disabled_ingredients) {
      setDisabledIngredients(new Set(settings.disabled_ingredients));
    }
  }, [settings?.disabled_ingredients]);

  // Extract all unique ingredients from items
  const ingredientsWithCounts = useMemo(() => {
    const ingredientMap = new Map<string, { count: number; productIds: string[] }>();
    
    items.forEach(item => {
      const ingredients = item.ingredient || [];
      ingredients.forEach(ing => {
        const normalizedIng = ing.trim().toLowerCase();
        if (!normalizedIng) return;
        
        const existing = ingredientMap.get(normalizedIng) || { count: 0, productIds: [] };
        existing.count += 1;
        existing.productIds.push(item.id);
        ingredientMap.set(normalizedIng, existing);
      });
    });
    
    // Sort alphabetically and convert to array
    return Array.from(ingredientMap.entries())
      .map(([name, data]) => ({
        name,
        displayName: name.charAt(0).toUpperCase() + name.slice(1),
        count: data.count,
        productIds: data.productIds
      }))
      .sort((a, b) => a.name.localeCompare(b.name, 'fr'));
  }, [items]);

  // Filter by search
  const filteredIngredients = useMemo(() => {
    if (!searchTerm) return ingredientsWithCounts;
    const term = searchTerm.toLowerCase();
    return ingredientsWithCounts.filter(ing => ing.name.includes(term));
  }, [ingredientsWithCounts, searchTerm]);

  // Count affected products
  const affectedProductsCount = useMemo(() => {
    const affectedIds = new Set<string>();
    ingredientsWithCounts.forEach(ing => {
      if (disabledIngredients.has(ing.name)) {
        ing.productIds.forEach(id => affectedIds.add(id));
      }
    });
    return affectedIds.size;
  }, [ingredientsWithCounts, disabledIngredients]);

  // Toggle ingredient
  const toggleIngredient = (ingredientName: string) => {
    setDisabledIngredients(prev => {
      const newSet = new Set(prev);
      if (newSet.has(ingredientName)) {
        newSet.delete(ingredientName);
      } else {
        newSet.add(ingredientName);
      }
      return newSet;
    });
  };

  // Save changes
  const handleSave = async () => {
    setIsSaving(true);
    try {
      const disabledArray = Array.from(disabledIngredients);
      
      // Update products based on disabled ingredients
      const updatedItems = items.map(item => {
        const itemIngredients = (item.ingredient || []).map(i => i.trim().toLowerCase());
        
        // Check if any ingredient is disabled
        const hasDisabledIngredient = itemIngredients.some(ing => disabledIngredients.has(ing));
        
        return {
          ...item,
          is_active: !hasDisabledIngredient
        };
      });
      
      // Save disabled ingredients to settings
      await new Promise<void>((resolve, reject) => {
        updateSettings({ disabled_ingredients: disabledArray } as any, {
          onSuccess: () => resolve(),
          onError: (err) => reject(err)
        });
      });
      
      // Save updated products
      saveItems(updatedItems);
      
      toast.success(`${affectedProductsCount} produit(s) mis à jour`);
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving ingredients:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <Leaf className="h-5 w-5 text-green-600" />
            Gestion des ingrédients
          </SheetTitle>
          <SheetDescription>
            Désactivez un ingrédient pour rendre indisponibles tous les produits qui le contiennent.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 flex flex-col gap-4 py-4 overflow-hidden">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher un ingrédient..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">
              {ingredientsWithCounts.length} ingrédient(s) au total
            </span>
            <Badge variant={disabledIngredients.size > 0 ? "destructive" : "secondary"}>
              {disabledIngredients.size} désactivé(s)
            </Badge>
          </div>

          {/* Warning if ingredients are disabled */}
          {disabledIngredients.size > 0 && (
            <Alert variant="destructive" className="py-2">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                {affectedProductsCount} produit(s) seront indisponibles
              </AlertDescription>
            </Alert>
          )}

          {/* Ingredients list */}
          <ScrollArea className="flex-1 -mx-6 px-6">
            <div className="space-y-2">
              {filteredIngredients.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {searchTerm ? 'Aucun ingrédient trouvé' : 'Aucun ingrédient dans le catalogue'}
                </div>
              ) : (
                filteredIngredients.map(ing => {
                  const isDisabled = disabledIngredients.has(ing.name);
                  return (
                    <div 
                      key={ing.name}
                      className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                        isDisabled ? 'bg-destructive/10 border-destructive/30' : 'bg-card'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`font-medium ${isDisabled ? 'text-destructive line-through' : ''}`}>
                          {ing.displayName}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {ing.count} produit{ing.count > 1 ? 's' : ''}
                        </Badge>
                      </div>
                      <Switch
                        checked={!isDisabled}
                        onCheckedChange={() => toggleIngredient(ing.name)}
                      />
                    </div>
                  );
                })
              )}
            </div>
          </ScrollArea>
        </div>

        <SheetFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={isSaving || isUpdating}
          >
            {(isSaving || isUpdating) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Sauvegarder
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
