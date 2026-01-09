import { useState, useEffect } from "react";
import { useAddons, Addon } from "@/hooks/useAddons";
import { useCatalogue } from "@/hooks/useCatalogue";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Plus, Loader2, Trash2, Package, AlertCircle, Pencil } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ConfirmDialog } from "@/components/admin/ConfirmDialog";

interface AddonsManagerProps {
  userId?: string;
}

export function AddonsManager({ userId }: AddonsManagerProps) {
  const { addons, isLoading, hasConfig, saveAddon, isSaving, deleteAddon, isDeleting } = useAddons({ userId });
  const { items: catalogItems } = useCatalogue({ userId });

  const [localAddons, setLocalAddons] = useState<Addon[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingAddon, setEditingAddon] = useState<Addon | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; addon: Addon | null }>({
    open: false,
    addon: null,
  });

  const [formData, setFormData] = useState({
    label: "",
    price: 0,
    applies_to_type: "global" as "product" | "category" | "global",
    applies_to_value: "*",
    selected_products: [] as string[],
    max_per_item: 1,
    is_active: true,
  });

  const [editFormData, setEditFormData] = useState({
    label: "",
    price: 0,
    applies_to_type: "global" as "product" | "category" | "global",
    applies_to_value: "*",
    selected_products: [] as string[],
    max_per_item: 1,
    is_active: true,
  });

  useEffect(() => {
    setLocalAddons(addons);
  }, [addons]);

  const categories = Array.from(new Set(catalogItems.map((item) => item.category)));

  const handleAddAddon = () => {
    const newAddon: Addon = {
      id: crypto.randomUUID(),
      label: formData.label,
      price: formData.price,
      applies_to_type: formData.applies_to_type,
      applies_to_value:
        formData.applies_to_type === "product" ? formData.selected_products.join("|") : formData.applies_to_value,
      max_per_item: formData.max_per_item,
      is_active: formData.is_active,
    };

    setLocalAddons([...localAddons, newAddon]);
    saveAddon(newAddon);
    
    setDialogOpen(false);
    setFormData({
      label: "",
      price: 0,
      applies_to_type: "global",
      applies_to_value: "*",
      selected_products: [],
      max_per_item: 1,
      is_active: true,
    });
  };

  const handleEditAddon = (addon: Addon) => {
    setEditingAddon(addon);
    const productIds = addon.applies_to_type === "product" ? addon.applies_to_value.split("|") : [];
    setEditFormData({
      label: addon.label || '',
      price: addon.price ?? 0,
      applies_to_type: addon.applies_to_type || 'global',
      applies_to_value: addon.applies_to_value || '*',
      selected_products: productIds,
      max_per_item: addon.max_per_item || 1,
      is_active: addon.is_active ?? true,
    });
    setEditDialogOpen(true);
  };

  const handleSaveEdit = () => {
    if (!editingAddon) return;

    const updatedAddon: Addon = {
      ...editingAddon,
      label: editFormData.label,
      price: editFormData.price,
      applies_to_type: editFormData.applies_to_type,
      applies_to_value:
        editFormData.applies_to_type === "product" ? editFormData.selected_products.join("|") : editFormData.applies_to_value,
      max_per_item: editFormData.max_per_item,
      is_active: editFormData.is_active,
    };

    setLocalAddons(prev => prev.map(a => a.id === updatedAddon.id ? updatedAddon : a));
    saveAddon(updatedAddon);
    setEditDialogOpen(false);
    setEditingAddon(null);
  };

  const handleDeleteAddon = (addon: Addon) => {
    setDeleteConfirm({ open: true, addon });
  };

  const confirmDelete = () => {
    if (deleteConfirm.addon) {
      setLocalAddons((prev) => prev.filter((a) => a.id !== deleteConfirm.addon!.id));
      deleteAddon(deleteConfirm.addon);
      setDeleteConfirm({ open: false, addon: null });
    }
  };

  const getAppliesTo = (addon: Addon): string => {
    if (addon.applies_to_type === "global") return "🌍 Tous les produits";
    if (addon.applies_to_type === "category") return `📂 ${addon.applies_to_value}`;
    if (addon.applies_to_type === "product") {
      const productIds = addon.applies_to_value.split("|");
      const productNames = productIds
        .map((id) => {
          const product = catalogItems.find((p) => p.id === id);
          return product ? product.name : id;
        })
        .join(", ");
      return `📦 ${productNames}`;
    }
    return addon.applies_to_value;
  };

  if (!hasConfig) {
    return (
      <Card className="border-dashed">
        <CardContent className="pt-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Suppléments non configurés</AlertTitle>
            <AlertDescription>
              Les suppléments ne sont pas encore disponibles pour votre compte. Veuillez recréer votre catalogue avec la
              nouvelle version pour activer cette fonctionnalité.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (localAddons.length === 0) {
    return (
      <>
        <Card>
          <CardHeader>
            <CardTitle className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <span>Suppléments</span>
              <Button onClick={() => setDialogOpen(true)} className="w-full sm:w-auto">
                <Plus className="mr-2 h-4 w-4" />
                Ajouter
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Alert>
              <Package className="h-4 w-4" />
              <AlertTitle>Aucun supplément défini</AlertTitle>
              <AlertDescription>
                Ajoutez des suppléments pour permettre à vos clients de personnaliser leurs commandes (ex : Fromage +,
                Sauce +, etc.)
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* Dialog d'ajout */}
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent className="w-[95vw] max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Ajouter un supplément</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="addon-label">Nom du supplément *</Label>
                <Input
                  id="addon-label"
                  placeholder="Ex: Fromage +"
                  value={formData.label}
                  onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                />
              </div>

              <div>
                <Label htmlFor="addon-price">Prix (€) *</Label>
                <Input
                  id="addon-price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                />
              </div>

              <div>
                <Label>S'applique à *</Label>
                <Select
                  value={formData.applies_to_type}
                  onValueChange={(value: any) => {
                    setFormData({
                      ...formData,
                      applies_to_type: value,
                      applies_to_value: value === "global" ? "*" : "",
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="global">🌍 Tous les produits</SelectItem>
                    <SelectItem value="category">📂 Une catégorie</SelectItem>
                    <SelectItem value="product">📦 Un ou des produits spécifiques</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {formData.applies_to_type === "category" && (
                <div>
                  <Label>Catégorie</Label>
                  <Select
                    value={formData.applies_to_value}
                    onValueChange={(value) => setFormData({ ...formData, applies_to_value: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir une catégorie" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {formData.applies_to_type === "product" && (
                <div>
                  <Label className="text-base font-semibold">Produits (sélection multiple)</Label>
                  <div className="border-2 border-border rounded-lg p-4 max-h-60 overflow-y-auto space-y-1 bg-muted/30 mt-2">
                    {catalogItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 p-2 rounded-md hover:bg-accent/50 transition-colors"
                      >
                        <Checkbox
                          id={`product-${item.id}`}
                          checked={formData.selected_products.includes(item.id)}
                          onCheckedChange={(checked) => {
                            setFormData((prev) => ({
                              ...prev,
                              selected_products: checked
                                ? [...prev.selected_products, item.id]
                                : prev.selected_products.filter((id) => id !== item.id),
                            }));
                          }}
                          className="h-5 w-5"
                        />
                        <Label
                          htmlFor={`product-${item.id}`}
                          className="cursor-pointer text-sm flex-1 font-medium"
                        >
                          {item.name} - {item.unit_price}€
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="addon-max">Maximum par plat</Label>
                <Input
                  id="addon-max"
                  type="number"
                  min="1"
                  value={formData.max_per_item}
                  onChange={(e) => setFormData({ ...formData, max_per_item: parseInt(e.target.value) || 1 })}
                />
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label>Actif</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Annuler
              </Button>
              <Button
                onClick={handleAddAddon}
                disabled={
                  !formData.label ||
                  formData.price <= 0 ||
                  (formData.applies_to_type === "product" && formData.selected_products.length === 0)
                }
              >
                Ajouter
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  return (
    <>
      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span>Suppléments ({localAddons.length})</span>
            <Button onClick={() => setDialogOpen(true)} className="w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Ajouter
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-2 md:px-6">
          {/* Desktop Table */}
          <div className="hidden xl:block overflow-x-auto w-full">
            <Table className="w-full table-fixed">
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[20%]">Nom</TableHead>
                  <TableHead className="w-[10%]">Prix</TableHead>
                  <TableHead className="w-[35%]">S'applique à</TableHead>
                  <TableHead className="w-[10%]">Max/plat</TableHead>
                  <TableHead className="w-[10%]">Actif</TableHead>
                  <TableHead className="w-[15%] text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {localAddons.map((addon) => (
                  <TableRow key={addon.id}>
                    <TableCell>
                      <span className="font-medium truncate block w-full" title={addon.label}>
                        {addon.label}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-mono">
                        {addon.price ? addon.price.toFixed(2) : '0.00'}€
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm truncate block w-full" title={getAppliesTo(addon)}>
                        {getAppliesTo(addon)}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline">{addon.max_per_item}</Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={addon.is_active ? "default" : "secondary"}>
                        {addon.is_active ? "Actif" : "Inactif"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex gap-1 justify-end">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleEditAddon(addon)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleDeleteAddon(addon)}
                          disabled={isDeleting}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          
          {/* Mobile Cards */}
          <div className="xl:hidden space-y-3">
            {localAddons.map((addon) => (
              <Card key={addon.id} className="p-4 w-full">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium truncate">{addon.label}</span>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant={addon.is_active ? "default" : "secondary"} className="text-xs">
                        {addon.is_active ? "Actif" : "Inactif"}
                      </Badge>
                      <Badge variant="secondary" className="font-mono text-xs">
                        {addon.price ? addon.price.toFixed(2) : '0.00'}€
                      </Badge>
                      <Badge variant="outline" className="text-xs">Max: {addon.max_per_item}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{getAppliesTo(addon)}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleEditAddon(addon)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleDeleteAddon(addon)}
                      disabled={isDeleting}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Dialog d'ajout */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="w-[95vw] max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Ajouter un supplément</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="addon-label">Nom du supplément *</Label>
              <Input
                id="addon-label"
                placeholder="Ex: Fromage +"
                value={formData.label}
                onChange={(e) => setFormData({ ...formData, label: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="addon-price">Prix (€) *</Label>
              <Input
                id="addon-price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div>
              <Label>S'applique à *</Label>
              <Select
                value={formData.applies_to_type}
                onValueChange={(value: any) => {
                  setFormData({
                    ...formData,
                    applies_to_type: value,
                    applies_to_value: value === "global" ? "*" : "",
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="global">🌍 Tous les produits</SelectItem>
                  <SelectItem value="category">📂 Une catégorie</SelectItem>
                  <SelectItem value="product">📦 Un ou des produits spécifiques</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.applies_to_type === "category" && (
              <div>
                <Label>Catégorie</Label>
                <Select
                  value={formData.applies_to_value}
                  onValueChange={(value) => setFormData({ ...formData, applies_to_value: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {formData.applies_to_type === "product" && (
              <div>
                <Label className="text-base font-semibold">Produits (sélection multiple)</Label>
                <div className="border-2 border-border rounded-lg p-4 max-h-60 overflow-y-auto space-y-1 bg-muted/30 mt-2">
                  {catalogItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-2 rounded-md hover:bg-accent/50 transition-colors"
                    >
                      <Checkbox
                        id={`product-${item.id}`}
                        checked={formData.selected_products.includes(item.id)}
                        onCheckedChange={(checked) => {
                          setFormData((prev) => ({
                            ...prev,
                            selected_products: checked
                              ? [...prev.selected_products, item.id]
                              : prev.selected_products.filter((id) => id !== item.id),
                          }));
                        }}
                        className="h-5 w-5"
                      />
                      <Label
                        htmlFor={`product-${item.id}`}
                        className="cursor-pointer text-sm flex-1 font-medium"
                      >
                        {item.name} - {item.unit_price}€
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="addon-max">Maximum par plat</Label>
              <Input
                id="addon-max"
                type="number"
                min="1"
                value={formData.max_per_item}
                onChange={(e) => setFormData({ ...formData, max_per_item: parseInt(e.target.value) || 1 })}
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label>Actif</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleAddAddon}
              disabled={
                !formData.label ||
                formData.price <= 0 ||
                (formData.applies_to_type === "product" && formData.selected_products.length === 0)
              }
            >
              Ajouter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog d'édition */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="w-[95vw] max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier le supplément</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-addon-label">Nom du supplément *</Label>
              <Input
                id="edit-addon-label"
                placeholder="Ex: Fromage +"
                value={editFormData.label}
                onChange={(e) => setEditFormData({ ...editFormData, label: e.target.value })}
              />
            </div>

            <div>
              <Label htmlFor="edit-addon-price">Prix (€) *</Label>
              <Input
                id="edit-addon-price"
                type="number"
                step="0.01"
                min="0"
                value={editFormData.price}
                onChange={(e) => setEditFormData({ ...editFormData, price: parseFloat(e.target.value) || 0 })}
              />
            </div>

            <div>
              <Label>S'applique à *</Label>
              <Select
                value={editFormData.applies_to_type}
                onValueChange={(value: any) => {
                  setEditFormData({
                    ...editFormData,
                    applies_to_type: value,
                    applies_to_value: value === "global" ? "*" : "",
                  });
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="global">🌍 Tous les produits</SelectItem>
                  <SelectItem value="category">📂 Une catégorie</SelectItem>
                  <SelectItem value="product">📦 Un ou des produits spécifiques</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {editFormData.applies_to_type === "category" && (
              <div>
                <Label>Catégorie</Label>
                <Select
                  value={editFormData.applies_to_value}
                  onValueChange={(value) => setEditFormData({ ...editFormData, applies_to_value: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {editFormData.applies_to_type === "product" && (
              <div>
                <Label className="text-base font-semibold">Produits (sélection multiple)</Label>
                <div className="border-2 border-border rounded-lg p-4 max-h-60 overflow-y-auto space-y-1 bg-muted/30 mt-2">
                  {catalogItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 p-2 rounded-md hover:bg-accent/50 transition-colors"
                    >
                      <Checkbox
                        id={`edit-product-${item.id}`}
                        checked={editFormData.selected_products.includes(item.id)}
                        onCheckedChange={(checked) => {
                          setEditFormData((prev) => ({
                            ...prev,
                            selected_products: checked
                              ? [...prev.selected_products, item.id]
                              : prev.selected_products.filter((id) => id !== item.id),
                          }));
                        }}
                        className="h-5 w-5"
                      />
                      <Label
                        htmlFor={`edit-product-${item.id}`}
                        className="cursor-pointer text-sm flex-1 font-medium"
                      >
                        {item.name} - {item.unit_price}€
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div>
              <Label htmlFor="edit-addon-max">Maximum par plat</Label>
              <Input
                id="edit-addon-max"
                type="number"
                min="1"
                value={editFormData.max_per_item}
                onChange={(e) => setEditFormData({ ...editFormData, max_per_item: parseInt(e.target.value) || 1 })}
              />
            </div>

            <div className="flex items-center gap-2">
              <Switch
                checked={editFormData.is_active}
                onCheckedChange={(checked) => setEditFormData({ ...editFormData, is_active: checked })}
              />
              <Label>Actif</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={
                isSaving ||
                !editFormData.label ||
                editFormData.price <= 0 ||
                (editFormData.applies_to_type === "product" && editFormData.selected_products.length === 0)
              }
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sauvegarde...
                </>
              ) : (
                "Enregistrer les modifications"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={deleteConfirm.open}
        onOpenChange={(open) => setDeleteConfirm({ ...deleteConfirm, open })}
        title="Supprimer ce supplément ?"
        description={`Êtes-vous sûr de vouloir supprimer "${deleteConfirm.addon?.label}" ? Cette action est irréversible.`}
        onConfirm={confirmDelete}
      />
    </>
  );
}
