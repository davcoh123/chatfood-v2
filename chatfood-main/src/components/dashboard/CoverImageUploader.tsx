import { useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Upload, Trash2, ImageIcon, Loader2 } from 'lucide-react';
import { useAssetUpload } from '@/hooks/useAssetUpload';

interface CoverImageUploaderProps {
  userId: string;
  currentImageUrl: string | null;
  onImageChange: (url: string | null) => void;
  isUpdating?: boolean;
}

export function CoverImageUploader({ 
  userId,
  currentImageUrl, 
  onImageChange,
  isUpdating = false 
}: CoverImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { uploadAsset, deleteAsset, uploading } = useAssetUpload(userId);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const result = await uploadAsset(file, 'Photo de couverture');
    if (result) {
      onImageChange(result.url);
    }
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleRemove = async () => {
    if (currentImageUrl) {
      await deleteAsset(currentImageUrl);
      onImageChange(null);
    }
  };

  const isLoading = uploading || isUpdating;

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium flex items-center gap-2">
        <ImageIcon className="h-4 w-4" />
        Photo de couverture
      </Label>
      
      {currentImageUrl ? (
        <div className="space-y-3">
          <div className="relative rounded-lg overflow-hidden h-40 bg-muted border">
            <img 
              src={currentImageUrl} 
              alt="Photo de couverture" 
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
              disabled={isLoading}
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Upload className="h-4 w-4 mr-2" />
              )}
              Changer l'image
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleRemove}
              disabled={isLoading}
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer
            </Button>
          </div>
        </div>
      ) : (
        <div 
          className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <div className="flex flex-col items-center gap-2">
            {uploading ? (
              <Loader2 className="h-8 w-8 text-muted-foreground animate-spin" />
            ) : (
              <Upload className="h-8 w-8 text-muted-foreground" />
            )}
            <p className="text-sm text-muted-foreground">
              {uploading ? 'Upload en cours...' : 'Cliquez pour ajouter une photo'}
            </p>
            <p className="text-xs text-muted-foreground">
              Taille recommandée : 1200×630 pixels
            </p>
          </div>
        </div>
      )}
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
      
      <p className="text-xs text-muted-foreground">
        Cette image apparaît en haut de votre page et lors du partage sur les réseaux sociaux.
      </p>
    </div>
  );
}
