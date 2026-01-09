import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { compressImage, shouldCompress } from '@/lib/imageCompression';

export const useAssetUpload = (userId: string) => {
  const [uploading, setUploading] = useState(false);

  const uploadAsset = async (
    file: File,
    description: string
  ): Promise<{ url: string; filename: string } | null> => {
    try {
      setUploading(true);

      // Valider le type de fichier
      if (!file.type.match(/image\/(png|jpg|jpeg)/)) {
        toast.error('Format non supporté', {
          description: 'Seuls les fichiers PNG et JPG sont acceptés',
        });
        return null;
      }

      let fileToUpload = file;

      // Compresser automatiquement si > 2MB
      if (shouldCompress(file, 2)) {
        toast.info('⏳ Compression de l\'image en cours...', {
          description: 'Patientez quelques secondes',
        });

        try {
          fileToUpload = await compressImage(file, {
            maxSizeMB: 2,
            maxWidthOrHeight: 1920,
          });

          const reduction = ((file.size - fileToUpload.size) / file.size) * 100;
          toast.success(`✅ Image compressée (-${reduction.toFixed(0)}%)`, {
            description: `${(fileToUpload.size / 1024 / 1024).toFixed(2)} MB`,
          });
        } catch (compressionError) {
          console.error('Compression error:', compressionError);
          toast.warning('Compression impossible', {
            description: 'Tentative d\'upload sans compression',
          });
        }
      }

      // Valider la taille finale (max 5MB après compression)
      if (fileToUpload.size > 5 * 1024 * 1024) {
        toast.error('Fichier trop volumineux', {
          description: 'La taille maximale est de 5MB même après compression',
        });
        return null;
      }

      // Générer un nom de fichier unique
      const fileExt = fileToUpload.name.split('.').pop();
      const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

      // Upload vers Supabase Storage
      const { data, error } = await supabase.storage
        .from('restaurant-assets')
        .upload(fileName, fileToUpload, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) throw error;

      // Récupérer l'URL publique
      const { data: { publicUrl } } = supabase.storage
        .from('restaurant-assets')
        .getPublicUrl(data.path);

      toast.success('Image uploadée avec succès');

      return {
        url: publicUrl,
        filename: file.name,
      };
    } catch (error: any) {
      toast.error('Erreur lors de l\'upload', {
        description: error.message,
      });
      return null;
    } finally {
      setUploading(false);
    }
  };

  const deleteAsset = async (url: string) => {
    try {
      // Extraire le chemin depuis l'URL
      const path = url.split('/restaurant-assets/')[1];
      
      const { error } = await supabase.storage
        .from('restaurant-assets')
        .remove([path]);

      if (error) throw error;

      toast.success('Image supprimée');
    } catch (error: any) {
      toast.error('Erreur lors de la suppression', {
        description: error.message,
      });
    }
  };

  return {
    uploadAsset,
    deleteAsset,
    uploading,
  };
};
