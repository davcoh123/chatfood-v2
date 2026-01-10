import { Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import type { PublicProduct } from '@/hooks/usePublicRestaurant';

interface AddToCartButtonProps {
  product: PublicProduct;
  themeColor?: string | null;
}

export function AddToCartButton({ product, themeColor }: AddToCartButtonProps) {
  const { addItem, updateQuantity, getItemQuantity } = useCart();
  const quantity = getItemQuantity(product.id);

  const buttonStyle = themeColor ? { backgroundColor: themeColor } : undefined;

  if (quantity === 0) {
    return (
      <Button
        size="sm"
        className="h-8 px-3 text-sm font-medium"
        style={buttonStyle}
        onClick={(e) => {
          e.stopPropagation();
          addItem(product);
        }}
      >
        <Plus className="h-4 w-4 mr-1" />
        Ajouter
      </Button>
    );
  }

  return (
    <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
      <Button
        size="icon"
        variant="outline"
        className="h-8 w-8"
        onClick={() => updateQuantity(product.id, quantity - 1)}
      >
        <Minus className="h-3 w-3" />
      </Button>
      <span className="w-8 text-center font-medium text-sm">{quantity}</span>
      <Button
        size="icon"
        className="h-8 w-8"
        style={buttonStyle}
        onClick={() => addItem(product)}
      >
        <Plus className="h-3 w-3" />
      </Button>
    </div>
  );
}
