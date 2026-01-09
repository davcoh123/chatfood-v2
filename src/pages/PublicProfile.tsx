import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Save, Globe, Eye, ExternalLink, ShoppingCart } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRestaurantSettings } from '@/hooks/useRestaurantSettings';
import { useRestaurantCategories } from '@/hooks/useRestaurantCategories';
import { SlugEditor } from '@/components/dashboard/SlugEditor';
import { CoverImageUploader } from '@/components/dashboard/CoverImageUploader';
import { FeaturedCategoriesSelector } from '@/components/dashboard/FeaturedCategoriesSelector';
import { CategoryOrderManager } from '@/components/dashboard/CategoryOrderManager';

export default function PublicProfile() {
  const { user } = useAuth();
  const { settings, isLoading, updateSettings, isUpdating } = useRestaurantSettings();
  const { data: categories = [] } = useRestaurantCategories(user?.id);
  
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(null);
  const [featuredCategories, setFeaturedCategories] = useState<string[]>([]);
  const [categoryOrder, setCategoryOrder] = useState<string[]>([]);
  const [onlineOrdersEnabled, setOnlineOrdersEnabled] = useState(false);

  useEffect(() => {
    if (settings) {
      setCoverImageUrl(settings.cover_image_url || null);
      setFeaturedCategories(settings.featured_categories || []);
      setCategoryOrder(settings.category_order || []);
      setOnlineOrdersEnabled(settings.online_orders_enabled ?? false);
    }
  }, [settings]);

  const handleSlugSave = (newSlug: string) => {
    updateSettings({ slug: newSlug });
  };

  const handleCoverImageChange = (url: string | null) => {
    setCoverImageUrl(url);
    // Save immediately when image changes
    updateSettings({ cover_image_url: url });
  };

  const handleSaveCustomization = () => {
    updateSettings({
      featured_categories: featuredCategories.length > 0 ? featuredCategories : null,
      category_order: categoryOrder.length > 0 ? categoryOrder : null,
    });
  };

  const hasCustomizationChanges = 
    JSON.stringify(featuredCategories) !== JSON.stringify(settings?.featured_categories || []) || 
    JSON.stringify(categoryOrder) !== JSON.stringify(settings?.category_order || []);

  if (isLoading) {
    return (
      <div className="container mx-auto p-6 max-w-4xl space-y-6">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const publicUrl = settings?.slug ? `https://chatfood.fr/r/${settings.slug}` : null;

  return (
    <div className="container mx-auto p-6 max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Globe className="h-6 w-6 text-primary" />
            Votre Profil Public
          </h1>
          <p className="text-muted-foreground mt-1">
            Personnalisez comment vos clients voient votre restaurant
          </p>
        </div>
        {publicUrl && (
          <Button variant="outline" asChild>
            <a href={publicUrl} target="_blank" rel="noopener noreferrer">
              <Eye className="h-4 w-4 mr-2" />
              Voir ma page
            </a>
          </Button>
        )}
      </div>

      {/* URL Editor Card */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <ExternalLink className="h-5 w-5" />
            URL publique
          </CardTitle>
          <CardDescription>
            L'adresse web que vos clients utilisent pour voir votre menu
          </CardDescription>
        </CardHeader>
        <CardContent>
          {settings?.slug && user?.id && (
            <SlugEditor
              currentSlug={settings.slug}
              userId={user.id}
              onSave={handleSlugSave}
              isSaving={isUpdating}
            />
          )}
        </CardContent>
      </Card>

      {/* Online Orders Toggle Card */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Commandes en ligne
          </CardTitle>
          <CardDescription>
            Permettre aux clients de commander directement depuis votre page publique
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="online-orders" className="font-medium">Activer les commandes en ligne</Label>
              <p className="text-sm text-muted-foreground">
                Les clients pourront ajouter des produits au panier et passer commande
              </p>
            </div>
            <Switch
              id="online-orders"
              checked={onlineOrdersEnabled}
              onCheckedChange={(checked) => {
                setOnlineOrdersEnabled(checked);
                updateSettings({ online_orders_enabled: checked });
              }}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Photo de couverture</CardTitle>
          <CardDescription>
            L'image principale affichée en haut de votre page publique
          </CardDescription>
        </CardHeader>
        <CardContent>
          {user?.id && (
            <CoverImageUploader
              userId={user.id}
              currentImageUrl={coverImageUrl}
              onImageChange={handleCoverImageChange}
              isUpdating={isUpdating}
            />
          )}
        </CardContent>
      </Card>

      {/* Categories Customization Card */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">Personnalisation des catégories</CardTitle>
          <CardDescription>
            Choisissez les catégories mises en avant et leur ordre d'affichage
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Featured Categories */}
          <FeaturedCategoriesSelector
            categories={categories}
            selectedCategories={featuredCategories}
            onSelectionChange={setFeaturedCategories}
          />

          {/* Category Order */}
          <CategoryOrderManager
            categories={categories}
            categoryOrder={categoryOrder}
            onOrderChange={setCategoryOrder}
          />

          {/* Save Button */}
          <div className="flex justify-end pt-4 border-t">
            <Button 
              onClick={handleSaveCustomization}
              disabled={!hasCustomizationChanges || isUpdating}
            >
              <Save className="h-4 w-4 mr-2" />
              {isUpdating ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </div>
        </CardContent>
      </Card>


      {/* Preview Link Section */}
      {publicUrl && (
        <Card className="border-dashed bg-muted/30">
          <CardContent className="py-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-center sm:text-left">
                <p className="font-medium">Votre page publique est prête !</p>
                <p className="text-sm text-muted-foreground font-mono">{publicUrl}</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" asChild>
                  <a href={publicUrl} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Ouvrir
                  </a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
