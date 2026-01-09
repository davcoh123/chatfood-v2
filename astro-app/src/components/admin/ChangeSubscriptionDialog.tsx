import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ChangeSubscriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  currentPlan: string;
  userEmail: string;
  onSuccess: () => void;
}

export function ChangeSubscriptionDialog({ 
  open, 
  onOpenChange, 
  userId, 
  currentPlan,
  userEmail,
  onSuccess 
}: ChangeSubscriptionDialogProps) {
  const [loading, setLoading] = useState(false);
  const [newPlan, setNewPlan] = useState<'starter' | 'pro' | 'premium'>(currentPlan as 'starter' | 'pro' | 'premium');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPlan === currentPlan) {
      toast.error('Le plan sélectionné est déjà actif');
      return;
    }

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      const { error } = await supabase.functions.invoke('admin-update-subscription', {
        body: { 
          user_id: userId,
          new_plan: newPlan
        },
        headers: {
          Authorization: `Bearer ${session?.access_token}`
        }
      });

      if (error) throw error;

      toast.success(`Plan mis à jour vers ${newPlan.toUpperCase()} pour ${userEmail}`);
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      console.error('Error updating subscription:', error);
      toast.error(error.message || 'Erreur lors de la mise à jour du plan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifier le plan d'abonnement</DialogTitle>
          <DialogDescription>
            Changer le plan pour {userEmail}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Plan actuel</Label>
            <div className="px-3 py-2 bg-muted rounded-md">
              <span className="font-semibold capitalize">{currentPlan}</span>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="new_plan">Nouveau plan *</Label>
            <Select value={newPlan} onValueChange={(value) => setNewPlan(value as 'starter' | 'pro' | 'premium')}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un nouveau plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="starter">Starter - Fonctionnalités de base</SelectItem>
                <SelectItem value="pro">Pro - Analytics + Promotions</SelectItem>
                <SelectItem value="premium">Premium - Multi-restaurants + IA</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading || newPlan === currentPlan}>
              {loading ? 'Mise à jour...' : 'Confirmer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
