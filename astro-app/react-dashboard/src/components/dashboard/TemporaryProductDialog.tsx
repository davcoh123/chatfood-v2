import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { DailyMenuProduct } from '@/hooks/useRestaurantSettings';

interface TemporaryProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (product: DailyMenuProduct) => void;
}

export function TemporaryProductDialog({
  open,
  onOpenChange,
  onAdd,
}: TemporaryProductDialogProps) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');

  const handleAdd = () => {
    if (!name || !price) return;

    const tempProduct: DailyMenuProduct = {
      product_id: `TEMP-${Date.now()}`,
      is_temporary: true,
      name,
      price: parseFloat(price),
    };

    onAdd(tempProduct);
    setName('');
    setPrice('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajouter un produit temporaire</DialogTitle>
          <DialogDescription>
            Ajoutez un produit spécial qui n'existe pas dans votre catalogue
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="temp-name">Nom du produit</Label>
            <Input
              id="temp-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Plat du chef spécial"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="temp-price">Prix (€)</Label>
            <Input
              id="temp-price"
              type="number"
              step="0.01"
              min="0"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="14.90"
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button onClick={handleAdd} disabled={!name || !price}>
              Ajouter
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
