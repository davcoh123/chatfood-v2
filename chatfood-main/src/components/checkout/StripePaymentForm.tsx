import { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Loader2, CreditCard } from 'lucide-react';

// Initialize Stripe with publishable key
const stripePromise = loadStripe('pk_live_51RhxL6RqwHXLLDt1GDxNlBsWUmPVPP8a1IxWFSILJV8P9bQBzLi0KqpBZ0lWLGvPYZsJhzRoJv3RqqNB8YvKB2Vy00vJYvBpE2');

interface StripePaymentFormProps {
  clientSecret: string;
  onSuccess: () => void;
  onError: (error: string) => void;
  totalPrice: number;
  currency: string;
  themeColor?: string;
}

function CheckoutForm({ onSuccess, onError, totalPrice, currency, themeColor }: Omit<StripePaymentFormProps, 'clientSecret'>) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
    }).format(price);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.href.replace('/checkout', '/confirmation'),
      },
      redirect: 'if_required',
    });

    if (error) {
      setErrorMessage(error.message || 'Une erreur est survenue');
      onError(error.message || 'Une erreur est survenue');
      setIsProcessing(false);
    } else {
      onSuccess();
    }
  };

  const buttonStyle = themeColor ? { backgroundColor: themeColor } : undefined;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-4 border rounded-lg bg-background">
        <PaymentElement
          options={{
            layout: 'tabs',
          }}
        />
      </div>

      {errorMessage && (
        <div className="p-3 text-sm text-red-600 bg-red-50 rounded-lg">
          {errorMessage}
        </div>
      )}

      <Button
        type="submit"
        size="lg"
        className="w-full py-6 text-base font-semibold"
        style={buttonStyle}
        disabled={!stripe || isProcessing}
      >
        {isProcessing ? (
          <>
            <Loader2 className="h-5 w-5 mr-2 animate-spin" />
            Paiement en cours...
          </>
        ) : (
          <>
            <CreditCard className="h-5 w-5 mr-2" />
            Payer {formatPrice(totalPrice)}
          </>
        )}
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        Paiement sécurisé par Stripe
      </p>
    </form>
  );
}

export function StripePaymentForm(props: StripePaymentFormProps) {
  const { clientSecret } = props;
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (clientSecret) {
      setIsReady(true);
    }
  }, [clientSecret]);

  if (!isReady) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary: props.themeColor || '#10B981',
          },
        },
        locale: 'fr',
      }}
    >
      <CheckoutForm {...props} />
    </Elements>
  );
}
