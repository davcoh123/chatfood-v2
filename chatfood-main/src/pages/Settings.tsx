import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { profileUpdateSchema, passwordChangeSchema, type ProfileUpdateForm, type PasswordChangeForm } from "@/schemas/settings";
import { PasswordStrengthIndicator } from "@/components/PasswordStrengthIndicator";
import { useRestaurantSettings, OpeningHours } from "@/hooks/useRestaurantSettings";
import { useSubscription } from "@/hooks/useSubscription";
import { useCatalogue } from "@/hooks/useCatalogue";
import { Skeleton } from "@/components/ui/skeleton";
import { User, Shield, Lock, Loader2, Store, Settings as SettingsIcon, Clock, Bot, Save, Lightbulb, CheckCircle, HelpCircle, MessageSquare, AlertCircle, Building2, AlertTriangle, Trash2 } from "lucide-react";
import { AddressAutocomplete } from "@/components/ui/address-autocomplete";
import { WhatsAppOnboardingButton } from "@/components/dashboard/WhatsAppOnboardingButton";
import { useWhatsAppIntegration } from "@/hooks/useWhatsAppIntegration";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
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
} from "@/components/ui/alert-dialog";
import { useDeleteAccount } from "@/hooks/useDeleteAccount";

const DAYS_OF_WEEK = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];
const Settings = () => {
  const {
    profile,
    user
  } = useAuth();
  const {
    toast
  } = useToast();
  const {
    settings,
    isLoading: isLoadingSettings,
    updateSettings,
    isUpdating
  } = useRestaurantSettings(profile?.user_id);
  const {
    plan
  } = useSubscription();
  const {
    integration,
    isLoading: whatsappLoading,
    refetch: refetchWhatsApp
  } = useWhatsAppIntegration();
  const { items: catalogueItems } = useCatalogue();
  const hasCatalogue = catalogueItems && catalogueItems.length > 0;
  const isStarterPlan = plan === 'starter';
  const { deleteAccount, isDeleting } = useDeleteAccount();
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [isPasswordValid, setIsPasswordValid] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  // Restaurant settings state
  const [restaurantName, setRestaurantName] = useState('');
  const [addressStreet, setAddressStreet] = useState('');
  const [addressPostalCode, setAddressPostalCode] = useState('');
  const [addressCity, setAddressCity] = useState('');
  const [longitude, setLongitude] = useState<number | null>(null);
  const [latitude, setLatitude] = useState<number | null>(null);
  const [siret, setSiret] = useState('');
  const [siretLoading, setSiretLoading] = useState(false);
  const [siretValid, setSiretValid] = useState<boolean | null>(null);
  const [siretInfo, setSiretInfo] = useState<string | null>(null);
  const [chatbotName, setChatbotName] = useState('');
  const [chatbotActive, setChatbotActive] = useState(true);
  const [openingHours, setOpeningHours] = useState<OpeningHours[]>([]);

  // New Chatbot Settings
  const [orderTimeEnabled, setOrderTimeEnabled] = useState(false);
  const [orderTimeMinutes, setOrderTimeMinutes] = useState(15);
  const [manualConfirmation, setManualConfirmation] = useState(false);

  // Profile update form
  const profileForm = useForm<ProfileUpdateForm>({
    resolver: zodResolver(profileUpdateSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: ""
    }
  });

  // Password change form
  const passwordForm = useForm<PasswordChangeForm>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    }
  });

  // Load profile data
  useEffect(() => {
    if (profile) {
      profileForm.reset({
        firstName: (profile as any).first_name || "",
        lastName: (profile as any).last_name || "",
        email: profile.email || ""
      });
    }
  }, [profile, profileForm]);

  // Load restaurant settings
  useEffect(() => {
    if (settings) {
      setRestaurantName(settings.restaurant_name || '');
      setAddressStreet(settings.address_street || '');
      setAddressPostalCode(settings.address_postal_code || '');
      setAddressCity(settings.address_city || '');
      setLongitude(settings.longitude || null);
      setLatitude(settings.latitude || null);
      setSiret(settings.siret || '');
      setChatbotName(settings.chatbot_name || '');
      setChatbotActive(settings.chatbot_active);
      setOpeningHours(settings.opening_hours || []);

      // Load new settings with Starter restrictions
      if (isStarterPlan) {
        setOrderTimeEnabled(true);
        setOrderTimeMinutes(30);
        setManualConfirmation(false);
      } else {
        setOrderTimeEnabled(settings.order_time_enabled || false);
        setOrderTimeMinutes(settings.order_time_minutes || 15);
        setManualConfirmation(settings.manual_order_confirmation || false);
      }
    }
  }, [settings, isStarterPlan]);

  // Validate SIRET via webhook
  const validateSiret = async (value: string) => {
    if (value.length !== 14 || !/^\d{14}$/.test(value)) {
      setSiretValid(null);
      setSiretInfo(null);
      return;
    }
    setSiretLoading(true);
    try {
      const response = await fetch('https://n8n.chatfood.fr/webhook/check-siret-0b2e9a5584c0', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          siret: value
        })
      });
      const data = await response.json();
      
      // L'API retourne un tableau avec les infos si valide, ou {"exist":"false"} si invalide
      if (Array.isArray(data) && data.length > 0 && data[0].existe === true) {
        setSiretValid(true);
        setSiretInfo(data[0].nom_commercial || data[0].adresse_complete || null);
      } else {
        setSiretValid(false);
        setSiretInfo(null);
      }
    } catch (error) {
      setSiretValid(false);
      setSiretInfo(null);
    } finally {
      setSiretLoading(false);
    }
  };

  // Update profile
  const onProfileSubmit = async (data: ProfileUpdateForm) => {
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour modifier votre profil",
        variant: "destructive"
      });
      return;
    }
    try {
      const {
        error
      } = await supabase.from('profiles').update({
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email
      }).eq('user_id', user.id);
      if (error) throw error;
      if (data.email !== profile?.email) {
        const {
          error: authError
        } = await supabase.auth.updateUser({
          email: data.email
        });
        if (authError) throw authError;
        toast({
          title: "Email mis à jour",
          description: "Un email de confirmation a été envoyé à votre nouvelle adresse"
        });
      } else {
        toast({
          title: "Profil mis à jour",
          description: "Vos informations ont été sauvegardées avec succès"
        });
      }
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de mettre à jour le profil",
        variant: "destructive"
      });
    }
  };

  // Change password
  const onPasswordSubmit = async (data: PasswordChangeForm) => {
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour changer votre mot de passe",
        variant: "destructive"
      });
      return;
    }
    try {
      const {
        data: {
          session
        }
      } = await supabase.auth.getSession();
      const {
        data: result,
        error
      } = await supabase.functions.invoke('user-change-password', {
        body: {
          currentPassword: data.currentPassword,
          newPassword: data.newPassword
        },
        headers: {
          Authorization: `Bearer ${session?.access_token}`
        }
      });
      if (error) {
        if (error.message.includes('mot de passe actuel')) {
          passwordForm.setError("currentPassword", {
            message: "Mot de passe actuel incorrect"
          });
        } else {
          throw error;
        }
        return;
      }
      toast({
        title: "Mot de passe mis à jour",
        description: "Votre mot de passe a été changé avec succès"
      });
      passwordForm.reset();
      setShowPasswordForm(false);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de changer le mot de passe",
        variant: "destructive"
      });
    }
  };
  const handleSimpleTimeChange = (day: string, slot: 'slot1' | 'slot2', value: string) => {
    setOpeningHours(prev => prev.map(hours => hours.day === day ? {
      ...hours,
      [slot]: value
    } : hours));
  };
  const handleSaveRestaurantSettings = () => {
    const finalChatbotName = isStarterPlan ? 'ChatFood' : chatbotName;
    // Force chatbot_active à false si pas de catalogue
    const finalChatbotActive = hasCatalogue ? chatbotActive : false;
    updateSettings({
      restaurant_name: restaurantName || null,
      address_street: addressStreet || null,
      address_postal_code: addressPostalCode || null,
      address_city: addressCity || null,
      longitude: longitude,
      latitude: latitude,
      siret: siret || null,
      chatbot_name: finalChatbotName,
      chatbot_active: finalChatbotActive,
      opening_hours: openingHours,
      // Chatbot control settings (Pro/Premium only)
      order_time_enabled: isStarterPlan ? true : orderTimeEnabled,
      order_time_minutes: isStarterPlan ? 30 : orderTimeMinutes,
      manual_order_confirmation: isStarterPlan ? false : manualConfirmation,
    });
  };
  return <div className="p-4 md:p-6 space-y-6 md:space-y-8 animate-fade-in min-w-0 overflow-x-hidden">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-gradient-to-r from-primary/20 to-primary/10">
            <SettingsIcon className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">Paramètres</h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Gérez votre compte et votre restaurant
            </p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="personal" className="space-y-6 w-full min-w-0">
        <div className="w-full">
          <TabsList className="w-full justify-start md:justify-center h-auto p-1 bg-muted/50">
            <TabsTrigger value="personal" className="flex-1 py-2">
              <User className="h-4 w-4 md:mr-2 shrink-0" />
              <span className="hidden md:inline">Profil</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex-1 py-2">
              <Shield className="h-4 w-4 md:mr-2 shrink-0" />
              <span className="hidden md:inline">Sécurité</span>
            </TabsTrigger>
            <TabsTrigger value="general" className="flex-1 py-2">
              <Store className="h-4 w-4 md:mr-2 shrink-0" />
              <span className="hidden md:inline">Général</span>
            </TabsTrigger>
            <TabsTrigger value="chatbot" className="flex-1 py-2">
              <Bot className="h-4 w-4 md:mr-2 shrink-0" />
              <span className="hidden md:inline">Chatbot</span>
            </TabsTrigger>
            <TabsTrigger value="hours" className="flex-1 py-2">
              <Clock className="h-4 w-4 md:mr-2 shrink-0" />
              <span className="hidden md:inline">Horaires</span>
            </TabsTrigger>
          </TabsList>
        </div>

        {/* TAB 1: Données personnelles */}
        <TabsContent value="personal" className="space-y-6 min-w-0">
          <div className="w-full min-w-0">
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-primary" />
                  <CardTitle>Informations Personnelles</CardTitle>
                </div>
                <CardDescription>
                  Modifiez vos informations de profil
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...profileForm}>
                  <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField control={profileForm.control} name="firstName" render={({
                      field
                    }) => <FormItem>
                            <FormLabel>Prénom</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>} />
                      <FormField control={profileForm.control} name="lastName" render={({
                      field
                    }) => <FormItem>
                            <FormLabel>Nom</FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>} />
                    </div>
                    
                    <FormField control={profileForm.control} name="email" render={({
                    field
                  }) => <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input {...field} type="email" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>} />
                    
                    <Button type="submit" className="w-full" disabled={profileForm.formState.isSubmitting}>
                      {profileForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                      Mettre à jour le profil
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TAB 2: Sécurité */}
        <TabsContent value="security" className="space-y-6 min-w-0">
          <div className="w-full min-w-0">
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-primary" />
                  <CardTitle>Sécurité</CardTitle>
                </div>
                <CardDescription>
                  Paramètres de sécurité de votre compte
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {!showPasswordForm ? <Button variant="outline" className="w-full" onClick={() => setShowPasswordForm(true)}>
                    <Lock className="mr-2 h-4 w-4" />
                    Changer le mot de passe
                  </Button> : <Form {...passwordForm}>
                    <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                      <FormField control={passwordForm.control} name="currentPassword" render={({
                    field
                  }) => <FormItem>
                            <FormLabel>Mot de passe actuel</FormLabel>
                            <FormControl>
                              <Input {...field} type="password" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>} />
                      
                      <FormField control={passwordForm.control} name="newPassword" render={({
                    field
                  }) => <FormItem>
                            <FormLabel>Nouveau mot de passe</FormLabel>
                            <FormControl>
                              <Input {...field} type="password" />
                            </FormControl>
                            <FormMessage />
                            <div className="mt-2">
                              <PasswordStrengthIndicator password={field.value || ''} onValidityChange={setIsPasswordValid} />
                            </div>
                          </FormItem>} />
                      
                      <FormField control={passwordForm.control} name="confirmPassword" render={({
                    field
                  }) => <FormItem>
                            <FormLabel>Confirmer le mot de passe</FormLabel>
                            <FormControl>
                              <Input {...field} type="password" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>} />
                      
                      <div className="flex flex-col sm:flex-row gap-2 pt-2">
                        <Button type="submit" className="flex-1 w-full sm:w-auto" disabled={passwordForm.formState.isSubmitting || !isPasswordValid}>
                          {passwordForm.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                          Changer le mot de passe
                        </Button>
                        <Button type="button" variant="outline" className="w-full sm:w-auto" onClick={() => {
                      setShowPasswordForm(false);
                      passwordForm.reset();
                    }}>
                          Annuler
                        </Button>
                      </div>
                    </form>
                  </Form>}
                
                <Button variant="outline" className="w-full text-left justify-start h-auto py-3 px-4 whitespace-normal" disabled>
                  <div className="flex flex-col items-start gap-1">
                    <span className="font-medium">Activer l'authentification à deux facteurs</span>
                    <span className="text-xs text-muted-foreground">Cette fonctionnalité sera bientôt disponible pour renforcer la sécurité de votre compte.</span>
                  </div>
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* TAB 3: Général (Restaurant) */}
        <TabsContent value="general" className="space-y-6 min-w-0">
          <div className="w-full min-w-0">
            {isLoadingSettings ? <Card>
                <CardHeader>
                  <Skeleton className="h-8 w-64" />
                  <Skeleton className="h-4 w-96" />
                </CardHeader>
                <CardContent className="space-y-6">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card> : <Card>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Store className="h-5 w-5 text-primary" />
                    <CardTitle>Informations du Restaurant</CardTitle>
                  </div>
                  <CardDescription>
                    Nom et adresse de votre établissement
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="restaurant-name">Nom du restaurant</Label>
                    <Input id="restaurant-name" value={restaurantName} onChange={e => setRestaurantName(e.target.value)} placeholder="Le Gourmet" />
                  </div>

                  <div className="space-y-4 pt-4">
                    <Label className="text-base">Adresse</Label>
                    
                    <div className="space-y-2">
                      <Label htmlFor="address-street" className="text-sm text-muted-foreground">Rue</Label>
                      <AddressAutocomplete 
                        id="address-street" 
                        value={addressStreet} 
                        onChange={setAddressStreet}
                        onAddressSelect={(addr) => {
                          setAddressStreet(addr.street);
                          setAddressPostalCode(addr.postalCode);
                          setAddressCity(addr.city);
                          setLongitude(addr.longitude);
                          setLatitude(addr.latitude);
                        }}
                        placeholder="123 Rue de la Paix"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="address-postal" className="text-sm text-muted-foreground">Code postal</Label>
                        <Input id="address-postal" value={addressPostalCode} onChange={e => setAddressPostalCode(e.target.value)} placeholder="75001" />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="address-city" className="text-sm text-muted-foreground">Ville</Label>
                        <Input id="address-city" value={addressCity} onChange={e => setAddressCity(e.target.value)} placeholder="Paris" />
                      </div>
                    </div>
                  </div>

                  {/* SIRET */}
                  <div className="space-y-2 pt-4 border-t">
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-primary" />
                      <Label htmlFor="siret">Numéro SIRET</Label>
                    </div>
                    <div className="relative">
                      <Input id="siret" value={siret} onChange={e => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 14);
                    setSiret(value);
                    setSiretValid(null);
                    setSiretInfo(null);
                  }} onBlur={() => validateSiret(siret)} placeholder="12345678901234" maxLength={14} className="pr-10" />
                      {siretLoading && <Loader2 className="absolute right-3 top-3 h-4 w-4 animate-spin text-muted-foreground" />}
                      {siretValid === true && <CheckCircle className="absolute right-3 top-3 h-4 w-4 text-green-500" />}
                      {siretValid === false && <AlertCircle className="absolute right-3 top-3 h-4 w-4 text-destructive" />}
                    </div>
                    {siretInfo && <p className="text-sm text-green-600 flex items-center gap-1">
                        <CheckCircle className="h-3 w-3" />
                        {siretInfo}
                      </p>}
                    {siretValid === false && <p className="text-sm text-destructive">SIRET invalide ou introuvable</p>}
                    <p className="text-xs text-muted-foreground">14 chiffres - Vérification automatique auprès de l'INSEE</p>
                  </div>

                  <Button onClick={handleSaveRestaurantSettings} disabled={isUpdating} className="w-full mt-4">
                    <Save className="h-4 w-4 mr-2" />
                    {isUpdating ? 'Enregistrement...' : 'Enregistrer'}
                  </Button>

                  {/* Zone de danger - Suppression du compte */}
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
                </CardContent>
              </Card>}
          </div>
        </TabsContent>

        {/* TAB 4: Chatbot */}
        <TabsContent value="chatbot" className="space-y-6 min-w-0">
          <div className="w-full min-w-0">
            {isLoadingSettings ? <Card>
                <CardHeader>
                  <Skeleton className="h-8 w-64" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card> : <Card>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Bot className="h-5 w-5 text-primary" />
                    <CardTitle>Configuration du Chatbot</CardTitle>
                  </div>
                  <CardDescription>
                    Personnalisez votre assistant virtuel
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Chatbot Name & Active Status */}
                  <div className="space-y-4 border-b pb-6">
                    <div className="space-y-2">
                      <Label htmlFor="chatbot-name">Nom du chatbot</Label>
                      <Input id="chatbot-name" value={chatbotName} onChange={e => setChatbotName(e.target.value)} placeholder="ChatFood" disabled={isStarterPlan} className={isStarterPlan ? 'bg-muted cursor-not-allowed' : ''} />
                      {isStarterPlan && <p className="text-xs text-muted-foreground">
                          💡 Le nom "ChatFood" est fixe pour le plan Starter. Passez au plan Pro pour le personnaliser.
                        </p>}
                    </div>

                    <div className="flex items-center justify-between rounded-lg border border-border p-4">
                      <div className="space-y-0.5">
                        <Label htmlFor="chatbot-active">Chatbot actif</Label>
                        <p className="text-sm text-muted-foreground">
                          Activer ou désactiver le chatbot
                        </p>
                        {!hasCatalogue && (
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
                        disabled={!hasCatalogue}
                      />
                    </div>

                    {/* WhatsApp Connection - right after chatbot active */}
                    <div className="space-y-3 pt-4">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5 text-green-500" />
                        <span className="font-medium">Connexion WhatsApp Business</span>
                      </div>
                      
                      <div className="p-4 rounded-lg border border-green-500/20 bg-green-500/5">
                        {whatsappLoading ? <Skeleton className="h-10 w-full" /> : integration?.status === 'active' ? <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-green-600">
                              <CheckCircle className="h-5 w-5" />
                              <span>Connecté : {integration.display_phone_number || integration.verified_name || 'WhatsApp Business'}</span>
                            </div>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={async () => {
                                try {
                                  // Update whatsapp_integrations status to inactive
                                  await supabase
                                    .from('whatsapp_integrations')
                                    .update({ status: 'inactive' })
                                    .eq('user_id', user?.id);
                                  
                                  // Only disable chatbot, keep all data in restaurant_settings
                                  await supabase
                                    .from('restaurant_settings')
                                    .update({ chatbot_active: false })
                                    .eq('user_id', user?.id);
                                  
                                  setChatbotActive(false);
                                  
                                  refetchWhatsApp();
                                  toast({
                                    title: "WhatsApp déconnecté",
                                  });
                                } catch (error) {
                                  toast({
                                    title: "Erreur",
                                    description: "Impossible de déconnecter WhatsApp.",
                                    variant: "destructive",
                                  });
                                }
                              }}
                              className="text-destructive hover:text-destructive"
                            >
                              Déconnecter
                            </Button>
                          </div> : <div className="space-y-3">
                            <p className="text-sm text-muted-foreground">
                              Connectez votre numéro WhatsApp Business pour recevoir les commandes de vos clients.
                            </p>
                            <WhatsAppOnboardingButton existingIntegration={integration} onSuccess={() => refetchWhatsApp()} />
                          </div>}
                      </div>
                    </div>
                  </div>

                  {/* Order Time Settings */}
                  <div className="space-y-4 border-b pb-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-primary" />
                        <h3 className="font-medium">Temps de commande</h3>
                      </div>
                      {isStarterPlan && <Badge variant="outline" className="bg-background">
                          <Lock className="h-3 w-3 mr-1" /> 30 min
                        </Badge>}
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border">
                      <span className="text-sm font-medium">Annoncer le temps d'attente</span>
                      <Switch checked={orderTimeEnabled} onCheckedChange={setOrderTimeEnabled} disabled={isStarterPlan} />
                    </div>

                    {orderTimeEnabled && <div className="space-y-2 animate-in slide-in-from-top-2 duration-200">
                        <Label>Temps d'attente (minutes)</Label>
                        <Input type="number" min={5} max={120} value={orderTimeMinutes} onChange={e => setOrderTimeMinutes(parseInt(e.target.value) || 15)} disabled={isStarterPlan} />
                        <p className="text-xs text-muted-foreground bg-blue-50 dark:bg-blue-900/20 p-2 rounded text-blue-600 dark:text-blue-400 flex gap-2 items-start">
                          <Lightbulb className="h-3 w-3 mt-0.5 shrink-0" />
                          <span>Le client sera informé qu'il pourra récupérer sa commande dans {orderTimeMinutes} minutes</span>
                        </p>
                        {isStarterPlan && <p className="text-xs text-muted-foreground italic">
                            * Fixé à 30 min pour le plan Starter. Passez à Pro pour modifier.
                          </p>}
                      </div>}
                  </div>

                  {/* Manual Confirmation Settings */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-primary" />
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">Confirmation manuelle</h3>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <HelpCircle className="h-4 w-4 text-muted-foreground cursor-help" />
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs">
                                <p>Le client recevra un premier message confirmant que la commande vous a été envoyée. Il en recevra un second une fois que vous aurez vu et validé la commande.</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </div>
                      </div>
                      {isStarterPlan && <Badge variant="outline" className="bg-background">
                          <Lock className="h-3 w-3 mr-1" /> Auto
                        </Badge>}
                    </div>

                    <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border">
                      <div className="space-y-0.5">
                        <span className="text-sm font-medium">Activer la validation manuelle</span>
                        <p className="text-xs text-muted-foreground">
                          Le client recevra une confirmation en deux temps
                        </p>
                        {isStarterPlan && <p className="text-xs text-amber-600 italic mt-1">
                            * Désactivé pour le plan Starter (Approbation automatique).
                          </p>}
                      </div>
                      <Switch checked={manualConfirmation} onCheckedChange={setManualConfirmation} disabled={isStarterPlan} />
                    </div>
                  </div>

                  {/* WhatsApp Connection */}
                  

                  <Button onClick={handleSaveRestaurantSettings} disabled={isUpdating} className="w-full mt-4">
                    <Save className="h-4 w-4 mr-2" />
                    {isUpdating ? 'Enregistrement...' : 'Enregistrer'}
                  </Button>
                </CardContent>
              </Card>}
          </div>
        </TabsContent>

        {/* TAB 5: Horaires */}
        <TabsContent value="hours" className="space-y-6 min-w-0">
          <div className="w-full min-w-0">
            {isLoadingSettings ? <Card>
                <CardHeader>
                  <Skeleton className="h-8 w-64" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-32 w-full" />
                </CardContent>
              </Card> : <Card>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <Clock className="h-5 w-5 text-primary" />
                    <CardTitle>Horaires d'ouverture</CardTitle>
                  </div>
                  <CardDescription>
                    Indiquez les horaires au format libre (ex: 12h-14h, 19h-23h)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {DAYS_OF_WEEK.map(day => {
                const hours = openingHours.find(h => h.day === day) || {
                  day,
                  slot1: '',
                  slot2: ''
                };
                return <div key={day} className="space-y-3 p-4 rounded-lg border">
                        <span className="font-medium capitalize text-base">{day}</span>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Service midi</Label>
                            <Input value={hours.slot1} onChange={e => handleSimpleTimeChange(day, 'slot1', e.target.value)} placeholder="12h-14h" className="text-sm" />
                          </div>
                          
                          <div className="space-y-1">
                            <Label className="text-xs text-muted-foreground">Service soir</Label>
                            <Input value={hours.slot2} onChange={e => handleSimpleTimeChange(day, 'slot2', e.target.value)} placeholder="19h-23h" className="text-sm" />
                          </div>
                        </div>
                      </div>;
              })}

                  <Button onClick={handleSaveRestaurantSettings} disabled={isUpdating} className="w-full mt-4">
                    <Save className="h-4 w-4 mr-2" />
                    {isUpdating ? 'Enregistrement...' : 'Enregistrer'}
                  </Button>
                </CardContent>
              </Card>}
          </div>
        </TabsContent>
      </Tabs>
    </div>;
};
export default Settings;