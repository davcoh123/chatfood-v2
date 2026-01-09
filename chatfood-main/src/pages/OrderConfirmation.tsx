import { useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { CheckCircle, ArrowLeft, Clock, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { usePublicRestaurant } from '@/hooks/usePublicRestaurant';

interface OrderDetails {
  customerName: string;
  items: Array<{
    product: { name: string; unit_price: number };
    quantity: number;
  }>;
  totalPrice: number;
  orderType: string;
  pickupTime?: string;
}

export default function OrderConfirmation() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { restaurant } = usePublicRestaurant(slug);

  const orderDetails = location.state?.orderDetails as OrderDetails | undefined;

  // Redirect if no order details
  useEffect(() => {
    if (!orderDetails) {
      navigate(`/r/${slug}`);
    }
  }, [orderDetails, slug, navigate]);

  if (!orderDetails) {
    return null;
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
    }).format(price);
  };

  const buttonStyle = restaurant?.theme_color 
    ? { backgroundColor: restaurant.theme_color }
    : undefined;

  return (
    <>
      <Helmet>
        <title>Commande confirmée | {restaurant?.restaurant_name || 'Restaurant'}</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="min-h-screen bg-background flex flex-col">
        <main className="flex-1 flex flex-col items-center justify-center px-4 py-12">
          <div className="max-w-md w-full space-y-6 text-center">
            {/* Success Icon */}
            <div 
              className="mx-auto w-20 h-20 rounded-full flex items-center justify-center"
              style={{ 
                backgroundColor: restaurant?.theme_color 
                  ? `${restaurant.theme_color}20` 
                  : 'hsl(var(--primary) / 0.1)' 
              }}
            >
              <CheckCircle 
                className="h-10 w-10" 
                style={{ color: restaurant?.theme_color || 'hsl(var(--primary))' }}
              />
            </div>

            {/* Success Message */}
            <div className="space-y-2">
              <h1 className="text-2xl font-bold text-foreground">
                Commande envoyée !
              </h1>
              <p className="text-muted-foreground">
                Merci {orderDetails.customerName}, votre commande a bien été reçue par {restaurant?.restaurant_name || 'le restaurant'}.
              </p>
            </div>

            {/* Order Summary Card */}
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center gap-3 text-left">
                  <ShoppingBag className="h-5 w-5 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm text-muted-foreground">Votre commande</p>
                    <p className="font-medium">
                      {orderDetails.items.reduce((sum, i) => sum + i.quantity, 0)} article(s) • {formatPrice(orderDetails.totalPrice)}
                    </p>
                  </div>
                </div>

                {orderDetails.pickupTime && (
                  <div className="flex items-center gap-3 text-left">
                    <Clock className="h-5 w-5 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm text-muted-foreground">Heure de retrait</p>
                      <p className="font-medium">{orderDetails.pickupTime}</p>
                    </div>
                  </div>
                )}

                <div className="pt-2 border-t">
                  <p className="text-sm text-muted-foreground">
                    Le restaurant vous contactera pour confirmer la commande.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <div className="space-y-3">
              <Button
                size="lg"
                className="w-full"
                style={buttonStyle}
                onClick={() => navigate(`/r/${slug}`)}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour au menu
              </Button>
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
