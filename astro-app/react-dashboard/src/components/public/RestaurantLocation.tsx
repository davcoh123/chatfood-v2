import { MapPin, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface RestaurantLocationProps {
  latitude: number | null;
  longitude: number | null;
  addressStreet: string | null;
  addressPostalCode: string | null;
  addressCity: string | null;
}

export function RestaurantLocation({
  latitude,
  longitude,
  addressStreet,
  addressPostalCode,
  addressCity,
}: RestaurantLocationProps) {
  const fullAddress = [addressStreet, addressPostalCode, addressCity]
    .filter(Boolean)
    .join(', ');

  // If no coordinates and no address, don't render
  if (!latitude && !longitude && !fullAddress) {
    return null;
  }

  const hasCoordinates = latitude !== null && longitude !== null;
  
  // Google Maps URLs
  const googleMapsEmbedUrl = hasCoordinates
    ? `https://www.google.com/maps?q=${latitude},${longitude}&z=16&output=embed`
    : null;
  
  const googleMapsExternalUrl = hasCoordinates
    ? `https://www.google.com/maps?q=${latitude},${longitude}`
    : fullAddress
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress)}`
      : null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Localisation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Embedded Map */}
        {googleMapsEmbedUrl && (
          <div className="relative w-full h-48 rounded-lg overflow-hidden border bg-muted">
            <iframe
              src={googleMapsEmbedUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Localisation du restaurant"
              className="absolute inset-0"
            />
          </div>
        )}

        {/* Address text */}
        {fullAddress && (
          <p className="text-sm text-muted-foreground">{fullAddress}</p>
        )}

        {/* Open in Google Maps button */}
        {googleMapsExternalUrl && (
          <Button variant="outline" size="sm" asChild className="w-full">
            <a href={googleMapsExternalUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-4 w-4 mr-2" />
              Ouvrir dans Google Maps
            </a>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
