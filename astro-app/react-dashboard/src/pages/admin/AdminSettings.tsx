import React, { useState, useEffect } from 'react';
import { Settings2, Shield, Mail, Database, Sparkles } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/admin/ConfirmDialog';
import { useAuth } from '@/contexts/AuthContext';
import { FunctionsHttpError } from '@supabase/supabase-js';
import { StarterPromptTemplateEditor } from '@/components/admin/StarterPromptTemplateEditor';

interface Settings {
  allow_registration: boolean;
  max_login_attempts: number;
  block_duration_minutes: number;
  email_notifications_signup: boolean;
  email_notifications_security: boolean;
  maintenance_mode: boolean;
}

export default function AdminSettings() {
  const { session, loading: authLoading } = useAuth();
  const [settings, setSettings] = useState<Settings>({
    allow_registration: true,
    max_login_attempts: 5,
    block_duration_minutes: 15,
    email_notifications_signup: true,
    email_notifications_security: true,
    maintenance_mode: false
  });
  const [loading, setLoading] = useState(true);
  const [savingSection, setSavingSection] = useState<string | null>(null);
  const [cleanupDialogOpen, setCleanupDialogOpen] = useState(false);
  const [maintenanceDialogOpen, setMaintenanceDialogOpen] = useState(false);
  const [pendingMaintenance, setPendingMaintenance] = useState(false);

  useEffect(() => {
    if (!authLoading && session) {
      loadSettings();
    } else if (!authLoading && !session) {
      toast.error('Session expirée. Veuillez vous reconnecter.');
      setLoading(false);
    }
  }, [authLoading, session]);

  const loadSettings = async () => {
    try {
      // Get fresh session token
      const { data: { session: freshSession }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !freshSession) {
        toast.error('Session expirée. Veuillez vous reconnecter.');
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke('admin-get-settings', {
        headers: {
          Authorization: `Bearer ${freshSession.access_token}`
        }
      });

      if (error) {
        if (error instanceof FunctionsHttpError) {
          const status = error.context?.status;
          if (status === 401 || status === 403) {
            toast.error('Session expirée ou accès refusé. Veuillez vous reconnecter.');
            return;
          }
        }
        throw error;
      }

      setSettings({
        allow_registration: data.allow_registration ?? true,
        max_login_attempts: data.max_login_attempts ?? 5,
        block_duration_minutes: data.block_duration_minutes ?? 15,
        email_notifications_signup: data.email_notifications_signup ?? true,
        email_notifications_security: data.email_notifications_security ?? true,
        maintenance_mode: data.maintenance_mode ?? false
      });
    } catch (error: any) {
      console.error('Error loading settings:', error);
      toast.error('Erreur lors du chargement des paramètres');
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (updates: Partial<Settings>, section: string) => {
    setSavingSection(section);
    try {
      // Get fresh session token
      const { data: { session: freshSession }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !freshSession) {
        toast.error('Session expirée. Veuillez vous reconnecter.');
        setSavingSection(null);
        return;
      }

      const { error } = await supabase.functions.invoke('admin-update-settings', {
        body: updates,
        headers: {
          Authorization: `Bearer ${freshSession.access_token}`
        }
      });

      if (error) {
        if (error instanceof FunctionsHttpError) {
          const status = error.context?.status;
          if (status === 401 || status === 403) {
            toast.error('Session expirée ou accès refusé. Veuillez vous reconnecter.');
            return;
          }
        }
        throw error;
      }

      setSettings(prev => ({ ...prev, ...updates }));
      toast.success('Paramètres enregistrés avec succès');
    } catch (error: any) {
      console.error('Error updating settings:', error);
      toast.error(error.message || 'Erreur lors de la sauvegarde des paramètres');
    } finally {
      setSavingSection(null);
    }
  };

  const handleSaveSecuritySettings = () => {
    updateSettings({
      allow_registration: settings.allow_registration,
      max_login_attempts: settings.max_login_attempts,
      block_duration_minutes: settings.block_duration_minutes
    }, 'security');
  };

  const handleSaveEmailSettings = () => {
    updateSettings({
      email_notifications_signup: settings.email_notifications_signup,
      email_notifications_security: settings.email_notifications_security
    }, 'email');
  };

  const handleCleanupLogs = async () => {
    setCleanupDialogOpen(false);
    setSavingSection('cleanup');
    try {
      // Get fresh session token
      const { data: { session: freshSession }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !freshSession) {
        toast.error('Session expirée. Veuillez vous reconnecter.');
        setSavingSection(null);
        return;
      }

      const { data, error } = await supabase.functions.invoke('admin-cleanup-logs', {
        headers: {
          Authorization: `Bearer ${freshSession.access_token}`
        }
      });

      if (error) throw error;

      const stats = data.stats;
      toast.success(
        `Nettoyage terminé : ${stats.login_attempts_deleted} tentatives de connexion et ${stats.security_blocks_deleted} blocages supprimés`
      );
    } catch (error: any) {
      console.error('Error cleaning up logs:', error);
      toast.error(error.message || 'Erreur lors du nettoyage des logs');
    } finally {
      setSavingSection(null);
    }
  };

  const handleExportData = async () => {
    setSavingSection('export');
    try {
      // Get fresh session token
      const { data: { session: freshSession }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError || !freshSession) {
        toast.error('Session expirée. Veuillez vous reconnecter.');
        setSavingSection(null);
        return;
      }

      const response = await fetch(`https://dcwfgxbwpecnjbhrhrib.supabase.co/functions/v1/admin-export-users`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${freshSession.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `users-export-${new Date().toISOString()}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast.success('Données exportées avec succès');
    } catch (error: any) {
      console.error('Error exporting data:', error);
      toast.error('Erreur lors de l\'export des données');
    } finally {
      setSavingSection(null);
    }
  };

  const handleMaintenanceModeToggle = (enabled: boolean) => {
    if (enabled) {
      setPendingMaintenance(enabled);
      setMaintenanceDialogOpen(true);
    } else {
      updateSettings({ maintenance_mode: false }, 'maintenance');
    }
  };

  const confirmMaintenanceMode = () => {
    setMaintenanceDialogOpen(false);
    updateSettings({ maintenance_mode: true }, 'maintenance');
  };

  if (loading || authLoading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Paramètres Système</h1>
        <p className="text-muted-foreground mt-2">
          Configurer les paramètres généraux de la plateforme
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              <CardTitle>Paramètres de Sécurité</CardTitle>
            </div>
            <CardDescription>
              Gérer les règles de sécurité et d'authentification
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Autoriser les inscriptions</Label>
                <div className="text-sm text-muted-foreground">
                  Permettre aux nouveaux utilisateurs de créer un compte
                </div>
              </div>
              <Switch 
                checked={settings.allow_registration}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, allow_registration: checked }))}
              />
            </div>
            <Separator />
            <div className="space-y-2">
              <Label htmlFor="max-attempts">
                Nombre maximum de tentatives de connexion
              </Label>
              <Input
                id="max-attempts"
                type="number"
                value={settings.max_login_attempts}
                onChange={(e) => setSettings(prev => ({ ...prev, max_login_attempts: parseInt(e.target.value) || 5 }))}
                className="max-w-xs"
                min={1}
                max={20}
              />
              <div className="text-sm text-muted-foreground">
                Après ce nombre, le compte sera temporairement bloqué
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <Label htmlFor="block-duration">Durée de blocage (minutes)</Label>
              <Input
                id="block-duration"
                type="number"
                value={settings.block_duration_minutes}
                onChange={(e) => setSettings(prev => ({ ...prev, block_duration_minutes: parseInt(e.target.value) || 15 }))}
                className="max-w-xs"
                min={1}
                max={1440}
              />
              <div className="text-sm text-muted-foreground">
                Durée pendant laquelle un compte reste bloqué après trop de tentatives
              </div>
            </div>
            <Button 
              onClick={handleSaveSecuritySettings}
              disabled={savingSection === 'security'}
            >
              {savingSection === 'security' ? 'Enregistrement...' : 'Sauvegarder les modifications'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              <CardTitle>Configuration Email</CardTitle>
            </div>
            <CardDescription>Paramètres des notifications par email</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notifications d'inscription</Label>
                <div className="text-sm text-muted-foreground">
                  Envoyer un email aux admins lors d'une nouvelle inscription
                </div>
              </div>
              <Switch 
                checked={settings.email_notifications_signup}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, email_notifications_signup: checked }))}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Alertes de sécurité</Label>
                <div className="text-sm text-muted-foreground">
                  Notifier les admins en cas d'activité suspecte
                </div>
              </div>
              <Switch 
                checked={settings.email_notifications_security}
                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, email_notifications_security: checked }))}
              />
            </div>
            <Button 
              onClick={handleSaveEmailSettings}
              disabled={savingSection === 'email'}
            >
              {savingSection === 'email' ? 'Enregistrement...' : 'Sauvegarder les modifications'}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              <CardTitle>Maintenance</CardTitle>
            </div>
            <CardDescription>Outils de maintenance et nettoyage</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Mode maintenance</Label>
                <div className="text-sm text-muted-foreground">
                  Désactiver temporairement l'accès à la plateforme pour les utilisateurs
                </div>
              </div>
              <Switch 
                checked={settings.maintenance_mode}
                onCheckedChange={handleMaintenanceModeToggle}
                disabled={savingSection === 'maintenance'}
              />
            </div>
            <Separator />
            <div className="space-y-2">
              <Label>Nettoyer les anciens logs</Label>
              <div className="text-sm text-muted-foreground mb-2">
                Supprimer les logs de connexion de plus de 24 heures et les blocages expirés
              </div>
              <Button 
                variant="outline" 
                onClick={() => setCleanupDialogOpen(true)}
                disabled={savingSection === 'cleanup'}
              >
                {savingSection === 'cleanup' ? 'Nettoyage...' : 'Nettoyer maintenant'}
              </Button>
            </div>
            <Separator />
            <div className="space-y-2">
              <Label>Export des données</Label>
              <div className="text-sm text-muted-foreground mb-2">
                Télécharger toutes les données utilisateurs au format CSV
              </div>
              <Button 
                variant="outline" 
                onClick={handleExportData}
                disabled={savingSection === 'export'}
              >
                {savingSection === 'export' ? 'Export en cours...' : 'Exporter les données'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Starter Prompt Template Editor */}
        <StarterPromptTemplateEditor />
      </div>

      <ConfirmDialog
        open={cleanupDialogOpen}
        onOpenChange={setCleanupDialogOpen}
        title="Nettoyer les logs"
        description="Êtes-vous sûr de vouloir supprimer les anciens logs ? Cette action est irréversible."
        onConfirm={handleCleanupLogs}
        variant="default"
      />

      <ConfirmDialog
        open={maintenanceDialogOpen}
        onOpenChange={setMaintenanceDialogOpen}
        title="Activer le mode maintenance"
        description="Le mode maintenance empêchera tous les utilisateurs (sauf les admins) d'accéder à la plateforme. Voulez-vous continuer ?"
        onConfirm={confirmMaintenanceMode}
        variant="default"
      />
    </div>
  );
}
