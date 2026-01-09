import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowLeft, Clock, MapPin, User, Phone, FileText, Loader2, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useCart } from '@/contexts/CartContext';
import { usePublicRestaurant } from '@/hooks/usePublicRestaurant';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { StripePaymentForm } from '@/components/checkout/StripePaymentForm';

type CheckoutStep = 'info' | 'payment';

export default function Checkout() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { items, totalPrice, clearCart, restaurantSlug } = useCart();
  const { restaurant, isLoading } = usePublicRestaurant(slug);

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [orderType, setOrderType] = useState<'pickup' | 'delivery'>('pickup');
  const [pickupTime, setPickupTime] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Stripe payment state
  const [step, setStep] = useState<CheckoutStep>('info');
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);

  const currency = items[0]?.product?.currency || 'EUR';

  // Check if payments are enabled for this restaurant
  const paymentsEnabled = (restaurant as any)?.payments_enabled && (restaurant as any)?.stripe_charges_enabled;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
    }).format(price);
  };

  // Handle return from Stripe payment
  useEffect(() => {
    const paymentIntent = searchParams.get('payment_intent');
    const redirectStatus = searchParams.get('redirect_status');

    if (paymentIntent && redirectStatus === 'succeeded') {
      clearCart();
      navigate(`/r/${slug}/confirmation`, {
        state: {
          orderDetails: {
            customerName: 'Client',
            items: [],
            totalPrice: 0,
            orderType: 'pickup',
            paid: true,
          },
        },
      });
    }
  }, [searchParams, clearCart, navigate, slug]);

  // Redirect if cart is empty or wrong restaurant
  useEffect(() => {
    if (!isLoading && (items.length === 0 || restaurantSlug !== slug)) {
      navigate(`/r/${slug}`, { replace: true });
    }
  }, [isLoading, items.length, restaurantSlug, slug, navigate]);

  // Show loading while checking
  if (isLoading || items.length === 0) {
    return null;
  }

  // Format French phone number to international format (0612345678 → 33612345678)
  const formatFrenchPhoneNumber = (phone: string): string => {
    let cleaned = phone.replace(/[\s\-\.]/g, '');
    if (cleaned.startsWith('0') && cleaned.length === 10) {
      cleaned = '33' + cleaned.slice(1);
    }
    if (cleaned.startsWith('+33')) {
      cleaned = '33' + cleaned.slice(3);
    }
    if (cleaned.startsWith('+')) {
      cleaned = cleaned.slice(1);
    }
    return cleaned;
  };

  const handleSubmitInfo = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim() || !customerPhone.trim()) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (!restaurant?.user_id) {
      toast.error('Erreur: restaurant introuvable');
      return;
    }

    // If payments enabled, go to payment step
    if (paymentsEnabled) {
      setIsSubmitting(true);
      try {
        // Format order items for Stripe checkout
        const orderItems = items.map((item) => ({
          name: item.product.name,
          qty: item.quantity,
          unit_price: item.product.unit_price,
          line_total: item.product.unit_price * item.quantity,
          product_id: item.product.id,
          category: item.product.category,
        }));

        const response = await fetch(
          'https://dcwfgxbwpecnjbhrhrib.supabase.co/functions/v1/stripe-create-checkout',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              restaurant_slug: slug,
              order_items: orderItems,
              customer_name: customerName.trim(),
              customer_phone: formatFrenchPhoneNumber(customerPhone.trim()),
              order_type: 'web',
              pickup_time: pickupTime ? new Date(`${new Date().toDateString()} ${pickupTime}`).toISOString() : null,
              note: notes.trim() || null,
            }),
          }
        );

        const data = await response.json();

        if (response.ok && data.success) {
          setClientSecret(data.client_secret);
          setOrderId(data.order_id);
          setStep('payment');
        } else {
          toast.error(data.error || 'Erreur lors de la création du paiement');
        }
      } catch (error) {
        console.error('Error creating checkout:', error);
        toast.error('Erreur lors de la création du paiement');
      } finally {
        setIsSubmitting(false);
      }
    } else {
      // No payment - create order directly
      handleSubmitOrder();
    }
  };

  const handleSubmitOrder = async () => {
    setIsSubmitting(true);

    try {
      const commandeItem = items.map((item) => ({
        name: item.product.name,
        qty: item.quantity,
        unit_price: String(item.product.unit_price),
        line_total: String(item.product.unit_price * item.quantity),
        product_id: item.product.id,
      }));

      const { error } = await supabase.from('chatbot_orders').insert({
        user_id: restaurant!.user_id,
        name: customerName.trim(),
        phone: formatFrenchPhoneNumber(customerPhone.trim()),
        commande_item: commandeItem,
        price_total: totalPrice,
        commande_type: 'web',
        status: 'pending',
        horaire_recup: pickupTime ? new Date(`${new Date().toDateString()} ${pickupTime}`).toISOString() : null,
        note: notes.trim() || null,
      });

      if (error) throw error;

      clearCart();
      navigate(`/r/${slug}/confirmation`, {
        state: {
          orderDetails: {
            customerName,
            items,
            totalPrice,
            orderType,
            pickupTime,
          },
        },
      });
    } catch (error) {
      console.error('Error submitting order:', error);
      toast.error('Erreur lors de la commande. Veuillez réessayer.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePaymentSuccess = () => {
    clearCart();
    navigate(`/r/${slug}/confirmation`, {
      state: {
        orderDetails: {
          customerName,
          items,
          totalPrice,
          orderType,
          pickupTime,
          paid: true,
        },
      },
    });
  };

  const handlePaymentError = (error: string) => {
    toast.error(error);
  };

  const buttonStyle = restaurant?.theme_color ? { backgroundColor: restaurant.theme_color } : undefined;

  return (
    <>
      <Helmet>
        <title>Finaliser la commande | {restaurant?.restaurant_name || 'Restaurant'}</title>
        <meta name="robots" content="noindex" />
      </Helmet>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="sticky top-0 bg-background/95 backdrop-blur border-b z-40">
          <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => (step === 'payment' ? setStep('info') : navigate(`/r/${slug}`))}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="font-semibold text-lg">
              {step === 'payment' ? 'Paiement' : 'Finaliser la commande'}
            </h1>
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-4 py-6 space-y-6 pb-32">
          {/* Order Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Résumé de la commande</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {items.map((item) => (
                <div key={item.product.id} className="flex justify-between text-sm">
                  <span>
                    {item.quantity}x {item.product.name}
                  </span>
                  <span className="font-medium">{formatPrice(item.product.unit_price * item.quantity)}</span>
                </div>
              ))}
              <div className="border-t pt-3 flex justify-between font-semibold">
                <span>Total</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
            </CardContent>
          </Card>

          {step === 'info' ? (
            /* Customer Form */
            <form onSubmit={handleSubmitInfo} className="space-y-6">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Vos coordonnées
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom *</Label>
                    <Input
                      id="name"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder="Votre nom"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="06 12 34 56 78"
                      required
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    Mode de retrait
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <RadioGroup
                    value={orderType}
                    onValueChange={(value) => setOrderType(value as 'pickup' | 'delivery')}
                    className="gap-3"
                  >
                    <div className="flex items-center space-x-3 p-3 border rounded-lg">
                      <RadioGroupItem value="pickup" id="pickup" />
                      <Label htmlFor="pickup" className="flex-1 cursor-pointer">
                        À emporter
                      </Label>
                    </div>
                  </RadioGroup>

                  <div className="space-y-2">
                    <Label htmlFor="pickupTime" className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Heure de retrait souhaitée (optionnel)
                    </Label>
                    <Input
                      id="pickupTime"
                      type="time"
                      value={pickupTime}
                      onChange={(e) => setPickupTime(e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Notes (optionnel)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Instructions spéciales, allergies, etc."
                    rows={3}
                  />
                </CardContent>
              </Card>

              {/* Fixed bottom button */}
              <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t">
                <div className="max-w-2xl mx-auto">
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full py-6 text-base font-semibold"
                    style={buttonStyle}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                        Chargement...
                      </>
                    ) : paymentsEnabled ? (
                      <>
                        <CreditCard className="h-5 w-5 mr-2" />
                        Continuer vers le paiement • {formatPrice(totalPrice)}
                      </>
                    ) : (
                      `Confirmer la commande • ${formatPrice(totalPrice)}`
                    )}
                  </Button>
                </div>
              </div>
            </form>
          ) : (
            /* Payment Form */
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  Paiement sécurisé
                </CardTitle>
              </CardHeader>
              <CardContent>
                {clientSecret && (
                  <StripePaymentForm
                    clientSecret={clientSecret}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                    totalPrice={totalPrice}
                    currency={currency}
                    themeColor={restaurant?.theme_color || undefined}
                  />
                )}
              </CardContent>
            </Card>
          )}
        </main>
      </div>
    </>
  );
}
