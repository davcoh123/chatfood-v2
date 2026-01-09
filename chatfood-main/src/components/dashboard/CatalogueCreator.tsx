import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { IngredientsInput } from '@/components/dashboard/IngredientsInput';
import { useCatalogueCreator, type CatalogueCategory, type CatalogueProduct } from '@/hooks/useCatalogueCreator';
import { Plus, Trash2, ArrowLeft, ArrowRight, Check, AlertCircle, Package } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';

interface CatalogueCreatorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId?: string;
}

export function CatalogueCreator({ open, onOpenChange, userId }: CatalogueCreatorProps) {
  const [step, setStep] = useState(1);
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const { categories, setCategories, createCatalogue, isCreating, hasWebhook } = useCatalogueCreator(userId);
  const navigate = useNavigate();

  // Réinitialiser lors de la fermeture
  const handleClose = () => {
    setStep(1);
    setCurrentCategoryIndex(0);
    setCategories([]);
    onOpenChange(false);
  };

  // Étape 1: Gestion des catégories
  const addCategory = () => {
    setCategories([
      ...categories,
      {
        id: crypto.randomUUID(),
        name: '',
        products: [],
      },
    ]);
  };

  const removeCategory = (id: string) => {
    setCategories(categories.filter(cat => cat.id !== id));
  };

  const updateCategory = (id: string, value: string) => {
    setCategories(categories.map(cat =>
      cat.id === id ? { ...cat, name: value } : cat
    ));
  };

  // Étape 2: Gestion des produits
  const currentCategory = categories[currentCategoryIndex];

  const addProduct = () => {
    if (!currentCategory) return;

    const newProduct: CatalogueProduct = {
      id: crypto.randomUUID(),
      name: '',
      ingredient: [],
      description: '',
      unit_price: 0,
      currency: 'EUR',
      vat_rate: 10,
      is_active: true,
      tags: [],
      allergens: [],
    };

    setCategories(categories.map((cat, idx) =>
      idx === currentCategoryIndex
        ? { ...cat, products: [...cat.products, newProduct] }
        : cat
    ));
  };

  const removeProduct = (productId: string) => {
    if (!currentCategory) return;

    setCategories(categories.map((cat, idx) =>
      idx === currentCategoryIndex
        ? { ...cat, products: cat.products.filter(p => p.id !== productId) }
        : cat
    ));
  };

  const updateProduct = (productId: string, field: keyof CatalogueProduct, value: string | number | boolean | string[]) => {
    if (!currentCategory) return;

    setCategories(categories.map((cat, idx) =>
      idx === currentCategoryIndex
        ? {
            ...cat,
            products: cat.products.map(p =>
              p.id === productId ? { ...p, [field]: value } : p
            ),
          }
        : cat
    ));
  };

  // Navigation
  const canGoToStep2 = categories.length > 0 && categories.every(cat => cat.name.trim());
  const canGoToNextCategory = currentCategory && currentCategory.products.length > 0;
  const isLastCategory = currentCategoryIndex === categories.length - 1;

  const handleNextFromStep2 = () => {
    if (isLastCategory) {
      setStep(3); // Aller au récapitulatif
    } else {
      setCurrentCategoryIndex(currentCategoryIndex + 1);
    }
  };

  const handleValidate = async () => {
    createCatalogue(categories, {
      onSuccess: () => {
        handleClose();
        navigate('/catalogue');
      },
    });
  };

  // Statistiques pour le récapitulatif
  const totalProducts = categories.reduce((sum, cat) => sum + cat.products.length, 0);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Créer mon catalogue - Étape {step}/3
          </DialogTitle>
          <DialogDescription>
            {step === 1 && "Définissez vos catégories de produits"}
            {step === 2 && `Ajoutez les produits pour : ${currentCategory?.name || ''}`}
            {step === 3 && "Vérifiez et validez votre catalogue"}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          {/* Étape 1: Catégories */}
          {step === 1 && (
            <div className="space-y-4">
              {categories.map((category) => (
                <div key={category.id} className="p-4 border rounded-lg space-y-3 bg-card">
                  <div className="flex items-start gap-3">
                    <div className="flex-1">
                      <label className="text-sm font-medium">Nom de la catégorie</label>
                      <Input
                        value={category.name}
                        onChange={(e) => updateCategory(category.id, e.target.value)}
                        placeholder="Ex: Entrées & Salades"
                        className="mt-1"
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeCategory(category.id)}
                      className="text-destructive hover:text-destructive mt-6"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}

              <Button onClick={addCategory} variant="outline" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Ajouter une catégorie
              </Button>
            </div>
          )}

          {/* Étape 2: Produits */}
          {step === 2 && currentCategory && (
            <div className="space-y-4">
              <div className="p-3 bg-muted rounded-lg">
                <p className="text-sm font-medium">
                  Catégorie : {currentCategory.name}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {currentCategory.products.length} produit(s) ajouté(s)
                </p>
              </div>

              {currentCategory.products.map((product, idx) => (
                <div key={product.id} className="p-4 border rounded-lg space-y-3 bg-card">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Produit #{idx + 1}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeProduct(product.id)}
                      className="text-destructive hover:text-destructive h-8 w-8"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium">Nom</label>
                      <Input
                        value={product.name}
                        onChange={(e) => updateProduct(product.id, 'name', e.target.value)}
                        placeholder="Ex: Soupe miso"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Ingrédients</label>
                      <IngredientsInput
                        value={product.ingredient}
                        onChange={(ingredients) => updateProduct(product.id, 'ingredient', ingredients)}
                        placeholder="Ajouter des ingrédients..."
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Description</label>
                    <Textarea
                      value={product.description}
                      onChange={(e) => updateProduct(product.id, 'description', e.target.value)}
                      placeholder="Description du produit"
                      className="mt-1"
                      rows={2}
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-sm font-medium">Prix (€)</label>
                      <Input
                        type="number"
                        step="0.01"
                        value={product.unit_price}
                        onChange={(e) => updateProduct(product.id, 'unit_price', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">TVA (%)</label>
                      <Input
                        value={product.vat_rate}
                        onChange={(e) => updateProduct(product.id, 'vat_rate', parseFloat(e.target.value) || 0)}
                        className="mt-1"
                      />
                    </div>
                    <div className="flex items-end">
                      <div className="flex items-center gap-2 pb-2">
                        <Switch
                          checked={product.is_active === true}
                          onCheckedChange={(checked) =>
                            updateProduct(product.id, 'is_active', checked)
                          }
                        />
                        <label className="text-sm font-medium">Actif</label>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium">Tags</label>
                      <IngredientsInput
                        value={product.tags}
                        onChange={(tags) => updateProduct(product.id, 'tags', tags)}
                        placeholder="Ajouter des tags..."
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium">Allergènes</label>
                      <IngredientsInput
                        value={product.allergens}
                        onChange={(allergens) => updateProduct(product.id, 'allergens', allergens)}
                        placeholder="Ajouter des allergènes..."
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <Button onClick={addProduct} variant="outline" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un produit
              </Button>
            </div>
          )}

          {/* Étape 3: Récapitulatif */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg">
                <p className="font-semibold text-lg mb-2">📊 Récapitulatif</p>
                <div className="space-y-1 text-sm">
                  <p>✓ {categories.length} catégorie(s) créée(s)</p>
                  <p>✓ {totalProducts} produit(s) ajouté(s)</p>
                </div>
              </div>

              {categories.map((category) => (
                <div key={category.id} className="p-4 border rounded-lg bg-card">
                  <p className="font-medium mb-2">
                    {category.name} ({category.products.length} produits)
                  </p>
                  <div className="space-y-1">
                    {category.products.map((product) => (
                      <div key={product.id} className="text-sm text-muted-foreground flex items-center justify-between">
                        <span>• {product.name}</span>
                        <span className="font-medium">{product.unit_price}€</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer avec navigation */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex gap-2">
            {step > 1 && (
              <Button
                variant="outline"
                onClick={() => {
                  if (step === 2 && currentCategoryIndex > 0) {
                    setCurrentCategoryIndex(currentCategoryIndex - 1);
                  } else {
                    setStep(step - 1);
                    setCurrentCategoryIndex(0);
                  }
                }}
                disabled={isCreating}
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Retour
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            <Button variant="ghost" onClick={handleClose} disabled={isCreating}>
              Annuler
            </Button>

            {step === 1 && (
              <Button onClick={() => setStep(2)} disabled={!canGoToStep2}>
                Suivant
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}

            {step === 2 && (
              <Button onClick={handleNextFromStep2} disabled={!canGoToNextCategory}>
                {isLastCategory ? 'Récapitulatif' : 'Catégorie suivante'}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            )}

            {step === 3 && (
              <Button onClick={handleValidate} disabled={isCreating}>
                {isCreating ? (
                  'Création en cours...'
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Valider et créer
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
