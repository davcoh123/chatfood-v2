import { useState, useMemo, useEffect } from "react";
import { useCatalogue } from "@/hooks/useCatalogue";
import { useSubscription } from "@/hooks/useSubscription";
import { CatalogueCreator } from "@/components/dashboard/CatalogueCreator";
import { CatalogueExpander } from "@/components/dashboard/CatalogueExpander";
import { AddonsManager } from "@/components/dashboard/AddonsManager";
import { MenusManager } from "@/components/dashboard/MenusManager";
import { IngredientsInput } from "@/components/dashboard/IngredientsInput";
import { AssetUploader } from "@/components/dashboard/AssetUploader";
import { useRestaurantSettings, RestaurantAsset } from "@/hooks/useRestaurantSettings";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Save, Search, Loader2, AlertCircle, UtensilsCrossed, Plus, Trash2, Package, Check, Image, Apple } from "lucide-react";
import { IngredientsManager } from "@/components/dashboard/IngredientsManager";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { toast } from "sonner";
import { ProductSuggestions } from "@/components/dashboard/ProductSuggestions";

interface CataloguePageProps {
  userId: string;
}

export default function CataloguePage({ userId }: CataloguePageProps) {
  const { canAccessAdvancedCatalogue } = useSubscription();
  const { items, isLoading, error, hasConfig, saveItems, isSaving, deleteItem, isDeleting } = useCatalogue({ userId });
  const { settings, updateSettings } = useRestaurantSettings(userId);
  const [searchTerm, setSearchTerm] = useState("");
  const [modifiedItems, setModifiedItems] = useState<Record<string, any>>({});
  const [hasChanges, setHasChanges] = useState(false);
  const [creatorOpen, setCreatorOpen] = useState(false);
  const [expanderOpen, setExpanderOpen] = useState(false);
  const [ingredientsManagerOpen, setIngredientsManagerOpen] = useState(false);
  const [addProductDialog, setAddProductDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [assets, setAssets] = useState<RestaurantAsset[]>([]);
  const [newProduct, setNewProduct] = useState({
    name: "",
    ingredient: [] as string[],
    description: "",
    unit_price: 0,
    currency: "EUR",
    vat_rate: 10,
    is_active: true,
    tags: "",
    allergens: "",
  });

  useEffect(() => {
    if (settings?.assets) {
      setAssets(settings.assets);
    }
  }, [settings?.assets]);

  const handleAssetsChange = (newAssets: RestaurantAsset[]) => {
    setAssets(newAssets);
    updateSettings({ assets: newAssets });
  };

  useEffect(() => {
    if (!isLoading && items.length > 0 && hasChanges) {
      setModifiedItems({});
      setHasChanges(false);
    }
  }, [items, isLoading]);

  const groupedItems = useMemo(() => {
    const filtered = items.filter(
      item => item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
             item.category?.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    return filtered.reduce((acc, item) => {
      const category = item.category || 'Sans catégorie';
      if (!acc[category]) acc[category] = [];
      acc[category].push(item);
      return acc;
    }, {} as Record<string, typeof items>);
  }, [items, searchTerm]);

  const handleItemChange = (id: string, field: string, value: any) => {
    setModifiedItems(prev => ({
      ...prev,
      [id]: { ...prev[id], [field]: value }
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    const updatedItems = items.map(item => ({
      ...item,
      ...(modifiedItems[item.id] || {})
    }));
    await saveItems(updatedItems);
    toast.success("Catalogue sauvegardé");
  };

  const handleDeleteItem = async (id: string) => {
    if (confirm("Supprimer ce produit ?")) {
      await deleteItem(id);
      toast.success("Produit supprimé");
    }
  };

  const handleNewProductSave = async () => {
    if (!newProduct.name || !selectedCategory) {
      toast.error("Nom et catégorie requis");
      return;
    }
    
    const product = {
      ...newProduct,
      category: selectedCategory,
      user_id: userId,
    };
    
    await saveItems([...items, product as any]);
    setAddProductDialog(false);
    setNewProduct({
      name: "",
      ingredient: [],
      description: "",
      unit_price: 0,
      currency: "EUR",
      vat_rate: 10,
      is_active: true,
      tags: "",
      allergens: "",
    });
    toast.success("Produit ajouté");
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-green-600" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Erreur</AlertTitle>
        <AlertDescription>{error.message}</AlertDescription>
      </Alert>
    );
  }

  const categories = [...new Set(items.map(i => i.category).filter(Boolean))];

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Rechercher un produit..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          {hasChanges && (
            <Button onClick={handleSave} disabled={isSaving} className="bg-green-600 hover:bg-green-700">
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
              Sauvegarder
            </Button>
          )}
          
          <Button variant="outline" onClick={() => setAddProductDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Ajouter
          </Button>
          
          {canAccessAdvancedCatalogue && (
            <>
              <Button variant="outline" onClick={() => setCreatorOpen(true)}>
                <UtensilsCrossed className="h-4 w-4 mr-2" />
                Assistant IA
              </Button>
              <Button variant="outline" onClick={() => setExpanderOpen(true)}>
                <Package className="h-4 w-4 mr-2" />
                Enrichir
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Total produits</p>
            <p className="text-2xl font-bold">{items.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Actifs</p>
            <p className="text-2xl font-bold text-green-600">
              {items.filter(i => i.is_active).length}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Catégories</p>
            <p className="text-2xl font-bold">{categories.length}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-gray-500">Prix moyen</p>
            <p className="text-2xl font-bold">
              {items.length > 0 
                ? (items.reduce((sum, i) => sum + (i.unit_price || 0), 0) / items.length).toFixed(2)
                : '0.00'
              }€
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Products by Category */}
      {Object.keys(groupedItems).length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <UtensilsCrossed className="h-12 w-12 text-gray-300 mb-4" />
            <p className="text-gray-500 mb-4">Aucun produit dans votre catalogue</p>
            <Button onClick={() => setAddProductDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Ajouter votre premier produit
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Accordion type="multiple" defaultValue={Object.keys(groupedItems)} className="space-y-4">
          {Object.entries(groupedItems).map(([category, categoryItems]) => (
            <AccordionItem key={category} value={category} className="border rounded-lg bg-white">
              <AccordionTrigger className="px-4 hover:no-underline">
                <div className="flex items-center gap-3">
                  <span className="font-semibold">{category}</span>
                  <Badge variant="secondary">{categoryItems.length}</Badge>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4">
                <div className="space-y-3">
                  {categoryItems.map((item) => {
                    const modified = modifiedItems[item.id] || {};
                    const currentItem = { ...item, ...modified };
                    
                    return (
                      <div key={item.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                        <Switch
                          checked={currentItem.is_active}
                          onCheckedChange={(checked) => handleItemChange(item.id, 'is_active', checked)}
                        />
                        
                        <div className="flex-1 min-w-0">
                          <Input
                            value={currentItem.name}
                            onChange={(e) => handleItemChange(item.id, 'name', e.target.value)}
                            className="font-medium"
                          />
                        </div>
                        
                        <div className="w-24">
                          <Input
                            type="number"
                            step="0.01"
                            value={currentItem.unit_price}
                            onChange={(e) => handleItemChange(item.id, 'unit_price', parseFloat(e.target.value))}
                            className="text-right"
                          />
                        </div>
                        
                        <span className="text-gray-500">€</span>
                        
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteItem(item.id)}
                          disabled={isDeleting}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      )}

      {/* Add Product Dialog */}
      <Dialog open={addProductDialog} onOpenChange={setAddProductDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Ajouter un produit</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Nom</label>
              <Input
                value={newProduct.name}
                onChange={(e) => setNewProduct(p => ({ ...p, name: e.target.value }))}
                placeholder="Nom du produit"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Catégorie</label>
              <Input
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                placeholder="Catégorie"
                list="categories"
              />
              <datalist id="categories">
                {categories.map(c => <option key={c} value={c} />)}
              </datalist>
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea
                value={newProduct.description}
                onChange={(e) => setNewProduct(p => ({ ...p, description: e.target.value }))}
                placeholder="Description"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Prix (€)</label>
              <Input
                type="number"
                step="0.01"
                value={newProduct.unit_price}
                onChange={(e) => setNewProduct(p => ({ ...p, unit_price: parseFloat(e.target.value) }))}
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Actif</label>
              <Switch
                checked={newProduct.is_active}
                onCheckedChange={(checked) => setNewProduct(p => ({ ...p, is_active: checked }))}
              />
            </div>
            <Button onClick={handleNewProductSave} className="w-full bg-green-600 hover:bg-green-700">
              <Check className="h-4 w-4 mr-2" />
              Ajouter
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* AI Creator */}
      {creatorOpen && (
        <CatalogueCreator
          userId={userId}
          onClose={() => setCreatorOpen(false)}
          open={creatorOpen}
        />
      )}

      {/* Expander */}
      {expanderOpen && (
        <CatalogueExpander
          userId={userId}
          onClose={() => setExpanderOpen(false)}
          open={expanderOpen}
        />
      )}

      {/* Ingredients Manager */}
      {ingredientsManagerOpen && (
        <IngredientsManager
          userId={userId}
          onClose={() => setIngredientsManagerOpen(false)}
        />
      )}
    </div>
  );
}
