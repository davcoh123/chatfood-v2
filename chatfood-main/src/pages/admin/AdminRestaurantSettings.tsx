import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Settings, Users, RefreshCw, Loader2, Eye, EyeOff, MessageSquare, Unplug, Plus, Save, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { RestaurantSettings } from '@/components/dashboard/RestaurantSettings';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from 'sonner';
import { WhatsAppOnboardingButton } from '@/components/dashboard/WhatsAppOnboardingButton';

interface UserProfile {
  user_id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
}

interface WhatsAppData {
  phone_number_id: string;
  waba_id: string;
  access_token: string;
  display_phone_number: string;
  verified_name: string;
  status: string;
  registration_status: string;
  business_id: string;
  source: 'integration' | 'settings' | 'manual';
}

const emptyWhatsAppData: WhatsAppData = {
  phone_number_id: '',
  waba_id: '',
  access_token: '',
  display_phone_number: '',
  verified_name: '',
  status: 'active',
  registration_status: 'pending',
  business_id: '',
  source: 'manual',
};

export default function AdminRestaurantSettings() {
  const queryClient = useQueryClient();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [registeringWhatsApp, setRegisteringWhatsApp] = useState(false);
  const [showToken, setShowToken] = useState(false);
  const [saving, setSaving] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [loadingWhatsApp, setLoadingWhatsApp] = useState(false);
  
  // Données WhatsApp éditables (fusion des deux tables)
  const [whatsappData, setWhatsappData] = useState<WhatsAppData | null>(null);
  const [originalData, setOriginalData] = useState<WhatsAppData | null>(null);
  const [isCreatingManually, setIsCreatingManually] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    if (selectedUserId) {
      fetchWhatsAppData();
    } else {
      setWhatsappData(null);
      setOriginalData(null);
      setIsCreatingManually(false);
    }
  }, [selectedUserId]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('user_id, email, first_name, last_name')
        .order('email', { ascending: true });

      if (error) throw error;
      setUsers(data || []);
    } catch (error: any) {
      console.error('Error fetching users:', error);
      toast.error('Erreur lors du chargement des utilisateurs');
    } finally {
      setLoading(false);
    }
  };

  const fetchWhatsAppData = async () => {
    if (!selectedUserId) return;
    
    setLoadingWhatsApp(true);
    setIsCreatingManually(false);
    
    try {
      // Récupérer les données des deux tables en parallèle
      const [integrationRes, settingsRes] = await Promise.all([
        supabase
          .from('whatsapp_integrations')
          .select('*')
          .eq('user_id', selectedUserId)
          .order('updated_at', { ascending: false })
          .maybeSingle(),
        supabase
          .from('restaurant_settings')
          .select('phone_number_id, whatsapp_access_token, whatsapp_business_id')
          .eq('user_id', selectedUserId)
          .maybeSingle()
      ]);

      const integration = integrationRes.data;
      const settings = settingsRes.data;

      // Fusionner les données : priorité à whatsapp_integrations
      if (integration) {
        const data: WhatsAppData = {
          phone_number_id: integration.phone_number_id || '',
          waba_id: integration.waba_id || '',
          access_token: integration.access_token || '',
          display_phone_number: integration.display_phone_number || '',
          verified_name: integration.verified_name || '',
          status: integration.status || 'pending',
          registration_status: integration.registration_status || 'pending',
          business_id: integration.business_id || '',
          source: 'integration',
        };
        setWhatsappData(data);
        setOriginalData(data);
      } else if (settings?.phone_number_id || settings?.whatsapp_access_token) {
        // Données seulement dans restaurant_settings (cas Pizza Nova)
        const data: WhatsAppData = {
          phone_number_id: settings.phone_number_id || '',
          waba_id: '',
          access_token: settings.whatsapp_access_token || '',
          display_phone_number: '',
          verified_name: '',
          status: 'active',
          registration_status: 'registered',
          business_id: settings.whatsapp_business_id || '',
          source: 'settings',
        };
        setWhatsappData(data);
        setOriginalData(data);
      } else {
        setWhatsappData(null);
        setOriginalData(null);
      }
    } catch (error) {
      console.error('Error fetching WhatsApp data:', error);
      toast.error('Erreur lors du chargement des données WhatsApp');
    } finally {
      setLoadingWhatsApp(false);
    }
  };

  const getUserDisplayName = (user: UserProfile) => {
    if (user.first_name && user.last_name) {
      return `${user.first_name} ${user.last_name} (${user.email})`;
    }
    return user.email;
  };

  const handleCreateManually = () => {
    setWhatsappData({ ...emptyWhatsAppData });
    setOriginalData(null);
    setIsCreatingManually(true);
  };

  const handleFieldChange = (field: keyof WhatsAppData, value: string) => {
    if (!whatsappData) return;
    setWhatsappData({ ...whatsappData, [field]: value });
  };

  const hasChanges = () => {
    if (!whatsappData) return false;
    if (isCreatingManually) return true;
    if (!originalData) return true;
    return JSON.stringify(whatsappData) !== JSON.stringify(originalData);
  };

  const handleSaveAll = async () => {
    if (!selectedUserId || !whatsappData) return;
    
    // Pas de validation restrictive pour l'admin - permet de sauvegarder des données partielles ou vides
    setSaving(true);
    try {
      // Si création manuelle ou source = 'settings', on crée/met à jour whatsapp_integrations
      if (isCreatingManually || originalData?.source === 'settings') {
        // Vérifier si une entrée existe déjà
        const { data: existing } = await supabase
          .from('whatsapp_integrations')
          .select('id')
          .eq('user_id', selectedUserId)
          .maybeSingle();

        if (existing) {
          // Update
          await supabase
            .from('whatsapp_integrations')
            .update({
              phone_number_id: whatsappData.phone_number_id,
              waba_id: whatsappData.waba_id || whatsappData.phone_number_id,
              access_token: whatsappData.access_token,
              display_phone_number: whatsappData.display_phone_number || null,
              verified_name: whatsappData.verified_name || null,
              status: whatsappData.status,
              registration_status: whatsappData.registration_status,
              business_id: whatsappData.business_id || null,
              updated_at: new Date().toISOString(),
            })
            .eq('user_id', selectedUserId);
        } else {
          // Insert
          await supabase
            .from('whatsapp_integrations')
            .insert({
              user_id: selectedUserId,
              phone_number_id: whatsappData.phone_number_id,
              waba_id: whatsappData.waba_id || whatsappData.phone_number_id,
              access_token: whatsappData.access_token,
              display_phone_number: whatsappData.display_phone_number || null,
              verified_name: whatsappData.verified_name || null,
              status: whatsappData.status,
              registration_status: whatsappData.registration_status,
              business_id: whatsappData.business_id || null,
            });
        }
      } else {
        // Update whatsapp_integrations existant
        await supabase
          .from('whatsapp_integrations')
          .update({
            phone_number_id: whatsappData.phone_number_id,
            waba_id: whatsappData.waba_id,
            access_token: whatsappData.access_token,
            display_phone_number: whatsappData.display_phone_number || null,
            verified_name: whatsappData.verified_name || null,
            status: whatsappData.status,
            registration_status: whatsappData.registration_status,
            business_id: whatsappData.business_id || null,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', selectedUserId);
      }

      // Toujours synchroniser restaurant_settings
      await supabase
        .from('restaurant_settings')
        .update({
          phone_number_id: whatsappData.phone_number_id,
          whatsapp_access_token: whatsappData.access_token,
          whatsapp_business_id: whatsappData.business_id || null,
          chatbot_active: whatsappData.status === 'active',
        })
        .eq('user_id', selectedUserId);

      toast.success('Données WhatsApp enregistrées');
      setIsCreatingManually(false);
      await fetchWhatsAppData();
    } catch (error: any) {
      console.error('Error saving WhatsApp data:', error);
      toast.error(error.message || 'Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  const handleReRegisterWhatsApp = async () => {
    if (!selectedUserId) return;
    
    setRegisteringWhatsApp(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('Session expirée');
        return;
      }

      const { data, error } = await supabase.functions.invoke('admin-register-whatsapp', {
        body: { user_id: selectedUserId },
        headers: { Authorization: `Bearer ${session.access_token}` }
      });

      if (error) throw error;

      if (data?.success) {
        toast.success(data.message || 'Numéro WhatsApp enregistré avec succès');
        await fetchWhatsAppData();
      } else if (data?.error) {
        toast.error(data.error);
      }
    } catch (error: any) {
      console.error('Error re-registering WhatsApp:', error);
      toast.error(error.message || 'Erreur lors de l\'enregistrement');
    } finally {
      setRegisteringWhatsApp(false);
    }
  };

  const handleDisconnectWhatsApp = async () => {
    if (!selectedUserId) return;
    setDisconnecting(true);
    try {
      await supabase
        .from('whatsapp_integrations')
        .update({ status: 'inactive' })
        .eq('user_id', selectedUserId);
      
      await supabase
        .from('restaurant_settings')
        .update({ chatbot_active: false })
        .eq('user_id', selectedUserId);
      
      toast.success('WhatsApp déconnecté');
      // Forcer le refetch pour que RestaurantSettings se mette à jour
      await queryClient.refetchQueries({ queryKey: ['whatsapp-integration', selectedUserId] });
      // Mettre à jour l'état local aussi
      if (whatsappData) {
        setWhatsappData({ ...whatsappData, status: 'inactive' });
        setOriginalData({ ...whatsappData, status: 'inactive' });
      }
      await fetchWhatsAppData();
    } catch (error) {
      toast.error('Erreur lors de la déconnexion');
    } finally {
      setDisconnecting(false);
    }
  };

  // Suppression complète de l'intégration WhatsApp (admin only)
  const handleDeleteWhatsApp = async () => {
    if (!selectedUserId) return;
    
    const confirmed = window.confirm(
      'Êtes-vous sûr de vouloir supprimer TOUTES les données WhatsApp de cet utilisateur ?\n\nCette action est irréversible et supprimera :\n- L\'intégration WhatsApp\n- Les tokens et IDs associés'
    );
    
    if (!confirmed) return;
    
    setDeleting(true);
    try {
      // Supprimer l'entrée whatsapp_integrations
      await supabase
        .from('whatsapp_integrations')
        .delete()
        .eq('user_id', selectedUserId);
      
      // Nettoyer les champs WhatsApp dans restaurant_settings
      await supabase
        .from('restaurant_settings')
        .update({ 
          chatbot_active: false,
          phone_number_id: null,
          whatsapp_access_token: null,
          whatsapp_business_id: null,
        })
        .eq('user_id', selectedUserId);
      
      toast.success('Données WhatsApp supprimées');
      // Forcer le refetch pour que RestaurantSettings se mette à jour
      await queryClient.refetchQueries({ queryKey: ['whatsapp-integration', selectedUserId] });
      setWhatsappData(null);
      setOriginalData(null);
      setIsCreatingManually(false);
    } catch (error) {
      console.error('Error deleting WhatsApp:', error);
      toast.error('Erreur lors de la suppression');
    } finally {
      setDeleting(false);
    }
  };

  const handleCancelCreate = () => {
    setIsCreatingManually(false);
    fetchWhatsAppData();
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-2">
          <Settings className="h-8 w-8 text-primary" />
          Paramètres Techniques Restaurant
        </h1>
        <p className="text-muted-foreground mt-2">
          Gérez les paramètres techniques WhatsApp pour chaque utilisateur
        </p>
      </div>

      {/* User Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Sélectionner un utilisateur
          </CardTitle>
          <CardDescription>
            Choisissez l'utilisateur pour lequel vous souhaitez modifier les paramètres techniques
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="user-select">Utilisateur</Label>
            <Select value={selectedUserId} onValueChange={setSelectedUserId}>
              <SelectTrigger id="user-select">
                <SelectValue placeholder="Sélectionnez un utilisateur..." />
              </SelectTrigger>
              <SelectContent>
                {users.map((user) => (
                  <SelectItem key={user.user_id} value={user.user_id}>
                    {getUserDisplayName(user)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {!selectedUserId && (
            <Alert>
              <AlertDescription>
                Sélectionnez un utilisateur pour afficher et modifier ses paramètres techniques.
              </AlertDescription>
            </Alert>
          )}

          {/* Section WhatsApp complète */}
          {selectedUserId && (
            <div className="pt-4 border-t space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-green-600" />
                  <span className="font-medium">Intégration WhatsApp</span>
                  {whatsappData && !isCreatingManually && (
                    <>
                      <Badge variant={whatsappData.status === 'active' ? 'default' : 'secondary'}>
                        {whatsappData.status}
                      </Badge>
                      {whatsappData.source === 'settings' && (
                        <Badge variant="outline" className="text-amber-600 border-amber-600">
                          Données partielles (restaurant_settings)
                        </Badge>
                      )}
                    </>
                  )}
                  {isCreatingManually && (
                    <Badge variant="outline" className="text-blue-600 border-blue-600">
                      Création manuelle
                    </Badge>
                  )}
                </div>
              </div>

              {loadingWhatsApp ? (
                <div className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ) : whatsappData || isCreatingManually ? (
                <div className="space-y-4">
                  {/* Ligne 1: Phone Number ID + WABA ID */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Phone Number ID *</Label>
                      <Input 
                        value={whatsappData?.phone_number_id || ''} 
                        onChange={(e) => handleFieldChange('phone_number_id', e.target.value)}
                        className="text-xs font-mono"
                        placeholder="123456789..."
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">WABA ID</Label>
                      <Input 
                        value={whatsappData?.waba_id || ''} 
                        onChange={(e) => handleFieldChange('waba_id', e.target.value)}
                        className="text-xs font-mono"
                        placeholder="123456789..."
                      />
                    </div>
                  </div>

                  {/* Ligne 2: Display Phone + Verified Name */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Numéro affiché</Label>
                      <Input 
                        value={whatsappData?.display_phone_number || ''} 
                        onChange={(e) => handleFieldChange('display_phone_number', e.target.value)}
                        className="text-xs"
                        placeholder="+33 6 12 34 56 78"
                      />
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Nom vérifié</Label>
                      <Input 
                        value={whatsappData?.verified_name || ''} 
                        onChange={(e) => handleFieldChange('verified_name', e.target.value)}
                        className="text-xs"
                        placeholder="Mon Restaurant"
                      />
                    </div>
                  </div>

                  {/* Ligne 3: Business ID */}
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Business ID</Label>
                    <Input 
                      value={whatsappData?.business_id || ''} 
                      onChange={(e) => handleFieldChange('business_id', e.target.value)}
                      className="text-xs font-mono"
                      placeholder="123456789..."
                    />
                  </div>
                  
                  {/* Ligne 4: Access Token */}
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Access Token *</Label>
                    <div className="flex gap-2">
                      <Input 
                        type={showToken ? 'text' : 'password'}
                        value={whatsappData?.access_token || ''}
                        onChange={(e) => handleFieldChange('access_token', e.target.value)}
                        className="text-xs font-mono"
                        placeholder="EAAxxxxxxx..."
                      />
                      <Button variant="outline" size="icon" onClick={() => setShowToken(!showToken)}>
                        {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>

                  {/* Ligne 5: Status + Registration Status */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Statut</Label>
                      <Select 
                        value={whatsappData?.status || 'pending'} 
                        onValueChange={(v) => handleFieldChange('status', v)}
                      >
                        <SelectTrigger className="text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="active">active</SelectItem>
                          <SelectItem value="inactive">inactive</SelectItem>
                          <SelectItem value="pending">pending</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Statut enregistrement</Label>
                      <Select 
                        value={whatsappData?.registration_status || 'pending'} 
                        onValueChange={(v) => handleFieldChange('registration_status', v)}
                      >
                        <SelectTrigger className="text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="registered">registered</SelectItem>
                          <SelectItem value="pending">pending</SelectItem>
                          <SelectItem value="failed">failed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {/* Boutons d'action */}
                  <div className="flex gap-2 pt-2 flex-wrap">
                    {/* Bouton Enregistrer tout */}
                    <Button 
                      onClick={handleSaveAll} 
                      disabled={saving || !hasChanges()}
                      size="sm"
                    >
                      {saving ? (
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4 mr-2" />
                      )}
                      Enregistrer tout
                    </Button>

                    {isCreatingManually && (
                      <Button variant="outline" size="sm" onClick={handleCancelCreate}>
                        Annuler
                      </Button>
                    )}

                    {!isCreatingManually && whatsappData && (
                      <>
                        {whatsappData.status === 'active' ? (
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={handleDisconnectWhatsApp} 
                            disabled={disconnecting}
                          >
                            {disconnecting ? (
                              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            ) : (
                              <Unplug className="h-4 w-4 mr-2" />
                            )}
                            Déconnecter
                          </Button>
                        ) : (
                        <WhatsAppOnboardingButton 
                            existingIntegration={{
                              waba_id: whatsappData.waba_id,
                              phone_number_id: whatsappData.phone_number_id,
                              status: whatsappData.status,
                              display_phone_number: whatsappData.display_phone_number || null,
                              verified_name: whatsappData.verified_name || null,
                            }} 
                            onSuccess={() => fetchWhatsAppData()} 
                          />
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleReRegisterWhatsApp}
                          disabled={registeringWhatsApp}
                        >
                          {registeringWhatsApp ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <RefreshCw className="h-4 w-4 mr-2" />
                          )}
                          Ré-enregistrer
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleDeleteWhatsApp}
                          disabled={deleting}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          {deleting ? (
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                          ) : (
                            <Trash2 className="h-4 w-4 mr-2" />
                          )}
                          Supprimer tout
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <p className="mb-3 text-sm">Aucune intégration WhatsApp pour cet utilisateur</p>
                  <div className="flex gap-2 justify-center">
                    <WhatsAppOnboardingButton onSuccess={() => fetchWhatsAppData()} />
                    <Button variant="outline" size="sm" onClick={handleCreateManually}>
                      <Plus className="h-4 w-4 mr-2" />
                      Créer manuellement
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Restaurant Settings (Admin View) */}
      {selectedUserId && (
        <RestaurantSettings userId={selectedUserId} isAdminView={true} />
      )}
    </div>
  );
}
