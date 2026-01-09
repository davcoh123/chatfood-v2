import { useState, useEffect, useRef, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle } from 'lucide-react';
import { AddToCartButton } from './AddToCartButton';
import type { PublicProduct } from '@/hooks/usePublicRestaurant';

interface RestaurantMenuProps {
  products: PublicProduct[];
  categories: string[];
  currency?: string;
  showAddToCart?: boolean;
  themeColor?: string | null;
  enableInfiniteScroll?: boolean;
}

export function RestaurantMenu({ 
  products, 
  categories, 
  currency = 'EUR',
  showAddToCart = false,
  themeColor,
  enableInfiniteScroll = false
}: RestaurantMenuProps) {
  const [activeCategory, setActiveCategory] = useState(categories[0] || '');
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const tabsListRef = useRef<HTMLDivElement>(null);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: currency,
    }).format(price);
  };

  const productsByCategory = categories.reduce((acc, category) => {
    acc[category] = products.filter(p => p.category === category);
    return acc;
  }, {} as Record<string, PublicProduct[]>);

  // Scroll to category when tab is clicked
  const handleCategoryClick = useCallback((category: string) => {
    setActiveCategory(category);
    if (enableInfiniteScroll && sectionRefs.current[category]) {
      sectionRefs.current[category]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [enableInfiniteScroll]);

  // Intersection Observer for infinite scroll - auto-update active category
  useEffect(() => {
    if (!enableInfiniteScroll) return;

    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -60% 0px',
      threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const category = entry.target.getAttribute('data-category');
          if (category) {
            setActiveCategory(category);
            // Scroll the active tab into view
            if (tabsListRef.current) {
              const activeTab = tabsListRef.current.querySelector(`[data-state="active"]`);
              activeTab?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
            }
          }
        }
      });
    }, observerOptions);

    // Observe all category sections
    Object.keys(sectionRefs.current).forEach((category) => {
      const ref = sectionRefs.current[category];
      if (ref) {
        observer.observe(ref);
      }
    });

    return () => observer.disconnect();
  }, [enableInfiniteScroll, categories]);

  if (products.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <p>Le menu n'est pas encore disponible.</p>
      </div>
    );
  }

  // Infinite scroll layout - all categories shown, scroll updates active tab
  if (enableInfiniteScroll) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-semibold text-foreground">Menu</h2>
        
        {/* Sticky category tabs */}
        <div className="sticky top-0 z-30 bg-background pb-2 -mx-4 px-4">
          <div 
            ref={tabsListRef}
            className="flex gap-2 overflow-x-auto scrollbar-hide py-2"
          >
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryClick(category)}
                className={`
                  flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors
                  ${activeCategory === category 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }
                `}
                style={activeCategory === category && themeColor ? { backgroundColor: themeColor } : undefined}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* All categories displayed */}
        <div className="space-y-8">
          {categories.map((category) => (
            <div 
              key={category}
              ref={(el) => { sectionRefs.current[category] = el; }}
              data-category={category}
              className="scroll-mt-20"
            >
              <h3 className="text-lg font-semibold text-foreground mb-3 sticky top-14 bg-background py-2 z-20">
                {category}
              </h3>
              <div className="space-y-3">
                {productsByCategory[category]?.map((product) => (
                  <ProductCard 
                    key={product.id}
                    product={product}
                    formatPrice={formatPrice}
                    showAddToCart={showAddToCart}
                    themeColor={themeColor}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Standard tabs layout for desktop
  return (
    <div className="space-y-4">
      <h2 className="text-xl sm:text-2xl font-semibold text-foreground">Menu</h2>
      
      <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
        <TabsList className="w-full flex flex-wrap h-auto gap-1 bg-muted/50 p-1">
          {categories.map((category) => (
            <TabsTrigger 
              key={category} 
              value={category}
              className="flex-1 min-w-fit text-xs sm:text-sm"
            >
              {category}
            </TabsTrigger>
          ))}
        </TabsList>

        {categories.map((category) => (
          <TabsContent key={category} value={category} className="mt-4 space-y-3">
            {productsByCategory[category]?.map((product) => (
              <ProductCard 
                key={product.id}
                product={product}
                formatPrice={formatPrice}
                showAddToCart={showAddToCart}
                themeColor={themeColor}
              />
            ))}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}

// Extracted ProductCard component for reusability
interface ProductCardProps {
  product: PublicProduct;
  formatPrice: (price: number) => string;
  showAddToCart: boolean;
  themeColor?: string | null;
}

function ProductCard({ product, formatPrice, showAddToCart, themeColor }: ProductCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1 min-w-0">
            <h3 className="font-medium text-foreground truncate">
              {product.name}
            </h3>
            
            {product.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                {product.description}
              </p>
            )}

            {/* Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {product.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Allergens */}
            {product.allergens && product.allergens.length > 0 && (
              <div className="flex items-center gap-1 mt-2 text-xs text-amber-600">
                <AlertTriangle className="h-3 w-3" />
                <span>Allergènes: {product.allergens.join(', ')}</span>
              </div>
            )}
          </div>

          <div className="text-right flex-shrink-0 flex flex-col items-end gap-2">
            <span className="font-semibold text-primary text-lg">
              {formatPrice(product.unit_price)}
            </span>
            {showAddToCart && (
              <AddToCartButton product={product} themeColor={themeColor} />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
