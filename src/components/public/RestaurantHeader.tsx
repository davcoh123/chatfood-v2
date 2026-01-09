import { MapPin, Star, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import type { PublicRestaurant } from '@/hooks/usePublicRestaurant';

interface RestaurantHeaderProps {
  restaurant: PublicRestaurant;
  averageRating: number | null;
  reviewCount: number;
  isOpen: boolean | null;
  featuredCategories: string[];
}

export function RestaurantHeader({ 
  restaurant, 
  averageRating, 
  reviewCount, 
  isOpen,
  featuredCategories,
}: RestaurantHeaderProps) {
  // Find banner image from assets
  const bannerAsset = restaurant.assets?.find(a => 
    a.type === 'banner' || a.description?.toLowerCase().includes('banner') || a.description?.toLowerCase().includes('bannière')
  );
  const logoAsset = restaurant.assets?.find(a => 
    a.type === 'logo' || a.description?.toLowerCase().includes('logo')
  );
  
  // Priority: cover_image_url > banner asset > placeholder
  const bannerUrl = restaurant.cover_image_url || bannerAsset?.url || '/placeholder.svg';
  const logoUrl = logoAsset?.url;

  const fullAddress = [
    restaurant.address_street,
    restaurant.address_postal_code,
    restaurant.address_city
  ].filter(Boolean).join(', ');

  return (
    <div className="relative">
      {/* Banner Image */}
      <div className="relative h-48 sm:h-64 md:h-80 overflow-hidden bg-muted">
        <img 
          src={bannerUrl} 
          alt={restaurant.restaurant_name || 'Restaurant'} 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/30 to-transparent" />
      </div>

      {/* Restaurant Info Overlay */}
      <div className="relative px-4 sm:px-6 lg:px-8 -mt-8 sm:-mt-24">
        <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
          {/* Logo */}
          {logoUrl && (
            <div className="w-20 h-20 sm:w-32 sm:h-32 rounded-xl border-4 border-background bg-card shadow-lg overflow-hidden flex-shrink-0">
              <img 
                src={logoUrl} 
                alt="Logo" 
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Info */}
          <div className="flex-1 pb-2 sm:pb-4">
            <h1 className="text-xl sm:text-3xl md:text-4xl font-bold text-foreground">
              {restaurant.restaurant_name || 'Restaurant'}
            </h1>

            <div className="flex flex-wrap items-center gap-2 sm:gap-4 mt-1 sm:mt-2 text-sm sm:text-base text-muted-foreground">
              {/* Rating */}
              {averageRating !== null && (
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  <span className="font-medium text-foreground">{averageRating.toFixed(1)}</span>
                  <span className="hidden sm:inline">({reviewCount} avis)</span>
                </div>
              )}

              {/* Featured Categories - hidden on mobile */}
              {featuredCategories.length > 0 && (
                <span className="hidden sm:inline">•</span>
              )}
              <span className="hidden sm:inline">
                {featuredCategories.map((cat, i) => (
                  <span key={cat}>
                    {cat}
                    {i < featuredCategories.length - 1 && ', '}
                  </span>
                ))}
              </span>

              {/* Open/Closed Status - inline on mobile */}
              {isOpen !== null && (
                <Badge 
                  variant={isOpen ? 'default' : 'secondary'}
                  className="text-xs"
                >
                  <Clock className="h-3 w-3 mr-1" />
                  {isOpen ? 'Ouvert' : 'Fermé'}
                </Badge>
              )}
            </div>

            {/* Address - hidden on mobile */}
            {fullAddress && (
              <div className="hidden sm:flex items-center gap-1.5 mt-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4 flex-shrink-0" />
                <span>{fullAddress}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
