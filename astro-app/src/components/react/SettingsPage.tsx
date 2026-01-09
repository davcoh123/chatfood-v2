import { useState, useEffect } from "react";
import { useRestaurantSettings, OpeningHours } from "@/hooks/useRestaurantSettings";
import { useSubscription } from "@/hooks/useSubscription";
import { useCatalogue } from "@/hooks/useCatalogue";
import { useWhatsAppIntegration } from "@/hooks/useWhatsAppIntegration";
import { useDeleteAccount } from "@/hooks/useDeleteAccount";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { SlugEditor } from "@/components/dashboard/SlugEditor";
import { CoverImageUploader } from "@/components/dashboard/CoverImageUploader";
import { WhatsAppOnboardingButton } from "@/components/dashboard/WhatsAppOnboardingButton";
import { toast } from "sonner";
import { 
  User, Store, Clock, Bot, Save, Loader2, 
  Building2, AlertTriangle, Trash2, CheckCircle,
  Settings as SettingsIcon, MessageSquare
} from "lucide-react";

interface SettingsPageProps {
  userId: string;
  userEmail: string;
  firstName?: string;
  lastName?: string;
}

const DAYS_OF_WEEK = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];

export default function SettingsPage({ userId, userEmail, firstName, lastName }: SettingsPageProps) {
  const { settings, isLoading, updateSettings, isUpdating } = useRestaurantSettings(userId);
  const { plan } = useSubscription();
  const { integration: whatsappIntegration, isLoading: whatsappLoading } = useWhatsAppIntegration();
  const { items: catalogueItems } = useCatalogue({ userId });
  const { deleteAccount, isDeleting } = useDeleteAccount();
  
  const hasCatalogue = catalogueItems && catalogueItems.length > 0;
  const isStarterPlan = plan === 'starter';
  
  // Profile state
  const [profileFirstName, setProfileFirstName] = useState(firstName || '');
  const [profileLastName, setProfileLastName] = useState(lastName || '');
  
  // Restaurant state
  const [restaurantName, setRestaurantName] = useState('');
  const [addressStreet, setAddressStreet] = useState('');
  const [addressPostalCode, setAddressPostalCode] = useState('');
  const [addressCity, setAddressCity] = useState('');
  const [siret, setSiret] = useState('');
  const [phone, setPhone] = useState('');
  const [description, setDescription] = useState('');
  
  // Chatbot state
  const [chatbotName, setChatbotName] = useState('');
  const [chatbotActive, setChatbotActive] = useState(true);
  const [orderTimeEnabled, setOrderTimeEnabled] = useState(false);
  const [orderTimeMinutes, setOrderTimeMinutes] = useState(15);
  const [manualConfirmation, setManualConfirmation] = useState(false);
  
  // Opening hours state
  const [openingHours, setOpeningHours] = useState<OpeningHours[]>(
    DAYS_OF_WEEK.map(day => ({ day, open: '09:00', close: '22:00', closed: false }))
  );
  
  // Load settings
  useEffect(() => {
    if (settings) {
      setRestaurantName(settings.restaurant_name || '');
      setAddressStreet(settings.address_street || '');
      setAddressPostalCode(settings.address_postal_code || '');
      setAddressCity(settings.address_city || '');
      setSiret(settings.siret || '');
      setPhone(settings.phone || '');
      setDescription(settings.description || '');
      setChatbotName(settings.chatbot_name || '');
      setChatbotActive(settings.chatbot_active ?? true);
      setOrderTimeEnabled(settings.order_time_enabled || false);
      setOrderTimeMinutes(settings.order_time_minutes || 15);
      setManualConfirmation(settings.manual_order_confirmation || false);
      
      if (settings.opening_hours?.length) {
        setOpeningHours(settings.opening_hours);
      }
    }
  }, [settings]);
  
  const handleSaveRestaurant = async () => {
    await updateSettings({
      restaurant_name: restaurantName,
      address_street: addressStreet,
      address_postal_code: addressPostalCode,
      address_city: addressCity,
      siret,
      phone,
      description,
    });
    toast.success("Informations restaurant sauvegardées");
  };
  
  const handleSaveChatbot = async () => {
    await updateSettings({
      chatbot_name: chatbotName,
      chatbot_active: chatbotActive,
      order_time_enabled: orderTimeEnabled,
      order_time_minutes: orderTimeMinutes,
      manual_order_confirmation: manualConfirmation,
    });
    toast.success("Paramètres chatbot sauvegardés");
  };
  
  const handleSaveOpeningHours = async () => {
    await updateSettings({
      opening_hours: openingHours,
    });
    toast.success("Horaires sauvegardés");
  };
  
  const handleOpeningHourChange = (index: number, field: keyof OpeningHours, value: any) => {
    const newHours = [...openingHours];
    newHours[index] = { ...newHours[index], [field]: value };
    setOpeningHours(newHours);
  };
  
  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid gap-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="restaurant" className="space-y-6">
        <TabsList className="grid grid-cols-4 w-full max-w-xl">
          <TabsTrigger value="restaurant" className="gap-2">
            <Store className="h-4 w-4" />
            <span className="hidden sm:inline">Restaurant</span>
          </TabsTrigger>
          <TabsTrigger value="chatbot" className="gap-2">
            <Bot className="h-4 w-4" />
            <span className="hidden sm:inline">Chatbot</span>
          </TabsTrigger>
          <TabsTrigger value="hours" className="gap-2">
            <Clock className="h-4 w-4" />
            <span className="hidden sm:inline">Horaires</span>
          </TabsTrigger>
          <TabsTrigger value="account" className="gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Compte</span>
          </TabsTrigger>
        </TabsList>

        {/* Restaurant Tab */}
        <TabsContent value="restaurant">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Informations du restaurant
              </CardTitle>
              <CardDescription>
                Ces informations seront visibles sur votre page publique
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Slug Editor */}
              <div>
                <Label>URL publique</Label>
                <SlugEditor userId={userId} />
              </div>
              
              {/* Cover Image */}
              <div>
                <Label>Image de couverture</Label>
                <CoverImageUploader userId={userId} />
              </div>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Nom du restaurant</Label>
                  <Input
                    value={restaurantName}
                    onChange={(e) => setRestaurantName(e.target.value)}
                    placeholder="Mon Restaurant"
                  />
                </div>
                <div>
                  <Label>Téléphone</Label>
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+33 1 23 45 67 89"
                  />
                </div>
              </div>
              
              <div>
                <Label>Description</Label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Décrivez votre restaurant..."
                  rows={3}
                />
              </div>
              
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="sm:col-span-2">
                  <Label>Adresse</Label>
                  <Input
                    value={addressStreet}
                    onChange={(e) => setAddressStreet(e.target.value)}
                    placeholder="123 rue de Paris"
                  />
                </div>
                <div>
                  <Label>Code postal</Label>
                  <Input
                    value={addressPostalCode}
                    onChange={(e) => setAddressPostalCode(e.target.value)}
                    placeholder="75001"
                  />
                </div>
              </div>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label>Ville</Label>
                  <Input
                    value={addressCity}
                    onChange={(e) => setAddressCity(e.target.value)}
                    placeholder="Paris"
                  />
                </div>
                <div>
                  <Label>SIRET</Label>
                  <Input
                    value={siret}
                    onChange={(e) => setSiret(e.target.value)}
                    placeholder="123 456 789 00012"
                    maxLength={14}
                  />
                </div>
              </div>
              
              <Button 
                onClick={handleSaveRestaurant} 
                disabled={isUpdating}
                className="bg-green-600 hover:bg-green-700"
              >
                {isUpdating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Sauvegarder
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Chatbot Tab */}
        <TabsContent value="chatbot">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5" />
                Configuration du chatbot
              </CardTitle>
              <CardDescription>
                Personnalisez le comportement de votre assistant virtuel
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <Label className="text-base">Chatbot actif</Label>
                  <p className="text-sm text-gray-500">Activer/désactiver le chatbot pour les commandes</p>
                </div>
                <Switch
                  checked={chatbotActive}
                  onCheckedChange={setChatbotActive}
                />
              </div>
              
              <div>
                <Label>Nom du chatbot</Label>
                <Input
                  value={chatbotName}
                  onChange={(e) => setChatbotName(e.target.value)}
                  placeholder="Assistant"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Le nom utilisé par le chatbot quand il se présente
                </p>
              </div>
              
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <Label className="text-base">Temps de préparation estimé</Label>
                  <p className="text-sm text-gray-500">
                    Afficher le temps de préparation dans les confirmations
                  </p>
                </div>
                <Switch
                  checked={orderTimeEnabled}
                  onCheckedChange={setOrderTimeEnabled}
                  disabled={isStarterPlan}
                />
              </div>
              
              {orderTimeEnabled && (
                <div>
                  <Label>Temps de préparation (minutes)</Label>
                  <Input
                    type="number"
                    value={orderTimeMinutes}
                    onChange={(e) => setOrderTimeMinutes(parseInt(e.target.value))}
                    min={5}
                    max={120}
                    disabled={isStarterPlan}
                  />
                </div>
              )}
              
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <Label className="text-base">Confirmation manuelle</Label>
                  <p className="text-sm text-gray-500">
                    Requiert une confirmation manuelle pour chaque commande
                  </p>
                </div>
                <Switch
                  checked={manualConfirmation}
                  onCheckedChange={setManualConfirmation}
                  disabled={isStarterPlan}
                />
              </div>
              
              {isStarterPlan && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-800">Plan Starter</p>
                    <p className="text-sm text-amber-700">
                      Certaines fonctionnalités avancées sont disponibles avec les plans Pro et Premium.
                    </p>
                  </div>
                </div>
              )}
              
              {/* WhatsApp Integration */}
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5 text-green-600" />
                    <Label className="text-base">Intégration WhatsApp</Label>
                  </div>
                  {whatsappIntegration?.is_active && (
                    <Badge className="bg-green-100 text-green-700">Connecté</Badge>
                  )}
                </div>
                
                {!whatsappLoading && (
                  <WhatsAppOnboardingButton 
                    hasConfig={!!whatsappIntegration}
                    hasCatalogue={hasCatalogue}
                    userId={userId}
                  />
                )}
              </div>
              
              <Button 
                onClick={handleSaveChatbot} 
                disabled={isUpdating}
                className="bg-green-600 hover:bg-green-700"
              >
                {isUpdating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Sauvegarder
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Hours Tab */}
        <TabsContent value="hours">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Horaires d'ouverture
              </CardTitle>
              <CardDescription>
                Définissez les horaires d'ouverture de votre établissement
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {openingHours.map((hours, index) => (
                <div key={hours.day} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <div className="w-24 font-medium capitalize">{hours.day}</div>
                  
                  <Switch
                    checked={!hours.closed}
                    onCheckedChange={(checked) => handleOpeningHourChange(index, 'closed', !checked)}
                  />
                  
                  {!hours.closed ? (
                    <>
                      <Input
                        type="time"
                        value={hours.open}
                        onChange={(e) => handleOpeningHourChange(index, 'open', e.target.value)}
                        className="w-32"
                      />
                      <span>-</span>
                      <Input
                        type="time"
                        value={hours.close}
                        onChange={(e) => handleOpeningHourChange(index, 'close', e.target.value)}
                        className="w-32"
                      />
                    </>
                  ) : (
                    <span className="text-gray-500">Fermé</span>
                  )}
                </div>
              ))}
              
              <Button 
                onClick={handleSaveOpeningHours} 
                disabled={isUpdating}
                className="bg-green-600 hover:bg-green-700"
              >
                {isUpdating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                Sauvegarder les horaires
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Account Tab */}
        <TabsContent value="account">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Informations du compte
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label>Prénom</Label>
                    <Input
                      value={profileFirstName}
                      onChange={(e) => setProfileFirstName(e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Nom</Label>
                    <Input
                      value={profileLastName}
                      onChange={(e) => setProfileLastName(e.target.value)}
                    />
                  </div>
                </div>
                <div>
                  <Label>Email</Label>
                  <Input value={userEmail} disabled className="bg-gray-100" />
                  <p className="text-sm text-gray-500 mt-1">
                    L'email ne peut pas être modifié
                  </p>
                </div>
              </CardContent>
            </Card>
            
            {/* Subscription Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <SettingsIcon className="h-5 w-5" />
                  Abonnement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Plan actuel</p>
                    <p className="text-sm text-gray-500">
                      {plan === 'premium' && 'Accès à toutes les fonctionnalités'}
                      {plan === 'pro' && 'Fonctionnalités avancées incluses'}
                      {plan === 'starter' && 'Fonctionnalités de base'}
                    </p>
                  </div>
                  <Badge className={
                    plan === 'premium' ? 'bg-purple-100 text-purple-700' :
                    plan === 'pro' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }>
                    {plan?.toUpperCase() || 'STARTER'}
                  </Badge>
                </div>
                <a href="/offres" className="inline-block mt-4 text-green-600 hover:underline text-sm font-medium">
                  Voir les offres disponibles →
                </a>
              </CardContent>
            </Card>
            
            {/* Danger Zone */}
            <Card className="border-red-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-600">
                  <AlertTriangle className="h-5 w-5" />
                  Zone de danger
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-500 mb-4">
                  La suppression de votre compte est irréversible. Toutes vos données seront définitivement effacées.
                </p>
                <Button 
                  variant="destructive"
                  onClick={() => {
                    if (confirm('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.')) {
                      deleteAccount();
                    }
                  }}
                  disabled={isDeleting}
                >
                  {isDeleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
                  Supprimer mon compte
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
