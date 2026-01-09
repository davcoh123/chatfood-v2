import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ProductSuggestion } from '@/hooks/useRestaurantSettings';
import { CatalogueItem } from '@/hooks/useCatalogue';
import { Menu } from '@/hooks/useMenus';

interface SuggestionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddSuggestion: (suggestion: ProductSuggestion) => void;
  catalogueItems: CatalogueItem[];
  menus: Menu[];
}

export function SuggestionDialog({
  open,
  onOpenChange,
  onAddSuggestion,
  catalogueItems,
  menus,
}: SuggestionDialogProps) {
  const [triggerProductId, setTriggerProductId] = useState('');
  const [suggestedId, setSuggestedId] = useState('');
  const [suggestionType, setSuggestionType] = useState<'product' | 'menu' | 'addon'>('product');

  const handleSubmit = () => {
    if (!triggerProductId || !suggestedId) return;

    onAddSuggestion({
      trigger_product_id: triggerProductId,
      suggested_product_id: suggestedId,
      type: suggestionType,
    });

    // Reset form
    setTriggerProductId('');
    setSuggestedId('');
    setSuggestionType('product');
    onOpenChange(false);
  };

  const getSuggestedItems = () => {
    if (suggestionType === 'menu') {
      return menus.map(menu => ({ id: menu.id, name: menu.label }));
    }
    return catalogueItems.map(item => ({ id: item.id, name: item.name }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Ajouter une suggestion</DialogTitle>
          <DialogDescription>
            Créez une association pour que le chatbot recommande automatiquement un produit ou menu
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Type de suggestion */}
          <div className="space-y-2">
            <Label>Type de suggestion</Label>
            <Select
              value={suggestionType}
              onValueChange={(value) => {
                setSuggestionType(value as 'product' | 'menu' | 'addon');
                setSuggestedId(''); // Reset suggested item when type changes
              }}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="product">Produit</SelectItem>
                <SelectItem value="menu">Menu</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Produit déclencheur */}
          <div className="space-y-2">
            <Label>Quand le client commande</Label>
            <Select value={triggerProductId} onValueChange={setTriggerProductId}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez un produit" />
              </SelectTrigger>
              <SelectContent className="max-h-[200px]">
                {catalogueItems.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Produit/Menu suggéré */}
          <div className="space-y-2">
            <Label>Le chatbot suggère</Label>
            <Select value={suggestedId} onValueChange={setSuggestedId}>
              <SelectTrigger>
                <SelectValue placeholder={`Sélectionnez un ${suggestionType === 'menu' ? 'menu' : 'produit'}`} />
              </SelectTrigger>
              <SelectContent className="max-h-[200px]">
                {getSuggestedItems().map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!triggerProductId || !suggestedId}
          >
            Ajouter la suggestion
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
