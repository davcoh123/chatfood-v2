import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export const useDeleteAccount = () => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const deleteAccount = async (confirmation: string) => {
    if (confirmation !== 'SUPPRIMER') {
      toast.error('Veuillez taper SUPPRIMER pour confirmer');
      return false;
    }

    setIsDeleting(true);

    try {
      const { data, error } = await supabase.functions.invoke('user-delete-account', {
        body: { confirmation }
      });

      if (error) {
        console.error('Error deleting account:', error);
        toast.error(error.message || 'Erreur lors de la suppression du compte');
        return false;
      }

      if (data?.error) {
        toast.error(data.error);
        return false;
      }

      toast.success('Votre compte a été supprimé avec succès');
      
      // Déconnexion et redirection
      await signOut();
      navigate('/');
      
      return true;
    } catch (error) {
      console.error('Error deleting account:', error);
      toast.error('Une erreur est survenue lors de la suppression');
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  return { deleteAccount, isDeleting };
};
