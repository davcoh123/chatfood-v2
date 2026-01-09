import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface EditMetricDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  sectionId: string;
  sectionType: string;
  plan: string;
  currentConfig?: {
    title?: string;
    webhook_url?: string;
    icon?: string;
    color?: string;
  };
  isActive?: boolean;
  onSave: () => void;
}

export function EditMetricDialog({
  open,
  onOpenChange,
  userId,
  sectionId,
  sectionType,
  plan,
  currentConfig,
  isActive = true,
  onSave,
}: EditMetricDialogProps) {
  const [title, setTitle] = useState(currentConfig?.title || '');
  const [webhookUrl, setWebhookUrl] = useState(currentConfig?.webhook_url || '');
  const [isSaving, setIsSaving] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Reset form when dialog opens or config changes
  useEffect(() => {
    if (open) {
      setTitle(currentConfig?.title || '');
      setWebhookUrl(currentConfig?.webhook_url || '');
    }
  }, [open, userId, sectionId, currentConfig?.title, currentConfig?.webhook_url]);

  const handleSave = async () => {
    setIsSaving(true);

    try {
      const customizations = {
        title: title || undefined,
        webhook_url: webhookUrl || undefined,
      };

      const { error } = await supabase
        .from('dashboard_configurations')
        .upsert({
          user_id: userId,
          section_id: sectionId,
          section_type: sectionType,
          plan: plan as any,
          customizations,
          is_active: true,
        }, {
          onConflict: 'user_id,section_id',
        });

      if (error) throw error;

      // Invalider toutes les queries liées aux dashboards pour forcer le rafraîchissement
      queryClient.invalidateQueries({ queryKey: ['dashboard-config'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-value'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-configs-all'] });

      toast({
        title: 'Sauvegardé',
        description: 'La configuration a été mise à jour',
      });

      onSave();
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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Éditer: {sectionId}</DialogTitle>
          <DialogDescription>
            Personnalisez cet indicateur pour l'utilisateur
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Nom</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Messages WhatsApp"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="webhook">URL Webhook</Label>
            <Input
              id="webhook"
              value={webhookUrl}
              onChange={(e) => setWebhookUrl(e.target.value)}
              placeholder="https://hooks.zapier.com/..."
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSaving}
          >
            Annuler
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Sauvegarder
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
