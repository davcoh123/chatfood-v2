import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Star, StarOff } from 'lucide-react';
import { useOrderReviews } from '@/hooks/useOrderReviews';
import { useRestaurantSettings } from '@/hooks/useRestaurantSettings';
import { ScrollArea } from '@/components/ui/scroll-area';

interface CustomerReviewsCardProps {
  userId?: string;
}

export function CustomerReviewsCard({ userId }: CustomerReviewsCardProps) {
  const { stats, isLoading: reviewsLoading } = useOrderReviews(userId);
  const { settings, isLoading: settingsLoading, updateSettings } = useRestaurantSettings(userId);
  
  const [enabled, setEnabled] = useState(false);
  const [delayHours, setDelayHours] = useState(2);
  const [message, setMessage] = useState('');

  // Sync state with settings when loaded
  useEffect(() => {
    if (settings) {
      setEnabled(settings.customer_reviews_enabled ?? false);
      setDelayHours(settings.customer_reviews_delay_hours ?? 2);
      setMessage(settings.customer_reviews_message ?? '');
    }
  }, [settings]);

  const handleSave = () => {
    updateSettings({
      customer_reviews_enabled: enabled,
      customer_reviews_delay_hours: delayHours,
      customer_reviews_message: message,
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      i < rating ? (
        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
      ) : (
        <StarOff key={i} className="w-4 h-4 text-muted" />
      )
    ));
  };

  return (
    <Card>
      <CardHeader className="px-4 md:px-6">
        <CardTitle className="flex items-center gap-2 text-base md:text-lg">
          <Star className="w-4 h-4 md:w-5 md:h-5" />
          Collecte d'avis clients
        </CardTitle>
        <CardDescription className="text-xs md:text-sm">
          Collectez automatiquement les avis après les commandes
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label>Activer la collecte d'avis</Label>
            <p className="text-sm text-muted-foreground">
              Le chatbot demandera un avis après chaque commande
            </p>
          </div>
          <Switch checked={enabled} onCheckedChange={setEnabled} />
        </div>

        {enabled && (
          <>
            <div className="space-y-2">
              <Label htmlFor="delay-hours">Délai après commande (heures)</Label>
              <Input
                id="delay-hours"
                type="number"
                min="1"
                max="48"
                value={delayHours}
                onChange={(e) => setDelayHours(parseInt(e.target.value) || 2)}
                className="max-w-[200px]"
              />
              <p className="text-sm text-muted-foreground">
                Le client recevra le message {delayHours}h après sa commande
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="review-message">Message personnalisé</Label>
              <Textarea
                id="review-message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Comment avez-vous trouvé votre commande ?"
                className="min-h-[80px]"
              />
            </div>
          </>
        )}

        {!reviewsLoading && stats.totalReviews > 0 && (
          <div className="space-y-4 pt-4 border-t">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold">Aperçu des avis récents</h4>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold">{stats.averageRating.toFixed(1)}</span>
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span className="text-sm text-muted-foreground">
                  ({stats.totalReviews} avis)
                </span>
              </div>
            </div>

            <ScrollArea className="h-[200px] pr-4">
              <div className="space-y-3">
                {stats.recentReviews.map((review) => (
                  <div
                    key={review.id}
                    className="p-3 rounded-lg border bg-card"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {renderStars(review.rating)}
                      <span className="text-xs text-muted-foreground">
                        {new Date(review.created_at).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    {review.comment && (
                      <p className="text-sm text-muted-foreground italic">
                        "{review.comment}"
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}

        <Button onClick={handleSave} className="w-full">
          Enregistrer les paramètres
        </Button>
      </CardContent>
    </Card>
  );
}
