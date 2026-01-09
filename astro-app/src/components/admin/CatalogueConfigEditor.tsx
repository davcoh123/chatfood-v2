import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CatalogueConfigEditorProps {
  userId: string;
  userName: string;
  existingConfig?: {
    webhook_url_get: string;
    webhook_url_post: string;
  };
  onSave: () => void;
}

export function CatalogueConfigEditor({
  userId,
  userName,
  existingConfig,
  onSave,
}: CatalogueConfigEditorProps) {
  const [webhookGet, setWebhookGet] = useState(existingConfig?.webhook_url_get || '');
  const [webhookPost, setWebhookPost] = useState(existingConfig?.webhook_url_post || '');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleTestConnection = async () => {
    if (!webhookGet) {
      toast.error('Veuillez entrer une URL GET');
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      const response = await fetch(webhookGet, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data)) {
          setTestResult('success');
          toast.success(`Connexion réussie - ${data.length} items récupérés`);
        } else {
          setTestResult('error');
          toast.error('Format invalide - Le webhook doit retourner un tableau');
        }
      } else {
        setTestResult('error');
        toast.error(`Le webhook a retourné: ${response.status}`);
      }
    } catch (error) {
      setTestResult('error');
      toast.error('Impossible de joindre le webhook');
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = async () => {
    if (!webhookGet && !webhookPost) {
      toast.error('Au moins une URL webhook est requise');
      return;
    }

    setIsSaving(true);

    try {
      // Vérifier si une config existe déjà
      const { data: existing } = await supabase
        .from('dashboard_configurations')
        .select('id')
        .eq('user_id', userId)
        .eq('section_id', 'catalogue')
        .maybeSingle();

      if (existing) {
        // Mettre à jour
        const { error } = await supabase
          .from('dashboard_configurations')
          .update({
            customizations: {
              webhook_url_get: webhookGet,
              webhook_url_post: webhookPost,
            },
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id);

        if (error) throw error;
      } else {
        // Créer
        const { error } = await supabase
          .from('dashboard_configurations')
          .insert({
            user_id: userId,
            section_id: 'catalogue',
            section_type: 'catalogue',
            plan: 'starter',
            customizations: {
              webhook_url_get: webhookGet,
              webhook_url_post: webhookPost,
            },
            is_active: true,
          });

        if (error) throw error;
      }

      toast.success(`Configuration sauvegardée pour ${userName}`);
      onSave();
    } catch (error) {
      console.error('Error saving catalogue config:', error);
      toast.error('Impossible de sauvegarder la configuration');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuration du Catalogue</CardTitle>
        <CardDescription>
          Configurez les webhooks pour le catalogue de {userName}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="webhook-get">Webhook GET (récupération des items)</Label>
          <Input
            id="webhook-get"
            placeholder="https://n8n.chatfood.fr/webhook/get-menu-items"
            value={webhookGet}
            onChange={(e) => setWebhookGet(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Ce webhook doit retourner un tableau d'items au format JSON
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="webhook-post">Webhook POST (sauvegarde des modifications)</Label>
          <Input
            id="webhook-post"
            placeholder="https://n8n.chatfood.fr/webhook/update-menu-items"
            value={webhookPost}
            onChange={(e) => setWebhookPost(e.target.value)}
          />
          <p className="text-xs text-muted-foreground">
            Ce webhook recevra les items modifiés depuis la page Catalogue
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleTestConnection}
            disabled={isTesting || !webhookGet}
          >
            {isTesting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Test en cours...
              </>
            ) : (
              <>
                {testResult === 'success' && <CheckCircle className="h-4 w-4 mr-2 text-green-600" />}
                {testResult === 'error' && <XCircle className="h-4 w-4 mr-2 text-red-600" />}
                Tester la connexion
              </>
            )}
          </Button>

          <Button
            onClick={handleSave}
            disabled={isSaving || (!webhookGet && !webhookPost)}
          >
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                Sauvegarde...
              </>
            ) : (
              'Sauvegarder la configuration'
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
