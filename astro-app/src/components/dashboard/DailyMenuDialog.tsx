import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Plus, Search, ChevronDown, X, UtensilsCrossed, Clock, Check } from 'lucide-react';
import { DailyMenuProduct, DailyMenuSchedule } from '@/hooks/useRestaurantSettings';
import { TemporaryProductDialog } from './TemporaryProductDialog';
import { cn } from '@/lib/utils';

interface DailyMenuDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: {
    label: string;
    menu_price: string;
    daily_schedules: DailyMenuSchedule[];
    temporary_products: DailyMenuProduct[];
  };
  setFormData: (data: any) => void;
  catalogItems: any[];
  onSave: () => void;
}

const DAYS = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
const DAYS_SHORT: Record<string, string> = {
  lundi: 'Lun',
  mardi: 'Mar',
  mercredi: 'Mer',
  jeudi: 'Jeu',
  vendredi: 'Ven',
  samedi: 'Sam',
  dimanche: 'Dim',
};

export function DailyMenuDialog({
  open,
  onOpenChange,
  formData,
  setFormData,
  catalogItems,
  onSave,
}: DailyMenuDialogProps) {
  const [tempDialogOpen, setTempDialogOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [openCategories, setOpenCategories] = useState<string[]>([]);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [editingSlot, setEditingSlot] = useState<{ day: string; slot: 'midi' | 'soir' } | null>(null);

  // Group products by category
  const productsByCategory = useMemo(() => {
    const grouped: Record<string, any[]> = {};
    catalogItems.forEach((item) => {
      const category = item.category || 'Autres';
      if (!grouped[category]) grouped[category] = [];
      grouped[category].push(item);
    });
    return grouped;
  }, [catalogItems]);

  // Filtered products by search
  const filteredProductsByCategory = useMemo(() => {
    if (!searchQuery.trim()) return productsByCategory;
    
    const query = searchQuery.toLowerCase();
    const filtered: Record<string, any[]> = {};
    
    Object.entries(productsByCategory).forEach(([category, products]) => {
      const matchingProducts = products.filter(
        (p) => p.name.toLowerCase().includes(query) || category.toLowerCase().includes(query)
      );
      if (matchingProducts.length > 0) {
        filtered[category] = matchingProducts;
      }
    });
    
    return filtered;
  }, [productsByCategory, searchQuery]);

  const categories = Object.keys(filteredProductsByCategory);

  // Selected products count
  const selectedCount = (formData.temporary_products || []).filter((p) => !p.is_temporary).length;
  const tempProductsCount = (formData.temporary_products || []).filter((p) => p.is_temporary).length;

  // Handlers
  const handleScheduleToggle = (day: string, slot: 'midi' | 'soir', checked: boolean) => {
    const newSchedules = formData.daily_schedules.map((s) =>
      s.day === day && s.slot === slot ? { ...s, enabled: checked } : s
    );
    setFormData({ ...formData, daily_schedules: newSchedules });
  };

  const handleTimeChange = (day: string, slot: 'midi' | 'soir', field: 'start_time' | 'end_time', value: string) => {
    const newSchedules = formData.daily_schedules.map((s) =>
      s.day === day && s.slot === slot ? { ...s, [field]: value } : s
    );
    setFormData({ ...formData, daily_schedules: newSchedules });
  };

  const handleProductToggle = (productId: string, checked: boolean) => {
    const products = checked
      ? [...(formData.temporary_products || []), { product_id: productId, is_temporary: false }]
      : (formData.temporary_products || []).filter((p) => p.product_id !== productId);
    setFormData({ ...formData, temporary_products: products });
  };

  const handleAddTempProduct = (product: DailyMenuProduct) => {
    setFormData({
      ...formData,
      temporary_products: [...(formData.temporary_products || []), product],
    });
  };

  const handleRemoveTempProduct = (productId: string) => {
    setFormData({
      ...formData,
      temporary_products: (formData.temporary_products || []).filter((p) => p.product_id !== productId),
    });
  };

  const toggleCategory = (category: string) => {
    setOpenCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category]
    );
  };

  const isProductSelected = (productId: string) => {
    return (formData.temporary_products || []).some((p) => p.product_id === productId);
  };

  // Apply same schedule to all days
  const applyToAllDays = (slot: 'midi' | 'soir') => {
    const firstEnabled = formData.daily_schedules.find((s) => s.slot === slot && s.enabled);
    if (!firstEnabled) return;

    const newSchedules = formData.daily_schedules.map((s) =>
      s.slot === slot
        ? { ...s, enabled: true, start_time: firstEnabled.start_time, end_time: firstEnabled.end_time }
        : s
    );
    setFormData({ ...formData, daily_schedules: newSchedules });
  };

  // Get active slots for a day
  const getDayActiveSlots = (day: string) => {
    return formData.daily_schedules.filter((s) => s.day === day && s.enabled);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="w-[95vw] max-w-3xl max-h-[90vh] p-0 flex flex-col overflow-hidden">
          <DialogHeader className="flex-shrink-0 px-4 sm:px-6 pt-4 sm:pt-6 pb-3 sm:pb-4 border-b">
            <DialogTitle className="text-lg sm:text-xl">Configurer le menu du jour</DialogTitle>
            <DialogDescription className="text-sm">
              Définissez les horaires et la composition de votre menu du jour
            </DialogDescription>
          </DialogHeader>

          <ScrollArea className="flex-1 px-4 sm:px-6">
            <div className="space-y-6 py-4">
              {/* Nom et prix - responsive */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="daily-menu-label">Nom du menu</Label>
                  <Input
                    id="daily-menu-label"
                    value={formData.label}
                    onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                    placeholder="Menu du jour"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="daily-menu-price">Prix (€)</Label>
                  <Input
                    id="daily-menu-price"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.menu_price}
                    onChange={(e) => setFormData({ ...formData, menu_price: e.target.value })}
                    placeholder="12.90"
                  />
                </div>
              </div>

              {/* Horaires - version améliorée */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-base font-semibold">Horaires d'activation</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => applyToAllDays('midi')}
                      className="text-xs h-7"
                    >
                      Midi → tous
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => applyToAllDays('soir')}
                      className="text-xs h-7"
                    >
                      Soir → tous
                    </Button>
                  </div>
                </div>

                {/* Mobile: Onglets de jours */}
                <div className="block sm:hidden">
                  <div className="flex gap-1 overflow-x-auto pb-2 mb-3">
                    {DAYS.map((day) => {
                      const activeSlots = getDayActiveSlots(day);
                      return (
                        <Button
                          key={day}
                          type="button"
                          variant={selectedDay === day ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => setSelectedDay(selectedDay === day ? null : day)}
                          className="relative shrink-0 min-w-[50px]"
                        >
                          {DAYS_SHORT[day]}
                          {activeSlots.length > 0 && (
                            <span className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full" />
                          )}
                        </Button>
                      );
                    })}
                  </div>

                  {selectedDay && (
                    <Card>
                      <CardContent className="p-3 space-y-3">
                        <div className="font-medium capitalize flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {selectedDay}
                        </div>
                        {(['midi', 'soir'] as const).map((slot) => {
                          const schedule = formData.daily_schedules.find(
                            (s) => s.day === selectedDay && s.slot === slot
                          );
                          if (!schedule) return null;

                          return (
                            <div key={slot} className="space-y-2 p-3 bg-muted/50 rounded-lg">
                              <div className="flex items-center gap-3">
                                <Checkbox
                                  checked={schedule.enabled}
                                  onCheckedChange={(checked) =>
                                    handleScheduleToggle(selectedDay, slot, checked as boolean)
                                  }
                                />
                                <span className="text-sm font-medium capitalize">{slot}</span>
                              </div>
                              {schedule.enabled && (
                                <div className="flex items-center gap-2 ml-6">
                                  <Input
                                    type="time"
                                    value={schedule.start_time}
                                    onChange={(e) =>
                                      handleTimeChange(selectedDay, slot, 'start_time', e.target.value)
                                    }
                                    className="flex-1"
                                  />
                                  <span className="text-sm text-muted-foreground">à</span>
                                  <Input
                                    type="time"
                                    value={schedule.end_time}
                                    onChange={(e) =>
                                      handleTimeChange(selectedDay, slot, 'end_time', e.target.value)
                                    }
                                    className="flex-1"
                                  />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Desktop: Liste compacte avec popovers pour éditer */}
                <div className="hidden sm:block">
                  <div className="space-y-2">
                    {DAYS.map((day) => {
                      const daySchedules = formData.daily_schedules.filter((s) => s.day === day);
                      const activeSlots = daySchedules.filter((s) => s.enabled);
                      
                      return (
                        <div key={day} className="flex items-center gap-3 p-3 border rounded-lg">
                          <div className="w-24 font-medium capitalize">{day}</div>
                          <div className="flex-1 flex gap-2">
                            {(['midi', 'soir'] as const).map((slot) => {
                              const schedule = daySchedules.find((s) => s.slot === slot);
                              if (!schedule) return null;

                              return (
                                <Popover 
                                  key={slot}
                                  open={editingSlot?.day === day && editingSlot?.slot === slot}
                                  onOpenChange={(open) => {
                                    if (open) {
                                      setEditingSlot({ day, slot });
                                    } else {
                                      setEditingSlot(null);
                                    }
                                  }}
                                >
                                  <PopoverTrigger asChild>
                                    <Button
                                      type="button"
                                      variant={schedule.enabled ? 'default' : 'outline'}
                                      size="sm"
                                      className={cn(
                                        'min-w-[140px] justify-start gap-2',
                                        schedule.enabled && 'bg-primary hover:bg-primary/90'
                                      )}
                                    >
                                      <Checkbox
                                        checked={schedule.enabled}
                                        onCheckedChange={(checked) => {
                                          handleScheduleToggle(day, slot, checked as boolean);
                                        }}
                                        onClick={(e) => e.stopPropagation()}
                                        className={cn(
                                          'border-current',
                                          schedule.enabled && 'border-primary-foreground data-[state=checked]:bg-primary-foreground data-[state=checked]:text-primary'
                                        )}
                                      />
                                      <span className="capitalize">{slot}</span>
                                      {schedule.enabled && (
                                        <span className="text-xs opacity-80">
                                          {schedule.start_time}-{schedule.end_time}
                                        </span>
                                      )}
                                    </Button>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-64 p-3" align="start">
                                    <div className="space-y-3">
                                      <div className="flex items-center justify-between">
                                        <span className="font-medium capitalize">{day} - {slot}</span>
                                        <Checkbox
                                          checked={schedule.enabled}
                                          onCheckedChange={(checked) =>
                                            handleScheduleToggle(day, slot, checked as boolean)
                                          }
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <Label className="text-xs">Horaires</Label>
                                        <div className="flex items-center gap-2">
                                          <Input
                                            type="time"
                                            value={schedule.start_time}
                                            onChange={(e) =>
                                              handleTimeChange(day, slot, 'start_time', e.target.value)
                                            }
                                            className="flex-1"
                                          />
                                          <span className="text-sm text-muted-foreground">à</span>
                                          <Input
                                            type="time"
                                            value={schedule.end_time}
                                            onChange={(e) =>
                                              handleTimeChange(day, slot, 'end_time', e.target.value)
                                            }
                                            className="flex-1"
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  </PopoverContent>
                                </Popover>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Produits - refonte complète */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <Label className="text-base font-semibold">Composition du menu</Label>
                  <div className="flex gap-2">
                    <Badge variant="secondary" className="shrink-0">
                      {selectedCount} produit{selectedCount > 1 ? 's' : ''}
                    </Badge>
                    {tempProductsCount > 0 && (
                      <Badge variant="outline" className="shrink-0">
                        +{tempProductsCount} spécial{tempProductsCount > 1 ? 's' : ''}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Barre de recherche */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher un produit..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9"
                  />
                  {searchQuery && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
                      onClick={() => setSearchQuery('')}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>

                {/* Produits par catégorie */}
                <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
                  {categories.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      Aucun produit trouvé
                    </div>
                  ) : (
                    categories.map((category) => (
                      <Collapsible
                        key={category}
                        open={openCategories.includes(category)}
                        onOpenChange={() => toggleCategory(category)}
                      >
                        <Card className="overflow-hidden">
                          <CollapsibleTrigger className="w-full">
                            <div className="flex items-center justify-between p-3 hover:bg-muted/50 transition-colors">
                              <div className="flex items-center gap-2">
                                <ChevronDown
                                  className={cn(
                                    'w-4 h-4 transition-transform',
                                    openCategories.includes(category) && 'rotate-180'
                                  )}
                                />
                                <span className="font-medium">{category}</span>
                                <Badge variant="outline" className="text-xs">
                                  {filteredProductsByCategory[category].length}
                                </Badge>
                              </div>
                              {/* Count selected in this category */}
                              {(() => {
                                const selectedInCategory = filteredProductsByCategory[category].filter(
                                  (p) => isProductSelected(p.id)
                                ).length;
                                return selectedInCategory > 0 ? (
                                  <Badge className="text-xs">{selectedInCategory} sélectionné{selectedInCategory > 1 ? 's' : ''}</Badge>
                                ) : null;
                              })()}
                            </div>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <div className="border-t p-2 grid grid-cols-1 sm:grid-cols-2 gap-2">
                              {filteredProductsByCategory[category].map((product) => {
                                const selected = isProductSelected(product.id);
                                return (
                                  <div
                                    key={product.id}
                                    onClick={() => handleProductToggle(product.id, !selected)}
                                    className={cn(
                                      'flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all',
                                      selected
                                        ? 'bg-primary/10 border-2 border-primary/50'
                                        : 'bg-muted/30 border-2 border-transparent hover:bg-muted/50'
                                    )}
                                  >
                                    <div
                                      className={cn(
                                        'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors',
                                        selected
                                          ? 'bg-primary border-primary text-primary-foreground'
                                          : 'border-muted-foreground/30'
                                      )}
                                    >
                                      {selected && <Check className="w-3 h-3" />}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="font-medium text-sm truncate">{product.name}</div>
                                      {product.description && (
                                        <div className="text-xs text-muted-foreground truncate">
                                          {product.description}
                                        </div>
                                      )}
                                    </div>
                                    <div className="text-sm font-semibold text-primary shrink-0">
                                      {product.unit_price?.toFixed(2)}€
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </CollapsibleContent>
                        </Card>
                      </Collapsible>
                    ))
                  )}
                </div>

                {/* Ajouter produit temporaire */}
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setTempDialogOpen(true)}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter un produit spécial
                </Button>

                {/* Produits temporaires */}
                {tempProductsCount > 0 && (
                  <div className="space-y-2">
                    <Label className="text-sm">Produits spéciaux</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {(formData.temporary_products || [])
                        .filter((p) => p.is_temporary)
                        .map((product) => (
                          <div
                            key={product.product_id}
                            className="flex items-center justify-between p-3 bg-accent/10 border border-accent/30 rounded-lg"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <UtensilsCrossed className="w-4 h-4 text-accent shrink-0" />
                              <span className="text-sm font-medium truncate">{product.name}</span>
                              <span className="text-sm text-muted-foreground shrink-0">
                                {product.price?.toFixed(2)}€
                              </span>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveTempProduct(product.product_id)}
                              className="h-7 w-7 p-0 shrink-0"
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="flex-shrink-0 px-4 sm:px-6 pb-4 sm:pb-6 pt-3 sm:pt-4 border-t gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Annuler
            </Button>
            <Button type="button" onClick={onSave}>
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <TemporaryProductDialog open={tempDialogOpen} onOpenChange={setTempDialogOpen} onAdd={handleAddTempProduct} />
    </>
  );
}
