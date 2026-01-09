import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, CheckCircle, AlertTriangle, Trash2, Copy, ExternalLink } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useDeleteAccount } from '@/hooks/useDeleteAccount';
import { useRestaurantSettings, OpeningHours, RestaurantAsset } from '@/hooks/useRestaurantSettings';
import { Skeleton } from '@/components/ui/skeleton';
import { AssetUploader } from '@/components/dashboard/AssetUploader';
import { useSubscription } from '@/hooks/useSubscription';
import { PromptEditor } from '@/components/dashboard/PromptEditor';
import { useCatalogue } from '@/hooks/useCatalogue';
import { WhatsAppOnboardingButton } from '@/components/dashboard/WhatsAppOnboardingButton';
import { useWhatsAppIntegration } from '@/hooks/useWhatsAppIntegration';
import { supabase } from '@/integrations/supabase/client';
import { AddressAutocomplete } from '@/components/ui/address-autocomplete';
import { toast } from '@/hooks/use-toast';

const DAYS_OF_WEEK = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];

interface RestaurantSettingsProps {
  userId?: string;
  isAdminView?: boolean;
}

export function RestaurantSettings({ userId, isAdminView = false }: RestaurantSettingsProps) {
  const { settings, isLoading, updateSettings, isUpdating } = useRestaurantSettings(userId);
  const { plan } = useSubscription();
  const { items: catalogueItems } = useCatalogue({ userId });
  const { integration: whatsappIntegration, refetch: refetchWhatsApp } = useWhatsAppIntegration(userId, isAdminView);
  const { deleteAccount, isDeleting } = useDeleteAccount();
  const isStarterPlan = plan === 'starter';

  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  const [restaurantName, setRestaurantName] = useState('');
  const [chatbotName, setChatbotName] = useState('');
  const [chatbotActive, setChatbotActive] = useState(true);
  const [chatbotPrompt, setChatbotPrompt] = useState('');
  const [addressStreet, setAddressStreet] = useState('');
  const [addressPostalCode, setAddressPostalCode] = useState('');
  const [addressCity, setAddressCity] = useState('');
  const [openingHours, setOpeningHours] = useState<OpeningHours[]>([]);
  const [assets, setAssets] = useState<RestaurantAsset[]>([]);
  const [phoneNumberId, setPhoneNumberId] = useState('');
  const [whatsappBusinessId, setWhatsappBusinessId] = useState('');
  const [reservationsWebhookUrl, setReservationsWebhookUrl] = useState('');
  const [adminDefaultTemplate, setAdminDefaultTemplate] = useState('');
  const [themeColor, setThemeColor] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  

  // Load admin default template from system_settings
  useEffect(() => {
    const loadAdminTemplate = async () => {
      const { data } = await supabase
        .from('system_settings')
        .select('setting_value')
        .eq('setting_key', 'starter_prompt_template')
        .maybeSingle();
      
      if (data?.setting_value) {
        const templateValue = typeof data.setting_value === 'string' 
          ? data.setting_value 
          : (data.setting_value as { template?: string })?.template || '';
        setAdminDefaultTemplate(templateValue);
      }
    };
    loadAdminTemplate();
  }, []);

  useEffect(() => {
    if (settings) {
      setRestaurantName(settings.restaurant_name || '');
      setChatbotName(settings.chatbot_name);
      setChatbotActive(settings.chatbot_active);
      setChatbotPrompt(settings.chatbot_prompt || '');
      setAddressStreet(settings.address_street || '');
      setAddressPostalCode(settings.address_postal_code || '');
      setAddressCity(settings.address_city || '');
      setOpeningHours(settings.opening_hours);
      setAssets(settings.assets || []);
      setPhoneNumberId(settings.phone_number_id || '');
      setWhatsappBusinessId(settings.whatsapp_business_id || '');
      setReservationsWebhookUrl(settings.reservations_webhook_url || '');
      setThemeColor(settings.theme_color || '');
      setCoverImageUrl(settings.cover_image_url || '');
      
    }
  }, [settings]);

  // Computed values for prompt preview
  const promptPreviewData = useMemo(() => {
    const formattedHours = openingHours
      .filter(h => h.slot1 || h.slot2)
      .map(h => `${h.day}: ${[h.slot1, h.slot2].filter(Boolean).join(', ')}`)
      .join('\n') || 'Non renseigné';

    // Format assets as "description = URL" (one per line)
    const formattedAssets = assets.length > 0
      ? assets.map(a => `${a.description || a.filename} = ${a.url}`).join('\n')
      : 'Aucun asset configuré';

    const fullAddress = [addressStreet, addressPostalCode, addressCity]
      .filter(Boolean)
      .join(', ') || 'Non renseignée';

    // Get unique categories from catalogue, comma-separated
    const uniqueCategories = [...new Set(catalogueItems.filter(item => item.is_active).map(item => item.category))];
    const formattedCategories = uniqueCategories.length > 0
      ? uniqueCategories.join(', ')
      : 'Aucune catégorie (catalogue vide)';

    // Get order wait time from settings (default 30 for Starter)
    const orderWaitTime = settings?.order_time_minutes ?? 30;

    return {
      restaurantName: restaurantName || 'Mon Restaurant',
      openingHours: formattedHours,
      assets: formattedAssets,
      address: fullAddress,
      categories: formattedCategories,
      orderWaitTime,
    };
  }, [restaurantName, openingHours, assets, addressStreet, addressPostalCode, addressCity, catalogueItems, settings]);

  const handleSimpleTimeChange = (day: string, slot: 'slot1' | 'slot2', value: string) => {
    setOpeningHours((prev) =>
      prev.map((hours) =>
        hours.day === day ? { ...hours, [slot]: value } : hours
      )
    );
  };

  // Function to replace static placeholders with actual values
  const renderPromptWithData = (prompt: string) => {
    if (!prompt) return null;
    
    let rendered = prompt;
    rendered = rendered.replace(/\[\[RESTAURANT_NAME\]\]/g, promptPreviewData.restaurantName);
    rendered = rendered.replace(/\[\[ADDRESS\]\]/g, promptPreviewData.address);
    rendered = rendered.replace(/\[\[OPENING_HOURS\]\]/g, promptPreviewData.openingHours);
    rendered = rendered.replace(/\[\[CATEGORIES\]\]/g, promptPreviewData.categories);
    rendered = rendered.replace(/\[\[ASSETS\]\]/g, promptPreviewData.assets);
    rendered = rendered.replace(/\[\[ORDER_WAIT_TIME\]\]/g, String(promptPreviewData.orderWaitTime));
    
    return rendered;
  };

  const hasCatalogue = catalogueItems && catalogueItems.length > 0;

  const handleSave = () => {
    const finalChatbotName = (isStarterPlan && !isAdminView) ? 'ChatFood' : chatbotName;
    // Force chatbot_active à false si pas de catalogue (sauf pour admin)
    const finalChatbotActive = (hasCatalogue || isAdminView) ? chatbotActive : false;
    
    // Pre-fill static placeholders before saving to database
    const renderedPrompt = renderPromptWithData(chatbotPrompt);
    
    updateSettings({
      restaurant_name: restaurantName || null,
      chatbot_name: finalChatbotName,
      chatbot_active: finalChatbotActive,
      chatbot_prompt: renderedPrompt, // Save rendered version for chatbot
      address_street: addressStreet || null,
      address_postal_code: addressPostalCode || null,
      address_city: addressCity || null,
      opening_hours: openingHours,
      assets,
      phone_number_id: phoneNumberId || null,
      whatsapp_business_id: whatsappBusinessId || null,
      reservations_webhook_url: reservationsWebhookUrl || null,
      theme_color: themeColor || null,
      cover_image_url: coverImageUrl || null,
      
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </CardHeader>
        <CardContent className="space-y-6">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-32 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Paramètres du Restaurant</CardTitle>
        <CardDescription>
          Configurez toutes les informations de votre restaurant
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="general" className="space-y-4">
          <TabsList className={`grid w-full ${isAdminView ? 'grid-cols-6' : 'grid-cols-3'}`}>
            <TabsTrigger value="general">Général</TabsTrigger>
            <TabsTrigger value="chatbot">Chatbot</TabsTrigger>
            <TabsTrigger value="location">Localisation</TabsTrigger>
            {isAdminView && (
              <>
                <TabsTrigger value="whatsapp">WhatsApp</TabsTrigger>
                <TabsTrigger value="integrations">Intégrations</TabsTrigger>
                <TabsTrigger value="prompt">Prompt IA</TabsTrigger>
              </>
            )}
          </TabsList>

          <TabsContent value="general" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="restaurant-name">Nom du restaurant</Label>
              <Input
                id="restaurant-name"
                value={restaurantName}
                onChange={(e) => setRestaurantName(e.target.value)}
                placeholder="Le Gourmet"
              />
            </div>


            {/* Zone de danger - Suppression du compte */}
            {!isAdminView && (
              <div className="mt-8 pt-6 border-t border-destructive/20">
                <div className="bg-destructive/5 rounded-lg p-4">
                  <h4 className="text-destructive font-semibold flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Zone de danger
                  </h4>
                  <p className="text-sm text-muted-foreground mt-2">
                    La suppression de votre compte est irréversible. 
                    Toutes vos données seront définitivement supprimées.
                  </p>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" className="mt-4">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Supprimer mon compte
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Êtes-vous absolument sûr ?</AlertDialogTitle>
                        <AlertDialogDescription asChild>
                          <div className="space-y-3">
                            <p>Cette action est irréversible. Cela supprimera définitivement :</p>
                            <ul className="list-disc list-inside text-sm space-y-1">
                              <li>Votre restaurant et tous ses paramètres</li>
                              <li>Tous vos produits et menus</li>
                              <li>Tout l'historique des commandes</li>
                              <li>Toutes les conversations WhatsApp</li>
                              <li>Toutes les réservations</li>
                              <li>Vos informations de profil</li>
                            </ul>
                            <p className="font-medium">Tapez SUPPRIMER pour confirmer.</p>
                          </div>
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <Input 
                        placeholder="Tapez SUPPRIMER pour confirmer"
                        value={deleteConfirmation}
                        onChange={(e) => setDeleteConfirmation(e.target.value.toUpperCase())}
                        className="font-mono"
                      />
                      <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setDeleteConfirmation('')}>
                          Annuler
                        </AlertDialogCancel>
                        <AlertDialogAction 
                          disabled={deleteConfirmation !== 'SUPPRIMER' || isDeleting}
                          onClick={() => {
                            deleteAccount(deleteConfirmation);
                            setDeleteConfirmation('');
                          }}
                          className="bg-destructive hover:bg-destructive/90"
                        >
                          {isDeleting ? 'Suppression...' : 'Supprimer définitivement'}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="chatbot" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="chatbot-name">Nom du chatbot</Label>
              <Input
                id="chatbot-name"
                value={chatbotName}
                onChange={(e) => setChatbotName(e.target.value)}
                placeholder="ChatFood"
                disabled={isStarterPlan && !isAdminView}
                className={isStarterPlan && !isAdminView ? 'bg-muted cursor-not-allowed' : ''}
              />
              {isStarterPlan && !isAdminView && (
                <p className="text-xs text-muted-foreground">
                  💡 Le nom "ChatFood" est fixe pour le plan Starter. Passez au plan Pro pour le personnaliser.
                </p>
              )}
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="chatbot-active">Chatbot actif</Label>
                <p className="text-sm text-muted-foreground">
                  Activer ou désactiver le chatbot
                </p>
                {!hasCatalogue && !isAdminView && (
                  <p className="text-sm text-amber-600 flex items-center gap-1.5 mt-2">
                    <AlertTriangle className="h-4 w-4" />
                    Le chatbot ne peut pas être activé tant que le catalogue est vide.
                  </p>
                )}
              </div>
              <Switch
                id="chatbot-active"
                checked={chatbotActive}
                onCheckedChange={setChatbotActive}
                disabled={!hasCatalogue && !isAdminView}
              />
            </div>
          </TabsContent>

          <TabsContent value="location" className="space-y-4">
            <div className="space-y-4">
              <Label className="text-base">Adresse du restaurant</Label>
              
              <div className="space-y-2">
                <Label htmlFor="address-street">Rue</Label>
                <AddressAutocomplete
                  id="address-street"
                  value={addressStreet}
                  onChange={setAddressStreet}
                  onAddressSelect={(address) => {
                    setAddressStreet(address.street);
                    setAddressPostalCode(address.postalCode);
                    setAddressCity(address.city);
                  }}
                  placeholder="Ex: 12 rue de la Paix"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="address-postal">Code postal</Label>
                  <Input
                    id="address-postal"
                    value={addressPostalCode}
                    onChange={(e) => setAddressPostalCode(e.target.value)}
                    placeholder="75001"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address-city">Ville</Label>
                  <Input
                    id="address-city"
                    value={addressCity}
                    onChange={(e) => setAddressCity(e.target.value)}
                    placeholder="Paris"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label className="text-base">Horaires d'ouverture</Label>
                <p className="text-sm text-muted-foreground mt-1">
                  Indiquez les horaires au format libre (ex: 12h-14h, 19h-23h)
                </p>
              </div>
              <div className="space-y-4">
                {DAYS_OF_WEEK.map((day) => {
                  const hours = openingHours.find((h) => h.day === day) || { day, slot1: '', slot2: '' };
                  return (
                    <div key={day} className="space-y-3 p-4 rounded-lg border">
                      <span className="font-medium capitalize text-base">{day}</span>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Service midi</Label>
                          <Input
                            value={hours.slot1}
                            onChange={(e) => handleSimpleTimeChange(day, 'slot1', e.target.value)}
                            placeholder="12h-14h"
                            className="text-sm"
                          />
                        </div>
                        
                        <div className="space-y-1">
                          <Label className="text-xs text-muted-foreground">Service soir (optionnel)</Label>
                          <Input
                            value={hours.slot2}
                            onChange={(e) => handleSimpleTimeChange(day, 'slot2', e.target.value)}
                            placeholder="19h-23h"
                            className="text-sm"
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </TabsContent>

          {isAdminView && (
            <>
              <TabsContent value="whatsapp" className="space-y-4">
                {/* Statut de l'intégration WhatsApp */}
                {whatsappIntegration ? (
                  <Card className={`p-4 ${whatsappIntegration.status === 'active' ? 'bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800' : 'bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800'}`}>
                    <div className="flex items-center gap-3">
                      {whatsappIntegration.status === 'active' ? (
                        <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                      )}
                      <div>
                        <p className={`font-medium ${whatsappIntegration.status === 'active' ? 'text-green-700 dark:text-green-400' : 'text-amber-700 dark:text-amber-400'}`}>
                          {whatsappIntegration.status === 'active' ? 'WhatsApp connecté' : 'WhatsApp déconnecté'}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {whatsappIntegration.display_phone_number || whatsappIntegration.phone_number_id || 'Aucun numéro'}
                          {whatsappIntegration.verified_name && ` • ${whatsappIntegration.verified_name}`}
                        </p>
                      </div>
                    </div>
                  </Card>
                ) : (
                  <Card className="p-4 bg-muted/50 border-dashed">
                    <p className="text-muted-foreground text-sm">Aucune intégration WhatsApp</p>
                  </Card>
                )}

                {/* Bouton d'onboarding WhatsApp Embedded Signup */}
                <Card className="p-4 border-2 border-primary/20 bg-primary/5">
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-semibold text-lg">Connecter WhatsApp Business</h3>
                      <p className="text-sm text-muted-foreground">
                        Connectez le compte WhatsApp Business du client via Meta Embedded Signup
                      </p>
                    </div>
                    <WhatsAppOnboardingButton
                      existingIntegration={whatsappIntegration}
                      onSuccess={(data) => {
                        setPhoneNumberId(data.phone_number_id);
                        setWhatsappBusinessId(data.waba_id);
                        refetchWhatsApp();
                      }}
                    />
                  </div>
                </Card>

                {/* Champs manuels (lecture/écriture admin) */}
                <div className="space-y-2">
                  <Label htmlFor="phone-number-id">Phone Number ID</Label>
                  <Input
                    id="phone-number-id"
                    value={phoneNumberId}
                    onChange={(e) => setPhoneNumberId(e.target.value)}
                    placeholder="123456789"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="whatsapp-business-id">WhatsApp Business ID</Label>
                  <Input
                    id="whatsapp-business-id"
                    value={whatsappBusinessId}
                    onChange={(e) => setWhatsappBusinessId(e.target.value)}
                    placeholder="987654321"
                  />
                </div>
              </TabsContent>

              <TabsContent value="integrations" className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="reservations-webhook">Webhook Réservations</Label>
                    <Input
                      id="reservations-webhook"
                      value={reservationsWebhookUrl}
                      onChange={(e) => setReservationsWebhookUrl(e.target.value)}
                      placeholder="https://n8n.chatfood.fr/webhook/..."
                      className="font-mono text-sm"
                    />
                    <p className="text-xs text-muted-foreground">
                      💡 URL du webhook n8n pour les notifications de réservations
                    </p>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="prompt" className="space-y-4">
                <PromptEditor
                  value={chatbotPrompt}
                  onChange={setChatbotPrompt}
                  restaurantName={promptPreviewData.restaurantName}
                  openingHours={promptPreviewData.openingHours}
                  categories={promptPreviewData.categories}
                  assets={promptPreviewData.assets}
                  address={promptPreviewData.address}
                  orderWaitTime={promptPreviewData.orderWaitTime}
                  defaultTemplate={adminDefaultTemplate}
                />
              </TabsContent>
            </>
          )}
        </Tabs>

        <div className="mt-6">
          <Button onClick={handleSave} disabled={isUpdating} className="w-full sm:w-auto">
            <Save className="h-4 w-4 mr-2" />
            {isUpdating ? 'Enregistrement...' : 'Enregistrer tous les paramètres'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}