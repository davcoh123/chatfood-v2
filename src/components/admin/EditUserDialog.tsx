import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { editProfileFormSchema, type EditProfileFormData } from '@/schemas/admin';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Profile {
  user_id: string;
  email: string;
  first_name?: string;
  last_name?: string;
}

interface EditUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: Profile | null;
  onSuccess: () => void;
}

export function EditUserDialog({ open, onOpenChange, profile, onSuccess }: EditUserDialogProps) {
  const [loading, setLoading] = useState(false);
  
  const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<EditProfileFormData>({
    resolver: zodResolver(editProfileFormSchema),
  });

  useEffect(() => {
    if (profile) {
      setValue('first_name', profile.first_name || '');
      setValue('last_name', profile.last_name || '');
      setValue('email', profile.email);
    }
  }, [profile, setValue]);

  const onSubmit = async (data: EditProfileFormData) => {
    if (!profile) return;
    
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      // Update profile (name)
      const { error: profileError } = await supabase.functions.invoke('admin-update-profile', {
        body: {
          user_id: profile.user_id,
          first_name: data.first_name,
          last_name: data.last_name
        },
        headers: {
          Authorization: `Bearer ${session?.access_token}`
        }
      });

      if (profileError) throw profileError;

      // Update email if changed
      if (data.email !== profile.email) {
        const { error: emailError } = await supabase.functions.invoke('admin-update-email', {
          body: {
            user_id: profile.user_id,
            new_email: data.email
          },
          headers: {
            Authorization: `Bearer ${session?.access_token}`
          }
        });

        if (emailError) throw emailError;
      }

      toast.success('Profil mis à jour avec succès');
      
      // Si l'utilisateur modifie son propre profil, rafraîchir le contexte
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      if (currentSession?.user.id === profile.user_id) {
        window.dispatchEvent(new Event('profile-updated'));
      }
      
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.message || 'Erreur lors de la mise à jour du profil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Modifier le profil</DialogTitle>
          <DialogDescription>
            Modifier les informations de l'utilisateur
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first_name">Prénom</Label>
              <Input
                id="first_name"
                {...register('first_name')}
              />
              {errors.first_name && (
                <p className="text-sm text-destructive">{errors.first_name.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="last_name">Nom</Label>
              <Input
                id="last_name"
                {...register('last_name')}
              />
              {errors.last_name && (
                <p className="text-sm text-destructive">{errors.last_name.message}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Annuler
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
