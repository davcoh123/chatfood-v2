import { useState, useEffect, Dispatch, SetStateAction } from 'react';
import * as React from 'react';
import { useMenus, Menu } from '@/hooks/useMenus';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Loader2, Trash2, UtensilsCrossed, AlertCircle, ChevronDown, Pencil, Calendar } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DailyMenuProduct, DailyMenuSchedule, useRestaurantSettings } from '@/hooks/useRestaurantSettings';
import { DailyMenuDialog } from './DailyMenuDialog';
import { useSubscription } from '@/hooks/useSubscription';

interface MenusManagerProps {
  userId?: string;
  catalogItems: any[];
}

const DAYS_MAP = {
  lun: 'Lundi',
  mar: 'Mardi',
  mer: 'Mercredi',
  jeu: 'Jeudi',
  ven: 'Vendredi',
  sam: 'Samedi',
  dim: 'Dimanche',
};

const formatTime = (time: string) => {
  if (!time) return '';
  const parts = time.split(':');
  return parts.length >= 2 ? `${parts[0]}:${parts[1]}` : time;
};

interface ChoiceData {
  label: string;
  productIds: string[];
}

// For daily menu schedules
const DAYS = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
const SLOTS: Array<'midi' | 'soir'> = ['midi', 'soir'];

interface FormData {
  label: string;
  choices: ChoiceData[];
  menu_price: string;
  days: string[];
  start_time: string;
  end_time: string;
  is_active: boolean;
  // Daily menu specific fields
  is_daily_menu: boolean;
  daily_schedules: DailyMenuSchedule[];
  temporary_products: DailyMenuProduct[];
}

// Convert Menu to FormData for editing
function menuToFormData(menu: Menu): FormData {
  const choices: ChoiceData[] = [];
  
  if (menu.choice1_label || (menu.choice1_productid && menu.choice1_productid.length > 0)) {
    choices.push({ label: menu.choice1_label || '', productIds: menu.choice1_productid || [] });
  }
  if (menu.choice2_label || (menu.choice2_productid && menu.choice2_productid.length > 0)) {
    choices.push({ label: menu.choice2_label || '', productIds: menu.choice2_productid || [] });
  }
  if (menu.choice3_label || (menu.choice3_productid && menu.choice3_productid.length > 0)) {
    choices.push({ label: menu.choice3_label || '', productIds: menu.choice3_productid || [] });
  }
  if (menu.choice4_label || (menu.choice4_productid && menu.choice4_productid.length > 0)) {
    choices.push({ label: menu.choice4_label || '', productIds: menu.choice4_productid || [] });
  }
  
  return {
    label: menu.label || '',
    choices,
    menu_price: (menu.menu_price ?? 0).toString(),
    days: (menu.days || '').split(',').filter(Boolean),
    start_time: menu.start_time || '11:30',
    end_time: menu.end_time || '14:30',
    is_active: menu.is_active ?? true,
    is_daily_menu: false,
    daily_schedules: initDefaultSchedules(),
    temporary_products: [],
  };
}

// Convert FormData to Menu for saving
function formDataToMenu(formData: FormData, existingMenu?: Menu): Menu {
  return {
    id: existingMenu?.id || crypto.randomUUID(),
    label: formData.label.trim(),
    choice1_label: formData.choices[0]?.label || null,
    choice1_productid: formData.choices[0]?.productIds || [],
    choice2_label: formData.choices[1]?.label || null,
    choice2_productid: formData.choices[1]?.productIds || [],
    choice3_label: formData.choices[2]?.label || null,
    choice3_productid: formData.choices[2]?.productIds || [],
    choice4_label: formData.choices[3]?.label || null,
    choice4_productid: formData.choices[3]?.productIds || [],
    menu_price: parseFloat(formData.menu_price) || 0,
    days: formData.days.join(','),
    start_time: formData.start_time,
    end_time: formData.end_time,
    is_active: formData.is_active,
  };
}

// Default empty schedules for daily menu
const initDefaultSchedules = (): DailyMenuSchedule[] => {
  const schedules: DailyMenuSchedule[] = [];
  DAYS.forEach((day) => {
    SLOTS.forEach((slot) => {
      schedules.push({
        day,
        slot,
        start_time: slot === 'midi' ? '11:30' : '18:30',
        end_time: slot === 'midi' ? '14:30' : '22:00',
        enabled: false,
      });
    });
  });
  return schedules;
};

