import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { usePublicRestaurant } from '@/hooks/usePublicRestaurant';
import { RestaurantHeader } from '@/components/public/RestaurantHeader';
import { RestaurantMenu } from '@/components/public/RestaurantMenu';
import { RestaurantHours } from '@/components/public/RestaurantHours';
import { RestaurantReviews } from '@/components/public/RestaurantReviews';
import { RestaurantLocation } from '@/components/public/RestaurantLocation';
import { WhatsAppCTA } from '@/components/public/WhatsAppCTA';
import { FloatingCart } from '@/components/public/FloatingCart';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, MessageCircle, UtensilsCrossed, Info } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useEffect } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      {/* Banner skeleton */}
      <Skeleton className="h-64 w-full" />
      
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Header skeleton */}
        <div className="flex gap-4">
          <Skeleton className="w-24 h-24 rounded-xl" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
        
        {/* Menu skeleton */}
        <Skeleton className="h-12 w-full" />
        <div className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      </div>
    </div>
  );
}

function NotFoundState() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <AlertTriangle className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-foreground mb-2">
          Restaurant introuvable
        </h1>
        <p className="text-muted-foreground">
          Ce restaurant n'existe pas ou n'est plus disponible.
        </p>
      </div>
    </div>
  );
}

export default function RestaurantProfile() {
  const { slug } = useParams<{ slug: string }>();
  const { setRestaurantSlug } = useCart();
  const isMobile = useIsMobile();
  
  const {
    restaurant, 
    products, 
    reviews,
    categories,
    featuredCategories,
    averageRating, 
    reviewCount,
    isOpen, 
    isLoading, 
    notFound 
  } = usePublicRestaurant(slug);

  // Set the restaurant slug for the cart
  useEffect(() => {
    if (slug) {
      setRestaurantSlug(slug);
    }
  }, [slug, setRestaurantSlug]);

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (notFound || !restaurant) {
    return <NotFoundState />;
  }

  const onlineOrdersEnabled = restaurant.online_orders_enabled ?? false;
  const currency = products?.[0]?.currency || 'EUR';

  const pageTitle = restaurant.restaurant_name 
    ? `${restaurant.restaurant_name} - Commander sur WhatsApp | ChatFood`
    : 'Restaurant | ChatFood';
  
  const pageDescription = restaurant.restaurant_name
    ? `Découvrez le menu de ${restaurant.restaurant_name} et commandez facilement via WhatsApp. ${categories.slice(0, 3).join(', ')}.`
    : 'Découvrez notre menu et commandez facilement via WhatsApp.';

  const fullAddress = [
    restaurant.address_street,
    restaurant.address_postal_code,
    restaurant.address_city
  ].filter(Boolean).join(', ');

  const canonicalUrl = `https://chatfood.fr/r/${slug}`;
  
  // Priority for OG image: cover_image_url > banner asset > first asset > default
  const bannerAsset = restaurant.assets?.find(a => 
    a.type === 'banner' || a.description?.toLowerCase().includes('banner') || a.description?.toLowerCase().includes('bannière')
  );
  const ogImageUrl = restaurant.cover_image_url 
    || bannerAsset?.url 
    || restaurant.assets?.[0]?.url 
    || 'https://chatfood.fr/og-default.jpg';

  return (
    <>
      <Helmet>
        {/* Basic meta */}
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <link rel="canonical" href={canonicalUrl} />
        
        {/* Open Graph */}
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="restaurant" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:site_name" content="ChatFood" />
        <meta property="og:locale" content="fr_FR" />
        <meta property="og:image" content={ogImageUrl} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content={`Menu de ${restaurant.restaurant_name || 'restaurant'}`} />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content={ogImageUrl} />
        
        {/* Restaurant specific meta */}
        <meta property="restaurant:menu" content={`${canonicalUrl}#menu`} />
        {restaurant.latitude && <meta property="place:location:latitude" content={String(restaurant.latitude)} />}
        {restaurant.longitude && <meta property="place:location:longitude" content={String(restaurant.longitude)} />}
        
        {/* Structured Data for Restaurant */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Restaurant",
            "name": restaurant.restaurant_name,
            "image": ogImageUrl,
            "url": canonicalUrl,
            "address": fullAddress ? {
              "@type": "PostalAddress",
              "streetAddress": restaurant.address_street,
              "postalCode": restaurant.address_postal_code,
              "addressLocality": restaurant.address_city,
              "addressCountry": "FR"
            } : undefined,
            "geo": restaurant.latitude && restaurant.longitude ? {
              "@type": "GeoCoordinates",
              "latitude": restaurant.latitude,
              "longitude": restaurant.longitude
            } : undefined,
            "aggregateRating": averageRating ? {
              "@type": "AggregateRating",
              "ratingValue": averageRating.toFixed(1),
              "reviewCount": reviewCount
            } : undefined,
            "servesCuisine": categories.slice(0, 5),
            "openingHours": restaurant.opening_hours
              ?.filter(h => h.slot1 || h.slot2)
              ?.map(h => `${h.day.substring(0, 2).toUpperCase()} ${h.slot1 || ''} ${h.slot2 || ''}`.trim())
          })}
        </script>
      </Helmet>

      <div className="min-h-screen bg-background pb-24">
        {/* Header with banner and info */}
        <RestaurantHeader
          restaurant={restaurant}
          averageRating={averageRating}
          reviewCount={reviewCount}
          isOpen={isOpen}
          featuredCategories={featuredCategories}
        />

        {/* Main content */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Mobile: Tabs */}
          <div className="md:hidden">
            <Tabs defaultValue="menu" className="w-full">
              <TabsList className="w-full grid grid-cols-2 mb-4">
                <TabsTrigger value="menu" className="gap-2">
                  <UtensilsCrossed className="h-4 w-4" />
                  Menu
                </TabsTrigger>
                <TabsTrigger value="infos" className="gap-2">
                  <Info className="h-4 w-4" />
                  Infos
                </TabsTrigger>
              </TabsList>

              <TabsContent value="menu" className="mt-0">
                <RestaurantMenu 
                  products={products || []} 
                  categories={categories}
                  currency={currency}
                  showAddToCart={onlineOrdersEnabled}
                  themeColor={restaurant.theme_color}
                  enableInfiniteScroll={true}
                />
              </TabsContent>

              <TabsContent value="infos" className="mt-0 space-y-6">
                <RestaurantHours openingHours={restaurant.opening_hours || []} />
                <RestaurantLocation
                  latitude={restaurant.latitude}
                  longitude={restaurant.longitude}
                  addressStreet={restaurant.address_street}
                  addressPostalCode={restaurant.address_postal_code}
                  addressCity={restaurant.address_city}
                />
                <RestaurantReviews reviews={reviews || []} averageRating={averageRating} />
              </TabsContent>
            </Tabs>
          </div>

          {/* Desktop: 2-column layout */}
          <div className="hidden md:grid md:grid-cols-[1fr_340px] gap-8">
            {/* Left column - Menu */}
            <div>
              <RestaurantMenu 
                products={products || []} 
                categories={categories}
                currency={currency}
                showAddToCart={onlineOrdersEnabled}
                themeColor={restaurant.theme_color}
              />
            </div>

            {/* Right column - Sidebar */}
            <div className="space-y-6">
              {/* WhatsApp CTA button */}
              {restaurant.chatbot_active && (
                <Button
                  variant="outline"
                  className="w-full py-4 text-base font-semibold border-2"
                  style={restaurant.theme_color ? { 
                    borderColor: restaurant.theme_color, 
                    color: restaurant.theme_color 
                  } : undefined}
                  asChild
                >
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(`Bonjour ! Je souhaite passer une commande chez ${restaurant.restaurant_name}.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <MessageCircle className="h-5 w-5 mr-2" />
                    Commander sur WhatsApp
                  </a>
                </Button>
              )}

              <RestaurantHours openingHours={restaurant.opening_hours || []} />
              <RestaurantReviews reviews={reviews || []} averageRating={averageRating} />
              <RestaurantLocation
                latitude={restaurant.latitude}
                longitude={restaurant.longitude}
                addressStreet={restaurant.address_street}
                addressPostalCode={restaurant.address_postal_code}
                addressCity={restaurant.address_city}
              />
            </div>
          </div>
        </div>

        {/* Floating Cart (only when online orders enabled) */}
        {onlineOrdersEnabled && (
          <FloatingCart 
            currency={currency}
            themeColor={restaurant.theme_color}
          />
        )}

      </div>
    </>
  );
}
