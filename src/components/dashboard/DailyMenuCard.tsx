import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { X, Plus, UtensilsCrossed } from 'lucide-react';
import { DailyMenuConfig, DailyMenuSchedule, DailyMenuProduct, useRestaurantSettings } from '@/hooks/useRestaurantSettings';
import { useCatalogue, CatalogueItem } from '@/hooks/useCatalogue';
import { TemporaryProductDialog } from './TemporaryProductDialog';
import { Button } from '@/components/ui/button';

interface DailyMenuCardProps {
  userId?: string;
}

const DAYS = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
const SLOTS: Array<'midi' | 'soir'> = ['midi', 'soir'];

const defaultConfig: DailyMenuConfig = {
  menu_label: 'Menu du jour',
  menu_price: 12.90,
  products: [],
  schedules: [],
};

export function DailyMenuCard({ userId }: DailyMenuCardProps) {
  const { settings, isLoading: settingsLoading, updateSettings } = useRestaurantSettings(userId);
  const { items: catalogue } = useCatalogue({ userId });
  const [tempDialogOpen, setTempDialogOpen] = useState(false);
  
  const [enabled, setEnabled] = useState(false);
  const [config, setConfig] = useState<DailyMenuConfig>(defaultConfig);

  // Sync state with settings when loaded
  useEffect(() => {
    if (settings) {
      setEnabled(settings.daily_menu_enabled ?? false);
      setConfig(settings.daily_menu_config ?? defaultConfig);
    }
  }, [settings]);

  const initializeSchedules = () => {
    const schedules: DailyMenuSchedule[] = [];
    const currentSchedules = config?.schedules || [];
    DAYS.forEach((day) => {
      SLOTS.forEach((slot) => {
        const existing = currentSchedules.find(
          (s) => s.day === day && s.slot === slot
        );
        schedules.push(
          existing || {
            day,
            slot,
            start_time: slot === 'midi' ? '11:30' : '18:30',
            end_time: slot === 'midi' ? '14:30' : '22:00',
            enabled: false,
          }
        );
      });
    });
    return schedules;
  };

  const schedules = initializeSchedules();

  const handleScheduleToggle = (day: string, slot: 'midi' | 'soir', checked: boolean) => {
    const newSchedules = schedules.map((s) =>
      s.day === day && s.slot === slot ? { ...s, enabled: checked } : s
    );
    setConfig({ ...config, schedules: newSchedules });
  };

  const handleTimeChange = (
    day: string,
    slot: 'midi' | 'soir',
    field: 'start_time' | 'end_time',
    value: string
  ) => {
    const newSchedules = schedules.map((s) =>
      s.day === day && s.slot === slot ? { ...s, [field]: value } : s
    );
    setConfig({ ...config, schedules: newSchedules });
  };

  const handleProductToggle = (productId: string, checked: boolean) => {
    const products = checked
      ? [...(config.products || []), { product_id: productId, is_temporary: false }]
      : (config.products || []).filter((p) => p.product_id !== productId);
    setConfig({ ...config, products });
  };

  const handleAddTempProduct = (product: DailyMenuProduct) => {
    setConfig({
      ...config,
      products: [...(config.products || []), product],
    });
  };

  const handleRemoveTempProduct = (productId: string) => {
    setConfig({
      ...config,
      products: (config.products || []).filter((p) => p.product_id !== productId),
    });
  };

  const handleSave = () => {
    updateSettings({
      daily_menu_enabled: enabled,
      daily_menu_config: config,
    });
  };

  const getProductName = (productId: string): string => {
    const product = catalogue.find((p: CatalogueItem) => p.id === productId);
    return product?.name || productId;
  };

  return (
    <Card>
      <CardHeader className="px-4 md:px-6">
        <CardTitle className="flex items-center gap-2 text-base md:text-lg">
          <UtensilsCrossed className="w-4 h-4 md:w-5 md:h-5" />
          Menu du jour
        </CardTitle>
        <CardDescription className="text-xs md:text-sm">
          Proposez un menu spécial à des horaires définis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 md:space-y-6 px-4 md:px-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <Label className="text-sm md:text-base">Activer le menu du jour</Label>
            <p className="text-xs md:text-sm text-muted-foreground">
              Le chatbot proposera ce menu aux horaires configurés
            </p>
          </div>
          <Switch checked={enabled} onCheckedChange={setEnabled} />
        </div>

        {enabled && (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="menu-label">Nom du menu</Label>
                <Input
                  id="menu-label"
                  value={config.menu_label || ''}
                  onChange={(e) => setConfig({ ...config, menu_label: e.target.value })}
                  placeholder="Menu du jour"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="menu-price">Prix (€)</Label>
                <Input
                  id="menu-price"
                  type="number"
                  step="0.01"
                  min="0"
                  value={config.menu_price || 0}
                  onChange={(e) =>
                    setConfig({ ...config, menu_price: parseFloat(e.target.value) || 0 })
                  }
                  placeholder="12.90"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label>Horaires d'activation</Label>
              <ScrollArea className="h-[200px] pr-4">
                <div className="space-y-2">
                  {DAYS.map((day) => (
                    <div key={day} className="space-y-2 p-3 border rounded-lg">
                      <div className="font-medium capitalize">{day}</div>
                      {SLOTS.map((slot) => {
                        const schedule = schedules.find((s) => s.day === day && s.slot === slot);
                        if (!schedule) return null;

                        return (
                          <div key={`${day}-${slot}`} className="flex items-center gap-3">
                            <Checkbox
                              checked={schedule.enabled}
                              onCheckedChange={(checked) =>
                                handleScheduleToggle(day, slot, checked as boolean)
                              }
                            />
                            <span className="text-sm min-w-[60px] capitalize">{slot}</span>
                            <Input
                              type="time"
                              value={schedule.start_time}
                              onChange={(e) =>
                                handleTimeChange(day, slot, 'start_time', e.target.value)
                              }
                              className="w-[120px]"
                              disabled={!schedule.enabled}
                            />
                            <span className="text-sm">-</span>
                            <Input
                              type="time"
                              value={schedule.end_time}
                              onChange={(e) =>
                                handleTimeChange(day, slot, 'end_time', e.target.value)
                              }
                              className="w-[120px]"
                              disabled={!schedule.enabled}
                            />
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            <div className="space-y-3">
              <Label>Composition du menu</Label>
              
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Produits du catalogue</span>
                    <Badge variant="secondary">
                      {(config.products || []).filter((p) => !p.is_temporary).length} sélectionnés
                    </Badge>
                  </div>
                  <ScrollArea className="h-[150px] border rounded-lg p-3">
                    <div className="space-y-2">
                      {catalogue.map((item: CatalogueItem) => (
                        <div key={item.id} className="flex items-center gap-2">
                          <Checkbox
                            checked={(config.products || []).some((p) => p.product_id === item.id)}
                            onCheckedChange={(checked) =>
                              handleProductToggle(item.id, checked as boolean)
                            }
                          />
                          <span className="text-sm">{item.name}</span>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </div>

                <Button
                  variant="outline"
                  onClick={() => setTempDialogOpen(true)}
                  className="w-full"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Ajouter un produit temporaire
                </Button>

                {(config.products || []).filter((p) => p.is_temporary).length > 0 && (
                  <div>
                    <span className="text-sm font-medium mb-2 block">Produits spéciaux</span>
                    <div className="space-y-2">
                      {(config.products || [])
                        .filter((p) => p.is_temporary)
                        .map((product) => (
                          <div
                            key={product.product_id}
                            className="flex items-center justify-between p-2 border rounded-lg"
                          >
                            <div className="flex items-center gap-2">
                              <UtensilsCrossed className="w-4 h-4 text-muted-foreground" />
                              <span className="text-sm font-medium">{product.name}</span>
                              <span className="text-sm text-muted-foreground">
                                {product.price?.toFixed(2)}€
                              </span>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveTempProduct(product.product_id)}
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
          </>
        )}

        <Button onClick={handleSave} className="w-full">
          Enregistrer les paramètres
        </Button>
      </CardContent>

      <TemporaryProductDialog
        open={tempDialogOpen}
        onOpenChange={setTempDialogOpen}
        onAdd={handleAddTempProduct}
      />
    </Card>
  );
}