const emptyFormData: FormData = {
  label: '',
  choices: [],
  menu_price: '',
  days: [],
  start_time: '11:30',
  end_time: '14:30',
  is_active: true,
  is_daily_menu: false,
  daily_schedules: initDefaultSchedules(),
  temporary_products: [],
};

export function MenusManager({ userId, catalogItems }: MenusManagerProps) {
  const { menus, isLoading, hasConfig, saveMenu, isSaving, deleteMenu, isDeleting, lookupMenu, isLookingUp } = useMenus({ userId });
  const { settings, updateSettings, isLoading: settingsLoading } = useRestaurantSettings(userId);
  const { canAccessDailyMenu } = useSubscription();
  
  const [localMenus, setLocalMenus] = useState<Menu[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dailyMenuDialogOpen, setDailyMenuDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editingMenu, setEditingMenu] = useState<Menu | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ open: boolean; menu: Menu | null }>({
    open: false,
    menu: null,
  });
  
  
  const [openChoiceIndex, setOpenChoiceIndex] = useState<number | null>(0);
  const [formData, setFormData] = useState<FormData>({ ...emptyFormData });

  const [editOpenChoiceIndex, setEditOpenChoiceIndex] = useState<number | null>(0);
  const [editFormData, setEditFormData] = useState<FormData>({ ...emptyFormData });
  
  // Daily menu state
  const [dailyMenuEnabled, setDailyMenuEnabled] = useState(false);
  const [dailyMenuFormData, setDailyMenuFormData] = useState<FormData>({ 
    ...emptyFormData, 
    is_daily_menu: true,
    label: 'Menu du jour',
  });

  useEffect(() => {
    setLocalMenus(menus);
  }, [menus]);
  
  // Sync daily menu from settings
  useEffect(() => {
    if (settings) {
      setDailyMenuEnabled(settings.daily_menu_enabled ?? false);
      if (settings.daily_menu_config) {
        const config = settings.daily_menu_config;
        setDailyMenuFormData(prev => ({
          ...prev,
          label: config.menu_label || 'Menu du jour',
          menu_price: (config.menu_price ?? 0).toString(),
          daily_schedules: config.schedules || initDefaultSchedules(),
          temporary_products: config.products || [],
          is_daily_menu: true,
        }));
      }
    }
  }, [settings]);

  const handleAddMenu = () => {
    const newMenu = formDataToMenu(formData);
    setLocalMenus([...localMenus, newMenu]);
    saveMenu(newMenu);
    setDialogOpen(false);
    setFormData({ ...emptyFormData });
  };

  const handleEditMenu = async (menu: Menu) => {
    setEditingMenu(menu);
    
    try {
      const menuDetails = await lookupMenu(menu.id!);
      setEditFormData(menuToFormData(menuDetails));
      setEditOpenChoiceIndex(0);
      setEditDialogOpen(true);
    } catch (error) {
      console.error('Erreur lookup menu:', error);
    }
  };

  const handleSaveEdit = () => {
    if (!editingMenu) return;

    const updatedMenu = formDataToMenu(editFormData, editingMenu);
    setLocalMenus(prev => prev.map(m => m.id === updatedMenu.id ? updatedMenu : m));
    saveMenu(updatedMenu);
    setEditDialogOpen(false);
    setEditingMenu(null);
  };

  const handleDeleteMenu = (menu: Menu) => {
    setDeleteConfirm({ open: true, menu });
  };

  const confirmDelete = () => {
    if (deleteConfirm.menu) {
      setLocalMenus((prev) => prev.filter((m) => m.id !== deleteConfirm.menu!.id));
      deleteMenu(deleteConfirm.menu);
      setDeleteConfirm({ open: false, menu: null });
    }
  };


  const handleSaveDailyMenu = () => {
    updateSettings({
      daily_menu_enabled: dailyMenuEnabled,
      daily_menu_config: {
        menu_label: dailyMenuFormData.label,
        menu_price: parseFloat(dailyMenuFormData.menu_price) || 0,
        schedules: dailyMenuFormData.daily_schedules,
        products: dailyMenuFormData.temporary_products,
      },
    });
    setDailyMenuDialogOpen(false);
  };

  const formatDays = (daysString: string): string => {
    if (!daysString) return '';
    const days = daysString.split(',');
    return days.map(d => DAYS_MAP[d as keyof typeof DAYS_MAP] || d).join(', ');
  };

  const toggleDay = (day: string, isEdit: boolean = false) => {
    if (isEdit) {
      setEditFormData(prev => ({
        ...prev,
        days: prev.days.includes(day)
          ? prev.days.filter(d => d !== day)
          : [...prev.days, day],
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        days: prev.days.includes(day)
          ? prev.days.filter(d => d !== day)
          : [...prev.days, day],
      }));
    }
  };

  const renderMenuForm = (
    data: FormData, 
    setData: Dispatch<SetStateAction<FormData>>, 
    choiceIndex: number | null, 
    setChoiceIndex: Dispatch<SetStateAction<number | null>>,
    isEdit: boolean = false
  ) => (
    <div className="space-y-4 pb-4">
      <div>
        <Label htmlFor="menu-label">Nom du menu / formule *</Label>
        <Input
          id="menu-label"
          placeholder="Ex: Menu du midi, Formule Burger..."
          value={data.label}
          onChange={(e) => setData({ ...data, label: e.target.value })}
        />
      </div>

      <div>
        <Label htmlFor="menu-price">Prix du menu *</Label>
        <Input
          id="menu-price"
          type="number"
          step="0.01"
          min="0"
          placeholder="12.00"
          value={data.menu_price}
          onChange={(e) => setData({ ...data, menu_price: e.target.value })}
        />
      </div>

      <div>
        <Label>Composition du menu *</Label>
        <p className="text-sm text-muted-foreground mb-3">
          Créez jusqu'à 4 groupes de choix pour votre menu (ex: Pizza + Boisson + Dessert)
        </p>
        
        <div className="space-y-3">
          {data.choices.map((choice, idx) => (
            <Collapsible 
              key={idx}
              open={choiceIndex === idx}
              onOpenChange={(isOpen) => {
                if (isOpen) {
                  setChoiceIndex(idx);
                }
              }}
            >
              <Card className={`border-2 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden ${
                choiceIndex === idx ? 'border-primary' : 'border-primary/20'
              }`}>
                <CardContent className="p-3 sm:p-4 space-y-3 overflow-hidden">
                  <CollapsibleTrigger className="w-full">
                    <div className="flex items-center gap-2 w-full overflow-hidden">
                      <Badge variant="outline" className="shrink-0">Choix {idx + 1}</Badge>
                      <div className="flex-1 text-left min-w-0 overflow-hidden">
                        {choice.label ? (
                          <span className="text-sm font-medium">
                            {choice.label}
                            {choice.productIds.length > 0 && (
                              <span className="text-muted-foreground ml-2">
                                ({choice.productIds.length} produit{choice.productIds.length > 1 ? 's' : ''})
                              </span>
                            )}
                          </span>
                        ) : (
                          <span className="text-sm text-muted-foreground">Sans titre</span>
                        )}
                      </div>
                      <ChevronDown className={`h-4 w-4 transition-transform duration-500 ease-[cubic-bezier(0.4,0,0.2,1)] ${
                        choiceIndex === idx ? 'rotate-180' : ''
                      }`} />
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          const newChoices = data.choices.filter((_, i) => i !== idx);
                          setData({ ...data, choices: newChoices });
                          if (choiceIndex === idx) {
                            setChoiceIndex(newChoices.length > 0 ? 0 : null);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </CollapsibleTrigger>

                  <CollapsibleContent className="overflow-hidden transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]">
                    <div className="space-y-3 pt-3">
                      <Input
                        placeholder="Ex: Pizza au choix, Boisson au choix..."
                        value={choice.label}
                        onChange={(e) => {
                          const newChoices = [...data.choices];
                          newChoices[idx].label = e.target.value;
                          setData({ ...data, choices: newChoices });
                        }}
                      />

                      <ScrollArea className="h-64">
                        <div className="space-y-2 pr-4">
                          {catalogItems.length > 0 ? (
                            catalogItems.map(item => (
                              <Card key={item.id} className="border-2 hover:border-primary/50 transition-colors cursor-pointer overflow-hidden">
                                <CardContent className="p-3">
                                  <div className="flex items-center gap-2 sm:gap-3 w-full overflow-hidden">
                                    <Checkbox
                                      id={`choice-${idx}-${item.id}`}
                                      checked={choice.productIds.includes(item.id)}
                                      onCheckedChange={() => {
                                        const newChoices = [...data.choices];
                                        const currentIds = newChoices[idx].productIds;
                                        newChoices[idx].productIds = currentIds.includes(item.id)
                                          ? currentIds.filter(id => id !== item.id)
                                          : [...currentIds, item.id];
                                        setData({ ...data, choices: newChoices });
                                      }}
                                      className="shrink-0"
                                    />
                                    <Label htmlFor={`choice-${idx}-${item.id}`} className="cursor-pointer flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-2 overflow-hidden">
                                      <span className="font-medium truncate min-w-0">{item.name}</span>
                                      <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                                        <Badge variant="secondary" className="font-mono text-xs">{item.unit_price}€</Badge>
                                        <Badge variant="outline" className="text-xs truncate max-w-[80px] sm:max-w-[100px]">{item.category}</Badge>
                                      </div>
                                    </Label>
                                  </div>
                                </CardContent>
                              </Card>
                            ))
                          ) : (
                            <p className="text-sm text-muted-foreground text-center py-4">Aucun produit disponible</p>
                          )}
                        </div>
                      </ScrollArea>
                    </div>
                  </CollapsibleContent>
                </CardContent>
              </Card>
            </Collapsible>
          ))}
        </div>

        {data.choices.length < 4 && (
          <Button
            variant="outline"
            className="w-full border-dashed border-2 mt-3"
            onClick={() => {
              const newIndex = data.choices.length;
              setData({
                ...data,
                choices: [...data.choices, { label: '', productIds: [] }]
              });
              setChoiceIndex(newIndex);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Ajouter un choix ({data.choices.length}/4)
          </Button>
        )}
      </div>

      <div className="w-full overflow-hidden">
        <Label className="mb-3 block">Jours de disponibilité *</Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 w-full">
          {Object.entries(DAYS_MAP).map(([key, label]) => (
            <Card 
              key={key} 
              className={`border-2 cursor-pointer transition-all min-w-0 ${
                data.days.includes(key) 
                  ? 'border-primary bg-primary/10' 
                  : 'border-border hover:border-primary/50'
              }`}
              onClick={() => toggleDay(key, isEdit)}
            >
              <CardContent className="p-2 sm:p-3 flex items-center gap-2">
                <Checkbox
                  id={`day-${key}`}
                  checked={data.days.includes(key)}
                  onCheckedChange={() => toggleDay(key, isEdit)}
                  className="shrink-0"
                />
                <Label htmlFor={`day-${key}`} className="cursor-pointer flex-1 font-medium text-xs sm:text-sm truncate min-w-0">
                  {label}
                </Label>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="start-time">Heure de début *</Label>
          <Input
            id="start-time"
            type="time"
            value={data.start_time}
            onChange={(e) => setData({ ...data, start_time: e.target.value })}
          />
        </div>
        <div>
          <Label htmlFor="end-time">Heure de fin *</Label>
          <Input
            id="end-time"
            type="time"
            value={data.end_time}
            onChange={(e) => setData({ ...data, end_time: e.target.value })}
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Switch
          checked={data.is_active}
          onCheckedChange={(checked) => setData({ ...data, is_active: checked })}
        />
        <Label>Menu actif</Label>
      </div>
    </div>
  );

  const isFormValid = (data: FormData) => {
    return data.label &&
      data.choices.length > 0 &&
      data.choices.every(c => c.label && c.productIds.length > 0) &&
      data.menu_price &&
      data.days.length > 0;
  };

  if (!hasConfig) {
    return (
      <Card className="border-dashed">
        <CardContent className="pt-6">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Menus non configurés</AlertTitle>
            <AlertDescription>
              Les menus ne sont pas encore disponibles pour votre compte. 
              Veuillez recréer votre catalogue avec la nouvelle version pour activer cette fonctionnalité.
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

  return (
    <div className="space-y-6">
      {/* Section Menu du Jour - Pro & Premium only */}
      {canAccessDailyMenu && (
        <Card>
          <CardHeader className="px-4 md:px-6">
            <CardTitle className="flex items-center gap-2 text-base md:text-lg">
              <Calendar className="w-4 h-4 md:w-5 md:h-5" />
              Menu du jour
            </CardTitle>
            <CardDescription className="text-xs md:text-sm">
              Proposez un menu spécial à des horaires définis
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 px-4 md:px-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <Label className="text-sm md:text-base">Activer le menu du jour</Label>
                <p className="text-xs md:text-sm text-muted-foreground">
                  Le chatbot proposera ce menu aux horaires configurés
                </p>
              </div>
              <Switch 
                checked={dailyMenuEnabled} 
                onCheckedChange={(checked) => {
                  setDailyMenuEnabled(checked);
                  updateSettings({ daily_menu_enabled: checked });
                }} 
              />
            </div>

            {dailyMenuEnabled && (
              <div className="pt-2 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{dailyMenuFormData.label}</p>
                    <p className="text-sm text-muted-foreground">
                      {parseFloat(dailyMenuFormData.menu_price || '0').toFixed(2)}€ • {dailyMenuFormData.daily_schedules.filter(s => s.enabled).length} créneaux actifs
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setDailyMenuDialogOpen(true)}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Configurer
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Section Menus & Formules */}
      <Card className="w-full max-w-full min-w-0 overflow-hidden">
        <CardHeader className="px-4 md:px-6 min-w-0">
          <CardTitle className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 min-w-0">
            <span className="truncate min-w-0">Menus & Formules ({localMenus.length})</span>
            <Button onClick={() => setDialogOpen(true)} className="w-full sm:w-auto shrink-0">
              <Plus className="mr-2 h-4 w-4" />
              Ajouter
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="px-2 md:px-6 w-full max-w-full min-w-0 overflow-hidden">
          {localMenus.length === 0 ? (
            <Alert>
              <UtensilsCrossed className="h-4 w-4" />
              <AlertTitle>Aucun menu défini</AlertTitle>
              <AlertDescription>
                Créez des menus avec des créneaux horaires pour proposer des formules à vos clients 
                (ex : Menu du midi disponible du lundi au vendredi de 11h30 à 14h30)
              </AlertDescription>
            </Alert>
          ) : (
            <>
              {/* Desktop Table (≥ xl) */}
              <div className="hidden xl:block overflow-x-auto w-full max-w-full min-w-0">
                <Table className="w-full table-fixed min-w-0">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[20%]">Nom</TableHead>
                      <TableHead className="w-[10%]">Prix</TableHead>
                      <TableHead className="w-[25%]">Disponibilité</TableHead>
                      <TableHead className="w-[20%]">Horaires</TableHead>
                      <TableHead className="w-[10%]">Actif</TableHead>
                      <TableHead className="w-[15%] text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {localMenus.map((menu) => (
                      <TableRow key={menu.id}>
                        <TableCell>
                          <span className="font-medium truncate block w-full" title={menu.label}>
                            {menu.label}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="font-mono">
                            {menu.menu_price ? menu.menu_price.toFixed(2) : '0.00'}€
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm truncate block w-full" title={formatDays(menu.days)}>
                            {formatDays(menu.days)}
                          </span>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-mono whitespace-nowrap">{menu.start_time} → {menu.end_time}</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={menu.is_active ? "default" : "secondary"}>
                            {menu.is_active ? "Actif" : "Inactif"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-1 justify-end">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditMenu(menu)}
                              disabled={isLookingUp}
                            >
                              {isLookingUp ? <Loader2 className="h-4 w-4 animate-spin" /> : <Pencil className="h-4 w-4" />}
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleDeleteMenu(menu)}
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

              {/* Tablet Table (md to xl) */}
              <div className="hidden md:block xl:hidden overflow-x-auto w-full max-w-full min-w-0">
                <Table className="w-full min-w-0">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[30%]">Nom</TableHead>
                      <TableHead className="w-[15%]">Prix</TableHead>
                      <TableHead className="w-[25%]">Horaires</TableHead>
                      <TableHead className="w-[15%]">Actif</TableHead>
                      <TableHead className="w-[15%] text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {localMenus.map((menu) => (
                      <TableRow key={menu.id}>
                        <TableCell>
                          <div className="space-y-1">
                            <span className="font-medium truncate block" title={menu.label}>
                              {menu.label}
                            </span>
                            <span className="text-xs text-muted-foreground truncate block" title={formatDays(menu.days)}>
                              {formatDays(menu.days)}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="font-mono text-xs">
                            {menu.menu_price ? menu.menu_price.toFixed(2) : '0.00'}€
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm font-mono whitespace-nowrap">{formatTime(menu.start_time)} → {formatTime(menu.end_time)}</span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={menu.is_active ? "default" : "secondary"} className="text-xs">
                            {menu.is_active ? "Actif" : "Inactif"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex gap-1 justify-end">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEditMenu(menu)}
                              disabled={isLookingUp}
                            >
                              {isLookingUp ? <Loader2 className="h-4 w-4 animate-spin" /> : <Pencil className="h-4 w-4" />}
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleDeleteMenu(menu)}
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
              
              {/* Mobile Cards (< md) */}
              <div className="md:hidden space-y-3 w-full min-w-0 overflow-hidden">
                {localMenus.map((menu) => (
                  <Card key={menu.id} className="p-4 w-full min-w-0 overflow-hidden">
                    <div className="flex items-start justify-between gap-2 w-full min-w-0 overflow-hidden">
                      <div className="min-w-0 flex-1 space-y-2 overflow-hidden">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="font-medium truncate min-w-0 flex-1">{menu.label}</span>
                          <Badge variant={menu.is_active ? "default" : "secondary"} className="text-xs shrink-0">
                            {menu.is_active ? "Actif" : "Inactif"}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap min-w-0">
                          <Badge variant="secondary" className="font-mono text-xs shrink-0">
                            {menu.menu_price ? menu.menu_price.toFixed(2) : '0.00'}€
                          </Badge>
                          <span className="text-xs font-mono text-muted-foreground">
                            {formatTime(menu.start_time)} → {formatTime(menu.end_time)}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground truncate w-full">{formatDays(menu.days)}</p>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 shrink-0"
                          onClick={() => handleEditMenu(menu)}
                          disabled={isLookingUp}
                        >
                          {isLookingUp ? <Loader2 className="h-4 w-4 animate-spin" /> : <Pencil className="h-4 w-4" />}
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="h-8 w-8 shrink-0"
                          onClick={() => handleDeleteMenu(menu)}
                          disabled={isDeleting}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Dialog d'ajout */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] p-0 flex flex-col overflow-hidden">
          <DialogHeader className="flex-shrink-0 px-6 pt-6 pb-4">
            <DialogTitle>Ajouter un menu / formule</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-6">
            {renderMenuForm(formData, setFormData, openChoiceIndex, setOpenChoiceIndex, false)}
          </div>
          <DialogFooter className="flex-shrink-0 px-6 pb-6 pt-4">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={handleAddMenu} disabled={!isFormValid(formData)}>
              Ajouter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog d'édition */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] p-0 flex flex-col overflow-hidden">
          <DialogHeader className="flex-shrink-0 px-6 pt-6 pb-4">
            <DialogTitle>Modifier le menu</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto px-6">
            {renderMenuForm(editFormData, setEditFormData, editOpenChoiceIndex, setEditOpenChoiceIndex, true)}
          </div>
          <DialogFooter className="flex-shrink-0 px-6 pb-6 pt-4">
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={isSaving || !isFormValid(editFormData)}
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

      {/* Dialog du menu du jour */}
      <DailyMenuDialog
        open={dailyMenuDialogOpen}
        onOpenChange={setDailyMenuDialogOpen}
        formData={{
          label: dailyMenuFormData.label,
          menu_price: dailyMenuFormData.menu_price,
          daily_schedules: dailyMenuFormData.daily_schedules,
          temporary_products: dailyMenuFormData.temporary_products,
        }}
        setFormData={(data) => setDailyMenuFormData({ ...dailyMenuFormData, ...data })}
        catalogItems={catalogItems}
        onSave={handleSaveDailyMenu}
      />

      <ConfirmDialog
        open={deleteConfirm.open}
        onOpenChange={(open) => setDeleteConfirm({ ...deleteConfirm, open })}
        title="Supprimer ce menu ?"
        description={`Êtes-vous sûr de vouloir supprimer "${deleteConfirm.menu?.label}" ? Cette action est irréversible.`}
        onConfirm={confirmDelete}
      />
    </div>
  );
}
