import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface DashboardConfigEditorProps {
  userId: string;
  sectionId: string;
  sectionType: string;
  plan: string;
  currentConfig?: {
    title?: string;
    webhook_url?: string;
    webhook_url_get?: string;
    webhook_url_post?: string;
    webhook_url_day?: string;
    webhook_url_week?: string;
    webhook_url_month?: string;
    icon?: string;
    color?: string;
  };
  isActive?: boolean;
  onSave?: () => void;
}

export function DashboardConfigEditor({
  userId,
  sectionId,
  sectionType,
  plan,
  currentConfig,
  isActive = true,
  onSave,
}: DashboardConfigEditorProps) {
  const [title, setTitle] = useState(currentConfig?.title || '');
  const [webhookUrl, setWebhookUrl] = useState(
    sectionId === 'conversations' 
      ? (currentConfig?.webhook_url_get || '') 
      : (currentConfig?.webhook_url || '')
  );
  const [webhookUrlDay, setWebhookUrlDay] = useState(
    sectionId === 'conversations' 
      ? (currentConfig?.webhook_url_post || '') 
      : (currentConfig?.webhook_url_day || '')
  );
  const [webhookUrlWeek, setWebhookUrlWeek] = useState(currentConfig?.webhook_url_week || '');
  const [webhookUrlMonth, setWebhookUrlMonth] = useState(currentConfig?.webhook_url_month || '');
  const [icon, setIcon] = useState(currentConfig?.icon || '');
  const [color, setColor] = useState(currentConfig?.color || '');
  const [active, setActive] = useState(isActive);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleTestWebhook = async () => {
    if (!webhookUrl) {
      toast({
        title: 'Erreur',
        description: 'Veuillez entrer une URL de webhook',
        variant: 'destructive',
      });
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const response = await fetch(webhookUrl, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      const data = await response.json();
      setTestResult(JSON.stringify(data, null, 2));
      
      toast({
        title: 'Test réussi',
        description: 'Le webhook a répondu correctement',
      });
    } catch (error) {
      console.error('Webhook test error:', error);
      toast({
        title: 'Erreur',
        description: 'Le webhook n\'a pas répondu',
        variant: 'destructive',
      });
      setTestResult('Erreur: Le webhook n\'a pas répondu');
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);

    try {
    const customizations = sectionId === 'reservations_calendar' 
      ? {}
      : sectionId === 'conversations'
      ? {
          webhook_url_get: webhookUrl || undefined,
          webhook_url_post: webhookUrlDay || undefined,
          refresh_interval: 120,
        }
      : {
          title: title || undefined,
          webhook_url: webhookUrl || undefined,
          icon: icon || undefined,
          color: color || undefined,
        };

      const { error } = await supabase
        .from('dashboard_configurations')
        .upsert({
          user_id: userId,
          section_id: sectionId,
          section_type: sectionType,
          plan: plan as any,
          customizations,
          is_active: active,
        }, {
          onConflict: 'user_id,section_id',
        });

      if (error) throw error;

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['dashboard-config'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-value'] });

      toast({
        title: 'Sauvegardé',
        description: 'La configuration a été mise à jour',
      });

      onSave?.();
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: 'Erreur',
        description: 'Impossible de sauvegarder la configuration',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuration: {sectionId}</CardTitle>
        <CardDescription>Personnalisez cet indicateur pour l'utilisateur</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="active">Actif</Label>
          <Switch
            id="active"
            checked={active}
            onCheckedChange={setActive}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="title">Titre personnalisé</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Laissez vide pour le titre par défaut"
          />
        </div>

        {sectionId === 'reservations_calendar' ? (
          <div className="mt-4 p-4 border rounded-lg bg-muted/50">
            <h4 className="font-semibold mb-2">📅 Webhook Hardcodé</h4>
            <p className="text-sm text-muted-foreground mb-2">
              Le webhook de réservations est configuré automatiquement :
            </p>
            <code className="text-xs bg-background p-2 rounded block break-all">
              https://n8n.chatfood.fr/webhook/full-reservations-mois-chatfood-demo
            </code>
            <p className="text-xs text-muted-foreground mt-2">
              💡 Ce webhook unique gère toutes les vues (jour, semaine, mois)
            </p>
          </div>
        ) : sectionId === 'conversations' ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="webhook-get">Webhook GET (Récupération messages)</Label>
              <Input
                id="webhook-get"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://n8n.example.com/webhook/messages"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleTestWebhook}
                disabled={!webhookUrl || isTesting}
              >
                {isTesting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Tester GET
              </Button>
              {testResult && (
                <pre className="mt-2 rounded-md bg-muted p-2 text-xs overflow-auto max-h-32">
                  {testResult}
                </pre>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="webhook-post">Webhook POST (Envoi réponses)</Label>
              <Input
                id="webhook-post"
                value={webhookUrlDay}
                onChange={(e) => setWebhookUrlDay(e.target.value)}
                placeholder="https://n8n.example.com/webhook/send"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="refresh">Intervalle de rafraîchissement (secondes)</Label>
              <Input
                id="refresh"
                type="number"
                value={120}
                disabled
                className="bg-muted"
              />
              <p className="text-xs text-muted-foreground">
                Fixé à 2 minutes (120 secondes)
              </p>
            </div>

            <div className="mt-4 p-4 border rounded-lg bg-muted/50">
              <h4 className="font-semibold mb-2">📱 Prévisualisation</h4>
              <p className="text-sm text-muted-foreground mb-2">
                L'interface affichera les conversations en temps réel avec :
              </p>
              <ul className="text-sm space-y-1 list-disc list-inside">
                <li>Panel latéral avec liste des clients</li>
                <li>Zone de messages style WhatsApp</li>
                <li>Champ de réponse en bas</li>
                <li>Rafraîchissement automatique toutes les 2 min</li>
              </ul>
            </div>
          </>
        ) : (
          <div className="space-y-2">
            <Label htmlFor="webhook">URL Webhook Zapier</Label>
            <Input
              id="webhook"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://hooks.zapier.com/..."
            />
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleTestWebhook}
                disabled={!webhookUrl || isTesting}
              >
                {isTesting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Tester
              </Button>
            </div>
            {testResult && (
              <pre className="mt-2 rounded-md bg-muted p-2 text-xs overflow-auto max-h-32">
                {testResult}
              </pre>
            )}
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="icon">Icône (nom Lucide)</Label>
          <Input
            id="icon"
            value={icon}
            onChange={(e) => setIcon(e.target.value)}
            placeholder="TrendingUp, Calendar, etc."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="color">Couleur (classe Tailwind)</Label>
          <Input
            id="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            placeholder="text-primary, text-green-600, etc."
          />
        </div>

        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full"
        >
          {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Sauvegarder
        </Button>
      </CardContent>
    </Card>
  );
}
