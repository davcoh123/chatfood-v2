import { useState, useMemo, useEffect } from "react";
import { useCatalogue } from "@/hooks/useCatalogue";
import { useAuth } from "@/contexts/AuthContext";
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

interface CatalogueProps {
  userId?: string;
}

export default function Catalogue({ userId }: CatalogueProps = {}) {
  const { profile } = useAuth();
  const { canAccessAdvancedCatalogue } = useSubscription();
  const targetUserId = userId || profile?.user_id;
  const { items, isLoading, error, hasConfig, saveItems, isSaving, deleteItem, isDeleting } = useCatalogue({ userId });
  const { settings, updateSettings } = useRestaurantSettings(targetUserId);
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

  // Sync assets from settings
  useEffect(() => {
    if (settings?.assets) {
      setAssets(settings.assets);
    }
  }, [settings?.assets]);

  // Handle assets change
  const handleAssetsChange = (newAssets: RestaurantAsset[]) => {
    setAssets(newAssets);
    updateSettings({ assets: newAssets });
  };
  // Nettoyer les modifications locales après le rechargement du catalogue
  useEffect(() => {
    if (!isLoading && items.length > 0 && hasChanges) {
      setModifiedItems({});
      setHasChanges(false);
    }
  }, [items, isLoading]);

  // Grouper les items par catégorie
  const groupedItems = useMemo(() => {
    const filtered = items.filter(
      (item) =>
        String(item.name || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()) ||
        String(item.description || "")
          .toLowerCase()
          .includes(searchTerm.toLowerCase()),
    );

    return filtered.reduce(
      (acc, item) => {
        if (!acc[item.category]) {
          acc[item.category] = [];
        }
        acc[item.category].push(item);
        return acc;
      },
      {} as Record<string, typeof items>,
    );
  }, [items, searchTerm]);

  // Extraire les catégories existantes
  const existingCategories = Object.keys(groupedItems);

  // Gérer les modifications d'un item
  const handleItemChange = (itemId: string, field: string, value: any) => {
    setModifiedItems((prev) => ({
      ...prev,
      [itemId]: {
        ...items.find((i) => i.id === itemId),
        ...prev[itemId],
        [field]: value,
      },
    }));
    setHasChanges(true);
  };

  // Sauvegarder TOUT le catalogue avec les modifications
  const handleSave = () => {
    // Appliquer toutes les modifications aux items
    const updatedItems = items.map((item) => {
      if (modifiedItems[item.id]) {
        return {
          ...item,
          ...modifiedItems[item.id],
        };
      }
      return item;
    });

    // Envoyer TOUT le catalogue
    saveItems(updatedItems);
  };

  // Annuler les modifications
  const handleCancel = () => {
    setModifiedItems({});
    setHasChanges(false);
  };

  // Obtenir la valeur modifiée ou originale
  const getItemValue = (itemId: string, field: string) => {
    return modifiedItems[itemId]?.[field] ?? items.find((i) => i.id === itemId)?.[field];
  };

  // Générer un ID unique pour un nouveau produit
  const generateProductId = () => {
    return crypto.randomUUID();
  };

  // Ajouter un nouveau produit
  const handleAddProduct = () => {
    if (!newProduct.name.trim()) {
      toast.error("Le nom du produit est obligatoire");
      return;
    }

    const product = {
      id: generateProductId(),
      category: selectedCategory,
      name: newProduct.name,
      ingredient: newProduct.ingredient,
      description: newProduct.description,
      unit_price: newProduct.unit_price,
      currency: newProduct.currency,
      vat_rate: newProduct.vat_rate,
      is_active: newProduct.is_active,
      tags: newProduct.tags ? newProduct.tags.split(",").map((t) => t.trim()) : [],
      allergens: newProduct.allergens ? newProduct.allergens.split(",").map((a) => a.trim()) : [],
    };

    // Ajouter le nouveau produit et envoyer tout le catalogue
    const allItems = [...items, product];
    saveItems(allItems);

    // Réinitialiser le formulaire
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
  };

  // Supprimer un produit
  const handleDeleteProduct = (itemId: string) => {
    const product = items.find((i) => i.id === itemId);
    if (!product) return;

    if (confirm(`Êtes-vous sûr de vouloir supprimer "${product.name}" ?`)) {
      deleteItem(product);
    }
  };

  // Si pas de config Google Sheets, afficher l'interface d'accueil
  if (items.length === 0 && !isLoading) {
    return (
      <div className="container mx-auto p-6">
        {/* Card d'état vide accueillante */}
        <Card className="border-2 border-dashed">
          <CardContent className="p-12">
            <div className="text-center space-y-6 max-w-2xl mx-auto">
              {/* Icône */}
              <div className="flex justify-center">
                <div className="rounded-full bg-primary/10 p-6">
                  <UtensilsCrossed className="h-16 w-16 text-primary" />
                </div>
              </div>

              {/* Titre et description */}
              <div className="space-y-3">
                <h2 className="text-3xl font-bold">Bienvenue dans votre catalogue</h2>
                <p className="text-lg text-muted-foreground">
                  Créez votre catalogue de produits en quelques clics et gérez facilement votre carte de menu, vos prix
                  et vos descriptions.
                </p>
              </div>

              {/* Liste des avantages */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left py-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 font-medium">
                    <Check className="h-5 w-5 text-green-600" />
                    Organisation par catégories
                  </div>
                  <p className="text-sm text-muted-foreground pl-7">Structurez vos entrées, plats, desserts...</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 font-medium">
                    <Check className="h-5 w-5 text-green-600" />
                    Gestion complète
                  </div>
                  <p className="text-sm text-muted-foreground pl-7">Prix, ingrédients, allergènes, descriptions</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 font-medium">
                    <Check className="h-5 w-5 text-green-600" />
                    Synchronisation automatique
                  </div>
                  <p className="text-sm text-muted-foreground pl-7">Vos produits disponibles sur tous vos canaux</p>
                </div>
              </div>

              {/* Bouton principal */}
              <Button size="lg" className="gap-2 text-lg px-8 py-6" onClick={() => setCreatorOpen(true)}>
                <Package className="h-5 w-5" />
                Créer mon premier catalogue
              </Button>

              {/* Note informative */}
              <p className="text-xs text-muted-foreground">💡 La création prend environ 5 minutes</p>
            </div>
          </CardContent>
        </Card>

        {/* Modal de création (contrôlé) */}
        <CatalogueCreator open={creatorOpen} onOpenChange={setCreatorOpen} userId={targetUserId} />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>Impossible de charger le catalogue. Veuillez réessayer plus tard.</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6 pb-24 md:pb-6 min-w-0 overflow-x-hidden">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
            <UtensilsCrossed className="h-6 w-6 md:h-8 md:w-8" />
            Catalogue
          </h1>
          <p className="text-sm md:text-base text-muted-foreground mt-1 md:mt-2">
            Gérez vos produits, suppléments et menus
          </p>
        </div>
      </div>

      {/* Onglets principaux */}
      <Tabs defaultValue="products" className="space-y-4 md:space-y-6 w-full min-w-0">
        <div className="w-full overflow-x-auto pb-2">
          <TabsList className="w-full justify-start md:justify-center h-auto p-1 bg-muted/50">
            <TabsTrigger value="products" className="flex-1 py-2 min-w-[80px]">
              <Package className="h-4 w-4 md:mr-2 shrink-0" />
              <span className="hidden md:inline">Produits</span>
            </TabsTrigger>
            {canAccessAdvancedCatalogue && (
              <TabsTrigger value="suggestions" className="flex-1 py-2 min-w-[80px]">
                <Check className="h-4 w-4 md:mr-2 shrink-0" />
                <span className="hidden md:inline">Suggestions</span>
              </TabsTrigger>
            )}
            <TabsTrigger value="menus" className="flex-1 py-2 min-w-[80px]">
              <UtensilsCrossed className="h-4 w-4 md:mr-2 shrink-0" />
              <span className="hidden md:inline">Menus</span>
            </TabsTrigger>
            <TabsTrigger value="addons" className="flex-1 py-2 min-w-[80px]">
              <Plus className="h-4 w-4 md:mr-2 shrink-0" />
              <span className="hidden md:inline">Suppléments</span>
            </TabsTrigger>
            <TabsTrigger value="images" className="flex-1 py-2 min-w-[80px]">
              <Image className="h-4 w-4 md:mr-2 shrink-0" />
              <span className="hidden md:inline">Images</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* TAB 1 : Produits */}
        <TabsContent value="products" className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3 w-full">
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => setExpanderOpen(true)} className="flex-1 sm:flex-none">
                <Plus className="h-4 w-4 mr-2" />
                <span className="truncate">Ajouter catégorie</span>
              </Button>
              {canAccessAdvancedCatalogue && (
                <Button 
                  variant="outline" 
                  onClick={() => setIngredientsManagerOpen(true)}
                  className="flex-1 sm:flex-none"
                >
                  <Apple className="h-4 w-4 mr-2" />
                  <span className="truncate">Gérer les ingrédients</span>
                </Button>
              )}
            </div>
            <Badge variant="outline" className="text-sm px-3 py-1 whitespace-nowrap shrink-0">
              {items.length} produits
            </Badge>
          </div>

          {/* Gestionnaire d'ingrédients */}
          <IngredientsManager
            open={ingredientsManagerOpen}
            onOpenChange={setIngredientsManagerOpen}
            items={items}
            saveItems={saveItems}
            userId={targetUserId}
          />

          {/* Barre de recherche */}
          <Card>
            <CardContent className="p-4 md:pt-6">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un produit..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Liste des items groupés par catégorie */}
          <Card>
            <CardContent className="p-2 md:pt-6">
              <Accordion type="multiple" className="w-full">
                {Object.entries(groupedItems).map(([category, categoryItems]) => (
                  <AccordionItem key={category} value={category}>
                    <AccordionTrigger className="text-base md:text-lg font-semibold hover:no-underline px-2">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full pr-4 gap-2">
                        <div className="flex items-center gap-2">
                          <span className="truncate">{category}</span>
                          <Badge variant="secondary" className="ml-2">
                            {categoryItems.length}
                          </Badge>
                        </div>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700 w-full sm:w-auto mt-2 sm:mt-0"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCategory(category);
                            setAddProductDialog(true);
                          }}
                        >
                          <Plus className="h-4 w-4 mr-1" />
                          Ajouter
                        </Button>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-4 pt-4 px-1">
                        {categoryItems.map((item) => (
                          <Card key={item.id} className="p-3 md:p-4">
                            <div className="flex justify-end mb-2">
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => handleDeleteProduct(item.id)}
                                className="h-8 w-8 p-0 md:w-auto md:px-3 md:py-2"
                              >
                                <Trash2 className="h-4 w-4 md:mr-2" />
                                <span className="hidden md:inline">Supprimer</span>
                              </Button>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {/* Colonne gauche */}
                              <div className="space-y-3">
                                <div>
                                  <label className="text-sm font-medium">Nom du produit</label>
                                  <Input
                                    value={getItemValue(item.id, "name")}
                                    onChange={(e) => handleItemChange(item.id, "name", e.target.value)}
                                    className="mt-1"
                                  />
                                </div>

                                <div>
                                  <label className="text-sm font-medium">Ingrédients</label>
                                  <IngredientsInput
                                    value={getItemValue(item.id, "ingredient") as string[]}
                                    onChange={(ingredients) => handleItemChange(item.id, "ingredient", ingredients)}
                                    placeholder="Ajouter des ingrédients..."
                                    className="mt-1"
                                  />
                                </div>

                                <div>
                                  <label className="text-sm font-medium">Description</label>
                                  <Textarea
                                    value={getItemValue(item.id, "description")}
                                    onChange={(e) => handleItemChange(item.id, "description", e.target.value)}
                                    className="mt-1"
                                    rows={3}
                                  />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                  <div>
                                    <label className="text-sm font-medium">Prix unitaire (€)</label>
                                    <Input
                                      type="number"
                                      step="0.01"
                                      value={getItemValue(item.id, "unit_price")}
                                      onChange={(e) =>
                                        handleItemChange(item.id, "unit_price", parseFloat(e.target.value) || 0)
                                      }
                                      className="mt-1"
                                    />
                                  </div>

                                  <div>
                                    <label className="text-sm font-medium">TVA (%)</label>
                                    <Input
                                      type="number"
                                      value={getItemValue(item.id, "vat_rate")}
                                      onChange={(e) =>
                                        handleItemChange(item.id, "vat_rate", parseFloat(e.target.value) || 0)
                                      }
                                      className="mt-1"
                                    />
                                  </div>
                                </div>
                              </div>

                              {/* Colonne droite */}
                              <div className="space-y-3">
                                <div>
                                  <label className="text-sm font-medium">Tags</label>
                                  <Input
                                    value={getItemValue(item.id, "tags")}
                                    onChange={(e) => handleItemChange(item.id, "tags", e.target.value)}
                                    className="mt-1"
                                    placeholder="Ex: végétarien, épicé"
                                  />
                                </div>

                                <div>
                                  <label className="text-sm font-medium">Allergènes</label>
                                  <Textarea
                                    value={getItemValue(item.id, "allergens")}
                                    onChange={(e) => handleItemChange(item.id, "allergens", e.target.value)}
                                    className="mt-1"
                                    placeholder="Ex: Gluten, Lactose"
                                    rows={2}
                                  />
                                </div>

                                <div className="flex items-center gap-2 pt-2">
                                  <Switch
                                    checked={getItemValue(item.id, "is_active")}
                                    onCheckedChange={(checked) => handleItemChange(item.id, "is_active", checked)}
                                  />
                                  <span className="text-sm font-medium">Produit actif</span>
                                </div>

                                <div className="text-xs text-muted-foreground space-y-1 pt-2">
                                  <div>ID: {item.id}</div>
                                  <div>Catégorie: {item.category}</div>
                                </div>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>

          {/* Boutons de sauvegarde */}
          {hasChanges && (
            <div className="fixed bottom-0 left-0 right-0 md:bottom-6 md:right-6 md:left-auto flex gap-3 bg-background border-t md:border rounded-none md:rounded-lg p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] md:shadow-lg z-50">
              <Button variant="outline" onClick={handleCancel} disabled={isSaving} className="flex-1 md:flex-none">
                Annuler
              </Button>
              <Button onClick={handleSave} disabled={isSaving} className="gap-2 flex-1 md:flex-none">
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                <span className="hidden md:inline">Sauvegarder les modifications</span>
                <span className="md:hidden">Sauvegarder</span>
              </Button>
            </div>
          )}

          {/* Dialog pour ajouter un produit */}
          <Dialog open={addProductDialog} onOpenChange={setAddProductDialog}>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Ajouter un produit - {selectedCategory}</DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Nom du produit *</label>
                  <Input
                    value={newProduct.name}
                    onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                    placeholder="Ex: Pizza Margherita"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Ingrédients</label>
                  <IngredientsInput
                    value={newProduct.ingredient}
                    onChange={(ingredients) => setNewProduct({ ...newProduct, ingredient: ingredients })}
                    placeholder="Ajouter des ingrédients..."
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    value={newProduct.description}
                    onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                    placeholder="Description du produit"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Prix (€)</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={newProduct.unit_price}
                      onChange={(e) => setNewProduct({ ...newProduct, unit_price: parseFloat(e.target.value) || 0 })}
                    />
                  </div>

                  <div>
                    <label className="text-sm font-medium">TVA (%)</label>
                    <Input
                      type="number"
                      value={newProduct.vat_rate}
                      onChange={(e) => setNewProduct({ ...newProduct, vat_rate: parseFloat(e.target.value) || 0 })}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Tags</label>
                  <Input
                    value={newProduct.tags}
                    onChange={(e) => setNewProduct({ ...newProduct, tags: e.target.value })}
                    placeholder="Ex: végétarien, épicé"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium">Allergènes</label>
                  <Input
                    value={newProduct.allergens}
                    onChange={(e) => setNewProduct({ ...newProduct, allergens: e.target.value })}
                    placeholder="Ex: Gluten, Lactose"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Switch
                    checked={newProduct.is_active}
                    onCheckedChange={(checked) => setNewProduct({ ...newProduct, is_active: checked })}
                  />
                  <span className="text-sm">Produit actif</span>
                </div>
              </div>

              <div className="flex gap-2 justify-end mt-4">
                <Button variant="outline" onClick={() => setAddProductDialog(false)}>
                  Annuler
                </Button>
                <Button onClick={handleAddProduct} disabled={!newProduct.name.trim()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </TabsContent>

        {/* TAB: Suggestions */}
        <TabsContent value="suggestions">
          <ProductSuggestions userId={targetUserId} />
        </TabsContent>

        {/* TAB: Disponibilité */}
        <TabsContent value="availability">
          <Card>
            <CardHeader>
              <CardTitle>Disponibilité des Produits</CardTitle>
              <CardDescription>Activez ou désactivez rapidement vos produits</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher un produit..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <div className="grid gap-2 max-h-[600px] overflow-y-auto">
                  {items
                    .filter((item) => item.name.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <span className="font-medium">{item.name}</span>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-sm ${getItemValue(item.id, "is_active") ? "text-green-600" : "text-muted-foreground"}`}
                          >
                            {getItemValue(item.id, "is_active") ? "Disponible" : "Indisponible"}
                          </span>
                          <Switch
                            checked={getItemValue(item.id, "is_active")}
                            onCheckedChange={(checked) => handleItemChange(item.id, "is_active", checked)}
                          />
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 2 : Images menu */}
        <TabsContent value="images">
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">Images de votre menu</h3>
                  <p className="text-sm text-muted-foreground">
                    Uploadez les images de votre carte pour le chatbot. Vous pouvez indiquer plusieurs catégories dans
                    la même image.
                  </p>
                </div>
                {targetUserId && (
                  <AssetUploader userId={targetUserId} assets={assets} onAssetsChange={handleAssetsChange} />
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* TAB 3 : Suppléments */}
        <TabsContent value="addons">
          <AddonsManager userId={targetUserId} />
        </TabsContent>

        {/* TAB 4 : Menus & Formules */}
        <TabsContent value="menus" className="min-w-0 overflow-hidden overflow-x-hidden">
          <MenusManager userId={targetUserId} catalogItems={items} />
        </TabsContent>
      </Tabs>

      {/* CatalogueExpander pour ajouter des catégories */}
      <CatalogueExpander
        open={expanderOpen}
        onOpenChange={setExpanderOpen}
        userId={targetUserId}
        existingCategories={existingCategories}
      />

      {/* CatalogueCreator pour recréer le catalogue */}
      <CatalogueCreator open={creatorOpen} onOpenChange={setCreatorOpen} userId={targetUserId} />
    </div>
  );
}
