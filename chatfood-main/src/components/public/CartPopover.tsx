import { useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCart } from '@/contexts/CartContext';

interface CartPopoverProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currency?: string;
  themeColor?: string | null;
  children: React.ReactNode;
}

export function CartPopover({ open, onOpenChange, currency = 'EUR', themeColor, children }: CartPopoverProps) {
  const navigate = useNavigate();
  const { items, updateQuantity, removeItem, clearCart, totalPrice, restaurantSlug } = useCart();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
    }).format(price);
  };

  const handleCheckout = () => {
    onOpenChange(false);
    navigate(`/r/${restaurantSlug}/checkout`);
  };

  const handleContinueShopping = () => {
    onOpenChange(false);
  };

  const buttonStyle = themeColor ? { backgroundColor: themeColor } : undefined;

  return (
    <Popover open={open} onOpenChange={onOpenChange}>
      <PopoverTrigger asChild>
        {children}
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 p-0" 
        align="end" 
        side="top"
        sideOffset={8}
      >
        <div className="p-4 border-b">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            <h3 className="font-semibold">Votre panier</h3>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {items.length === 0 
              ? 'Votre panier est vide'
              : `${items.reduce((s, i) => s + i.quantity, 0)} article(s)`
            }
          </p>
        </div>

        {items.length > 0 ? (
          <>
            <ScrollArea className="max-h-64">
              <div className="p-4 space-y-3">
                {items.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex items-center gap-3 p-2 bg-muted/50 rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">
                        {item.product.name}
                      </h4>
                      <p className="text-xs text-muted-foreground">
                        {formatPrice(item.product.unit_price)} × {item.quantity}
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-6 w-6"
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-5 text-center text-xs font-medium">
                        {item.quantity}
                      </span>
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-6 w-6"
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>

                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-6 w-6 text-destructive hover:text-destructive"
                      onClick={() => removeItem(item.product.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="border-t p-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-medium">Total</span>
                <span className="text-lg font-bold">{formatPrice(totalPrice)}</span>
              </div>
              
              <div className="space-y-2">
                <Button 
                  className="w-full gap-2"
                  style={buttonStyle}
                  onClick={handleCheckout}
                >
                  Procéder au paiement
                  <ArrowRight className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={handleContinueShopping}
                >
                  Continuer mes achats
                </Button>
              </div>
              
              <Button 
                variant="ghost" 
                size="sm"
                className="w-full text-destructive hover:text-destructive text-xs"
                onClick={clearCart}
              >
                Vider le panier
              </Button>
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <ShoppingBag className="h-10 w-10 text-muted-foreground/50 mb-3" />
            <p className="text-sm text-muted-foreground">
              Ajoutez des produits pour commencer
            </p>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
