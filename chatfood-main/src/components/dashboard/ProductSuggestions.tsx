import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Lightbulb, Plus, X, ArrowRight } from 'lucide-react';
import { useRestaurantSettings, ProductSuggestion } from '@/hooks/useRestaurantSettings';
import { useCatalogue } from '@/hooks/useCatalogue';
import { useMenus } from '@/hooks/useMenus';
import { SuggestionDialog } from './SuggestionDialog';

interface ProductSuggestionsProps {
  userId?: string;
}

export function ProductSuggestions({ userId }: ProductSuggestionsProps) {
  const { settings, updateSettings } = useRestaurantSettings(userId);
  const { items: catalogueItems } = useCatalogue();
  const { menus } = useMenus();
  
  const [suggestions, setSuggestions] = useState<ProductSuggestion[]>([]);
  const [showSuggestionDialog, setShowSuggestionDialog] = useState(false);

  useEffect(() => {
    if (settings?.product_suggestions) {
      setSuggestions(settings.product_suggestions as ProductSuggestion[]);
    }
  }, [settings]);

  const handleAddSuggestion = (newSuggestion: ProductSuggestion) => {
    const updated = [...suggestions, newSuggestion];
    setSuggestions(updated);
    updateSettings({
      product_suggestions: updated as unknown as any,
    });
    setShowSuggestionDialog(false);
  };

  const handleRemoveSuggestion = (index: number) => {
    const updated = suggestions.filter((_, i) => i !== index);
    setSuggestions(updated);
    updateSettings({
      product_suggestions: updated as unknown as any,
    });
  };

  const getProductName = (productId: string) => {
    const product = catalogueItems.find(item => item.id === productId);
    return product?.name || productId;
  };

  const getMenuName = (menuId: string) => {
    const menu = menus.find(m => m.id === menuId);
    return menu?.label || menuId;
  };

  const getSuggestionDisplay = (suggestion: ProductSuggestion) => {
    const triggerName = getProductName(suggestion.trigger_product_id);
    const suggestedName = suggestion.type === 'menu' 
      ? getMenuName(suggestion.suggested_product_id)
      : getProductName(suggestion.suggested_product_id);
    
    return { triggerName, suggestedName };
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Lightbulb className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Suggestions Automatiques</CardTitle>
              <CardDescription>Proposez des produits complémentaires</CardDescription>
            </div>
          </div>
          <Button onClick={() => setShowSuggestionDialog(true)} size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Ajouter
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {suggestions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground bg-muted/20 rounded-lg border border-dashed">
              <Lightbulb className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Aucune suggestion configurée</p>
              <Button variant="link" onClick={() => setShowSuggestionDialog(true)}>
                Créer votre première suggestion
              </Button>
            </div>
          ) : (
            <div className="grid gap-3">
              {suggestions.map((suggestion, index) => {
                const { triggerName, suggestedName } = getSuggestionDisplay(suggestion);
                return (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border group hover:border-primary/30 transition-colors">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <Badge variant="outline" className="bg-background shrink-0">
                        Si achat de
                      </Badge>
                      <span className="font-medium truncate">{triggerName}</span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                      <Badge variant="outline" className="bg-primary/5 border-primary/20 text-primary shrink-0">
                        Proposer
                      </Badge>
                      <span className="font-medium truncate">{suggestedName}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleRemoveSuggestion(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>

      <SuggestionDialog
        open={showSuggestionDialog}
        onOpenChange={setShowSuggestionDialog}
        onAddSuggestion={handleAddSuggestion}
        catalogueItems={catalogueItems}
        menus={menus}
      />
    </Card>
  );
}
