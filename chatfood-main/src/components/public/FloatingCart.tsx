import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/contexts/CartContext';
import { useIsMobile } from '@/hooks/use-mobile';
import { CartDrawer } from './CartDrawer';
import { CartPopover } from './CartPopover';

interface FloatingCartProps {
  currency?: string;
  themeColor?: string | null;
}

export function FloatingCart({ currency = 'EUR', themeColor }: FloatingCartProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { totalItems, totalPrice, restaurantSlug } = useCart();
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
    }).format(price);
  };

  if (totalItems === 0) {
    return null;
  }

  const buttonStyle = themeColor 
    ? { backgroundColor: themeColor }
    : undefined;

  const handleClick = () => {
    if (isMobile) {
      // Mobile: go directly to checkout
      navigate(`/r/${restaurantSlug}/checkout`);
    } else {
      // Desktop: open popover
      setIsOpen(true);
    }
  };

  return (
    <>
      <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-6 md:bottom-6 md:w-auto">
        {isMobile ? (
          // Mobile: Simple button that goes to checkout
          <Button
            size="lg"
            className="w-full shadow-xl py-6 text-base font-semibold gap-3"
            style={buttonStyle}
            onClick={handleClick}
          >
            <div className="relative">
              <ShoppingCart className="h-5 w-5" />
              <Badge 
                className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs bg-background text-foreground"
              >
                {totalItems}
              </Badge>
            </div>
            <span>Commander</span>
            <span className="font-bold">{formatPrice(totalPrice)}</span>
          </Button>
        ) : (
          // Desktop: Button with popover
          <CartPopover
            open={isOpen}
            onOpenChange={setIsOpen}
            currency={currency}
            themeColor={themeColor}
          >
            <Button
              size="lg"
              className="shadow-xl py-6 text-base font-semibold gap-3"
              style={buttonStyle}
              onClick={() => setIsOpen(!isOpen)}
            >
              <div className="relative">
                <ShoppingCart className="h-5 w-5" />
                <Badge 
                  className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs bg-background text-foreground"
                >
                  {totalItems}
                </Badge>
              </div>
              <span>Voir le panier</span>
              <span className="font-bold">{formatPrice(totalPrice)}</span>
            </Button>
          </CartPopover>
        )}
      </div>

      {/* Keep CartDrawer for potential fallback use */}
      {isMobile && (
        <CartDrawer
          open={false}
          onOpenChange={() => {}}
          currency={currency}
          themeColor={themeColor}
        />
      )}
    </>
  );
}
