import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useCatalogueExpander, type CatalogueCategory, type CatalogueProduct } from '@/hooks/useCatalogueExpander';
import { Plus, Trash2, ArrowLeft, ArrowRight, Check, AlertCircle, Package, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { IngredientsInput } from '@/components/dashboard/IngredientsInput';

interface CatalogueExpanderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId?: string;
  existingCategories: string[];
}

export function CatalogueExpander({ open, onOpenChange, userId, existingCategories }: CatalogueExpanderProps) {
  const [step, setStep] = useState(1);
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const { categories, setCategories, addCategories, isAdding } = useCatalogueExpander(userId);

  const handleClose = () => {
    setStep(1);
    setCurrentCategoryIndex(0);
    setCategories([]);
    onOpenChange(false);
  };

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

  const goToStep2 = () => {
    if (categories.length === 0 || categories.some(cat => !cat.name.trim())) {
      alert('Veuillez renseigner toutes les catégories');
      return;
    }
    setStep(2);
    setCurrentCategoryIndex(0);
  };

  const addProduct = (categoryId: string) => {
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

    setCategories(categories.map(cat =>
      cat.id === categoryId
        ? { ...cat, products: [...cat.products, newProduct] }
        : cat
    ));
  };

  const removeProduct = (categoryId: string, productId: string) => {
    setCategories(categories.map(cat =>
      cat.id === categoryId
        ? { ...cat, products: cat.products.filter(p => p.id !== productId) }
        : cat
    ));
  };

  const updateProduct = (categoryId: string, productId: string, field: keyof CatalogueProduct, value: any) => {
    setCategories(categories.map(cat =>
      cat.id === categoryId
        ? {
            ...cat,
            products: cat.products.map(p =>
              p.id === productId ? { ...p, [field]: value } : p
            )
          }
        : cat
    ));
  };

  const goToNextCategory = () => {
    const currentCategory = categories[currentCategoryIndex];
    if (currentCategory.products.length === 0 || currentCategory.products.some(p => !p.name.trim())) {
      alert('Veuillez renseigner au moins un produit avec un nom');
      return;
    }

    if (currentCategoryIndex < categories.length - 1) {
      setCurrentCategoryIndex(currentCategoryIndex + 1);
    } else {
      setStep(3);
    }
  };

  const goToPreviousCategory = () => {
    if (currentCategoryIndex > 0) {
      setCurrentCategoryIndex(currentCategoryIndex - 1);
    }
  };

  const handleValidate = () => {
    addCategories(categories);
    handleClose();
  };

  const currentCategory = categories[currentCategoryIndex];
  const totalProducts = categories.reduce((sum, cat) => sum + cat.products.length, 0);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>Ajouter des catégories et produits</DialogTitle>
          <DialogDescription>
            {step === 1 && 'Ajoutez vos nouvelles catégories'}
            {step === 2 && `Ajoutez les produits de la catégorie "${currentCategory?.name}"`}
            {step === 3 && 'Vérifiez et validez vos ajouts'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-center gap-2 mb-6">
          {[1, 2, 3].map(num => (
            <div key={num} className="flex items-center">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-colors",
                step >= num ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              )}>
                {num}
              </div>
              {num < 3 && <div className={cn(
                "w-16 h-0.5 mx-2",
                step > num ? "bg-primary" : "bg-muted"
              )} />}
            </div>
          ))}
        </div>

        <ScrollArea className="flex-1 pr-4" style={{ maxHeight: 'calc(90vh - 250px)' }}>
          {step === 1 && (
            <div className="space-y-4">
              {existingCategories.length > 0 && (
                <div className="space-y-2 mb-6">
                  <h3 className="font-semibold text-sm text-muted-foreground">
                    Catégories existantes
                  </h3>
                  {existingCategories.map(cat => (
                    <div key={cat} className="p-3 bg-muted/50 rounded-lg text-sm">
                      {cat}
                    </div>
                  ))}
                </div>
              )}

              <div className="space-y-2">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold">Nouvelles catégories</h3>
                  <Button onClick={addCategory} size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Ajouter une catégorie
                  </Button>
                </div>

                {categories.length === 0 && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Commencez par ajouter au moins une catégorie
                    </AlertDescription>
                  </Alert>
                )}

                {categories.map((category) => (
                  <div key={category.id} className="p-4 border rounded-lg space-y-3">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Nom de la catégorie *"
                        value={category.name}
                        onChange={(e) => updateCategory(category.id, e.target.value)}
                        className="flex-1"
                      />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeCategory(category.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 2 && currentCategory && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-semibold">{currentCategory.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    Catégorie {currentCategoryIndex + 1} sur {categories.length}
                  </p>
                </div>
                <Button onClick={() => addProduct(currentCategory.id)} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un produit
                </Button>
              </div>

              {currentCategory.products.length === 0 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Ajoutez au moins un produit pour cette catégorie
                  </AlertDescription>
                </Alert>
              )}

              {currentCategory.products.map((product, idx) => (
                <div key={product.id} className="p-4 border rounded-lg space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-medium text-muted-foreground">Produit #{idx + 1}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => removeProduct(currentCategory.id, product.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>

                  <Input
                    placeholder="Nom du produit *"
                    value={product.name}
                    onChange={(e) => updateProduct(currentCategory.id, product.id, 'name', e.target.value)}
                  />

                  <IngredientsInput
                    value={product.ingredient}
                    onChange={(ingredients) => updateProduct(currentCategory.id, product.id, 'ingredient', ingredients)}
                    placeholder="Ajouter des ingrédients..."
                  />

                  <Textarea
                    placeholder="Description"
                    value={product.description}
                    onChange={(e) => updateProduct(currentCategory.id, product.id, 'description', e.target.value)}
                    rows={2}
                  />

                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      type="number"
                      placeholder="Prix unitaire"
                      value={product.unit_price || ''}
                      onChange={(e) => updateProduct(currentCategory.id, product.id, 'unit_price', parseFloat(e.target.value) || 0)}
                    />
                    <Input
                      type="number"
                      placeholder="TVA (%)"
                      value={product.vat_rate || ''}
                      onChange={(e) => updateProduct(currentCategory.id, product.id, 'vat_rate', parseFloat(e.target.value) || 0)}
                    />
                  </div>

                  <IngredientsInput
                    value={product.tags}
                    onChange={(tags) => updateProduct(currentCategory.id, product.id, 'tags', tags)}
                    placeholder="Ajouter des tags..."
                  />

                  <IngredientsInput
                    value={product.allergens}
                    onChange={(allergens) => updateProduct(currentCategory.id, product.id, 'allergens', allergens)}
                    placeholder="Ajouter des allergènes..."
                  />

                  <div className="flex items-center gap-2">
                    <Switch
                      checked={product.is_active}
                      onCheckedChange={(checked) => updateProduct(currentCategory.id, product.id, 'is_active', checked)}
                    />
                    <span className="text-sm">Produit actif</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <Alert>
                <Package className="h-4 w-4" />
                <AlertDescription>
                  Vous êtes sur le point d'ajouter <strong>{categories.length} catégorie(s)</strong> et <strong>{totalProducts} produit(s)</strong> à votre catalogue.
                </AlertDescription>
              </Alert>

              {categories.map((category) => (
                <div key={category.id} className="space-y-3">
                  <h3 className="font-semibold text-lg">{category.name} ({category.products.length} produits)</h3>
                  <div className="space-y-2">
                    {category.products.map((product) => (
                      <div key={product.id} className="p-3 border rounded-lg">
                        <div className="flex justify-between items-start">
                          <p className="font-medium">{product.name}</p>
                          <div className="text-right">
                            <p className="font-semibold">{product.unit_price.toFixed(2)} {product.currency}</p>
                            <p className="text-xs text-muted-foreground">TVA {product.vat_rate}%</p>
                          </div>
                        </div>
                        {product.description && (
                          <p className="text-sm text-muted-foreground mt-2">{product.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        <div className="flex justify-between pt-4 border-t">
          <Button
            variant="outline"
            onClick={step === 1 ? handleClose : step === 2 ? (currentCategoryIndex > 0 ? goToPreviousCategory : () => setStep(1)) : () => setStep(2)}
            disabled={isAdding}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            {step === 1 ? 'Annuler' : 'Retour'}
          </Button>

          <Button
            onClick={step === 1 ? goToStep2 : step === 2 ? goToNextCategory : handleValidate}
            disabled={isAdding || (step === 1 && categories.length === 0)}
          >
            {isAdding ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Ajout en cours...
              </>
            ) : step === 3 ? (
              <>
                <Check className="h-4 w-4 mr-2" />
                Ajouter au catalogue
              </>
            ) : (
              <>
                Suivant
                <ArrowRight className="h-4 w-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
