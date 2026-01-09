import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { CreditCard, ExternalLink, CheckCircle, AlertCircle, Clock, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useStripeConnect } from '@/hooks/useStripeConnect';
import { toast } from 'sonner';

export default function PaymentSettings() {
  const [searchParams] = useSearchParams();
  const { status, isLoading, isConnecting, startOnboarding, openDashboard, togglePayments, refetch } = useStripeConnect();

  // Handle return from Stripe onboarding
  useEffect(() => {
    const success = searchParams.get('success');
    const refresh = searchParams.get('refresh');

    if (success === 'true') {
      toast.success('Connexion Stripe réussie !');
      refetch();
    } else if (refresh === 'true') {
      toast.info('Veuillez finaliser votre inscription Stripe');
      refetch();
    }
  }, [searchParams, refetch]);

  const getStatusBadge = () => {
    if (!status?.connected) {
      return <Badge variant="secondary">Non connecté</Badge>;
    }

    switch (status.onboarding_status) {
      case 'complete':
        return <Badge className="bg-green-500 text-white">Actif</Badge>;
      case 'pending_verification':
        return <Badge className="bg-yellow-500 text-white">En vérification</Badge>;
      case 'pending':
        return <Badge className="bg-orange-500 text-white">Onboarding incomplet</Badge>;
      default:
        return <Badge variant="secondary">Non configuré</Badge>;
    }
  };

  const getStatusIcon = () => {
    if (!status?.connected) {
      return <AlertCircle className="h-5 w-5 text-muted-foreground" />;
    }

    switch (status.onboarding_status) {
      case 'complete':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'pending_verification':
        return <Clock className="h-5 w-5 text-yellow-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-orange-500" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const canEnablePayments = status?.connected && status?.charges_enabled;

  return (
    <>
      <Helmet>
        <title>Paiements | ChatFood</title>
      </Helmet>

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Paiements en ligne</h1>
          <p className="text-muted-foreground mt-1">
            Configurez Stripe pour accepter les paiements par carte bancaire
          </p>
        </div>

        {/* Stripe Connection Status */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <CreditCard className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-lg">Compte Stripe</CardTitle>
                  <CardDescription>
                    Connectez votre compte Stripe Express pour recevoir les paiements
                  </CardDescription>
                </div>
              </div>
              {getStatusBadge()}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {!status?.connected ? (
              <>
                <Alert>
                  <CreditCard className="h-4 w-4" />
                  <AlertTitle>Commencez à accepter les paiements</AlertTitle>
                  <AlertDescription>
                    Connectez votre compte Stripe pour recevoir les paiements directement sur votre compte bancaire.
                    La commission plateforme est de {status?.platform_fee_percent || 5}%.
                  </AlertDescription>
                </Alert>
                <Button onClick={startOnboarding} disabled={isConnecting}>
                  {isConnecting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Connexion en cours...
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      Connecter Stripe
                    </>
                  )}
                </Button>
              </>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
                  {getStatusIcon()}
                  <div className="flex-1">
                    <p className="font-medium">
                      {status.onboarding_status === 'complete'
                        ? 'Votre compte Stripe est prêt'
                        : status.onboarding_status === 'pending_verification'
                        ? 'Vérification en cours'
                        : 'Finalisez votre inscription'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {status.charges_enabled
                        ? 'Vous pouvez accepter les paiements'
                        : 'Complétez votre profil pour accepter les paiements'}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2">
                  {status.onboarding_status !== 'complete' && (
                    <Button onClick={startOnboarding} disabled={isConnecting}>
                      {isConnecting ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : null}
                      Continuer l'inscription
                    </Button>
                  )}
                  {status.charges_enabled && (
                    <Button variant="outline" onClick={openDashboard}>
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Tableau de bord Stripe
                    </Button>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Toggle */}
        {status?.connected && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Activer les paiements</CardTitle>
              <CardDescription>
                Activez les paiements en ligne sur votre profil public
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="payments-toggle">Paiements en ligne</Label>
                  <p className="text-sm text-muted-foreground">
                    Les clients pourront payer par carte lors de leur commande
                  </p>
                </div>
                <Switch
                  id="payments-toggle"
                  checked={status.payments_enabled}
                  onCheckedChange={togglePayments}
                  disabled={!canEnablePayments}
                />
              </div>
              {!canEnablePayments && status.connected && (
                <Alert className="mt-4" variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Finalisez votre inscription Stripe pour activer les paiements.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        {/* Info Card */}
        <Card className="bg-muted/50">
          <CardContent className="pt-6">
            <div className="space-y-3 text-sm">
              <h4 className="font-medium">Comment ça fonctionne ?</h4>
              <ul className="space-y-2 text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="font-medium text-foreground">1.</span>
                  Connectez votre compte Stripe (création gratuite)
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-medium text-foreground">2.</span>
                  Activez les paiements sur votre profil public
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-medium text-foreground">3.</span>
                  Les clients paient par carte lors de leur commande
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-medium text-foreground">4.</span>
                  Les fonds sont transférés sur votre compte sous 2-7 jours
                </li>
              </ul>
              <p className="text-muted-foreground pt-2">
                Commission plateforme : <strong>{status?.platform_fee_percent || 5}%</strong> par transaction
                <br />
                + Frais Stripe standards (1.4% + 0.25€ par transaction en Europe)
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
