import React, { useState } from 'react';
import { CheckCircle, Plus, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCatalogue } from '@/hooks/useCatalogue';
import { CatalogueCreator } from '@/components/dashboard/CatalogueCreator';

const OnboardingStep4: React.FC = () => {
  const { items: products, isLoading } = useCatalogue();
  const [showCreator, setShowCreator] = useState(false);
  
  const hasProducts = products && products.length > 0;

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground">Votre catalogue</h2>
        <p className="text-muted-foreground mt-2">
          Créez votre carte pour permettre à vos clients de commander.
        </p>
      </div>

      <div className="flex flex-col items-center justify-center py-8">
        {isLoading ? (
          <div className="animate-pulse h-12 w-48 bg-muted rounded-lg" />
        ) : hasProducts ? (
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2 text-green-600">
              <CheckCircle className="h-8 w-8" />
              <span className="text-lg font-medium">Catalogue créé !</span>
            </div>
            <p className="text-muted-foreground">
              {products.length} produit{products.length > 1 ? 's' : ''} dans votre catalogue
            </p>
            <Button variant="outline" onClick={() => setShowCreator(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter d'autres produits
            </Button>
          </div>
        ) : (
          <div className="text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <Upload className="h-10 w-10 text-primary" />
            </div>
            
            <div className="space-y-3">
              <Button onClick={() => setShowCreator(true)} size="lg">
                <Plus className="h-5 w-5 mr-2" />
                Créer mon catalogue
              </Button>
            </div>
            
            <p className="text-sm text-muted-foreground max-w-md">
              Vous pouvez aussi passer cette étape et créer votre catalogue plus tard.
            </p>
          </div>
        )}
      </div>

      <CatalogueCreator 
        open={showCreator} 
        onOpenChange={setShowCreator}
      />
    </div>
  );
};

export default OnboardingStep4;
