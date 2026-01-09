import { useNavigate } from 'react-router-dom';
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useCart } from '@/contexts/CartContext';

interface CartDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currency?: string;
  themeColor?: string | null;
}

export function CartDrawer({ open, onOpenChange, currency = 'EUR', themeColor }: CartDrawerProps) {
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

  const buttonStyle = themeColor ? { backgroundColor: themeColor } : undefined;

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader className="text-left">
          <DrawerTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Votre panier
          </DrawerTitle>
          <DrawerDescription>
            {items.length === 0 
              ? 'Votre panier est vide'
              : `${items.reduce((s, i) => s + i.quantity, 0)} article(s)`
            }
          </DrawerDescription>
        </DrawerHeader>

        {items.length > 0 ? (
          <>
            <ScrollArea className="flex-1 px-4 max-h-[50vh]">
              <div className="space-y-3 pb-4">
                {items.map((item) => (
                  <div
                    key={item.product.id}
                    className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg"
                  >
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-sm truncate">
                        {item.product.name}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {formatPrice(item.product.unit_price)}
                      </p>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-7 w-7"
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-6 text-center text-sm font-medium">
                        {item.quantity}
                      </span>
                      <Button
                        size="icon"
                        variant="outline"
                        className="h-7 w-7"
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>

                    <Button
                      size="icon"
                      variant="ghost"
                      className="h-7 w-7 text-destructive hover:text-destructive"
                      onClick={() => removeItem(item.product.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="border-t px-4 py-3">
              <div className="flex justify-between items-center mb-3">
                <span className="font-medium">Total</span>
                <span className="text-lg font-bold">{formatPrice(totalPrice)}</span>
              </div>
            </div>

            <DrawerFooter className="pt-0">
              <Button 
                size="lg" 
                className="w-full"
                style={buttonStyle}
                onClick={handleCheckout}
              >
                Commander • {formatPrice(totalPrice)}
              </Button>
              <div className="flex gap-2">
                <DrawerClose asChild>
                  <Button variant="outline" className="flex-1">
                    Continuer
                  </Button>
                </DrawerClose>
                <Button 
                  variant="ghost" 
                  className="text-destructive hover:text-destructive"
                  onClick={clearCart}
                >
                  Vider
                </Button>
              </div>
            </DrawerFooter>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <ShoppingBag className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">
              Ajoutez des produits pour commencer
            </p>
            <DrawerClose asChild>
              <Button variant="link" className="mt-2">
                Voir le menu
              </Button>
            </DrawerClose>
          </div>
        )}
      </DrawerContent>
    </Drawer>
  );
}
