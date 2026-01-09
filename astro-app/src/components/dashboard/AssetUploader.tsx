import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Upload, X, Image as ImageIcon, Loader2, GripVertical, Eye } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAssetUpload } from '@/hooks/useAssetUpload';
import { RestaurantAsset } from '@/hooks/useRestaurantSettings';
import { AssetPreviewDialog } from './AssetPreviewDialog';
import { toast } from '@/hooks/use-toast';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface AssetUploaderProps {
  userId: string;
  assets: RestaurantAsset[];
  onAssetsChange: (assets: RestaurantAsset[]) => void;
}

// Composant pour chaque carte draggable
function SortableAssetCard({ 
  asset, 
  onRemove, 
  onPreview 
}: { 
  asset: RestaurantAsset; 
  onRemove: () => void;
  onPreview: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: asset.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card ref={setNodeRef} style={style} className="p-4 h-full flex flex-col">
      <div className="flex flex-col h-full space-y-3">
        {/* Handle de drag */}
        <div className="flex items-center justify-between">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 hover:bg-muted rounded"
          >
            <GripVertical className="h-5 w-5 text-muted-foreground" />
          </div>
          <Badge variant="secondary" className="text-xs">
            #{asset.order + 1}
          </Badge>
        </div>

        {/* Image avec overlay au hover */}
        <div 
          className="relative aspect-video rounded overflow-hidden bg-muted group cursor-pointer"
          onClick={onPreview}
        >
          <img
            src={asset.url}
            alt={asset.description}
            className="w-full h-full object-cover"
          />
          {/* Overlay au hover */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Eye className="h-8 w-8 text-white" />
          </div>
        </div>
        
        {/* Description */}
        <div className="space-y-1 flex-1">
          <p className="font-medium text-sm line-clamp-2" title={asset.description}>
            {asset.description}
          </p>
          <p className="text-xs text-muted-foreground truncate" title={asset.filename}>
            {asset.filename}
          </p>
        </div>

        {/* Actions */}
        <Button
          variant="destructive"
          size="sm"
          onClick={onRemove}
          className="w-full"
        >
          <X className="h-4 w-4 mr-2" />
          Supprimer
        </Button>
      </div>
    </Card>
  );
}

export function AssetUploader({ userId, assets, onAssetsChange }: AssetUploaderProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [description, setDescription] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewAsset, setPreviewAsset] = useState<RestaurantAsset | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  
  const { uploadAsset, deleteAsset, uploading } = useAssetUpload(userId);

  // Configuration drag & drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = sortedAssets.findIndex((a) => a.id === active.id);
      const newIndex = sortedAssets.findIndex((a) => a.id === over.id);

      const reorderedAssets = arrayMove(sortedAssets, oldIndex, newIndex).map((asset, index) => ({
        ...asset,
        order: index,
      }));

      onAssetsChange(reorderedAssets);
      toast({
        title: 'Ordre modifié',
        description: 'L\'ordre des assets a été mis à jour',
      });
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // Créer preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !description.trim()) {
      return;
    }

    const result = await uploadAsset(selectedFile, description);
    
    if (result) {
      const newAsset: RestaurantAsset = {
        id: crypto.randomUUID(),
        url: result.url,
        description: description.trim(),
        filename: result.filename,
        created_at: new Date().toISOString(),
        order: assets.length,
      };

      onAssetsChange([...assets, newAsset]);
      
      // Reset
      setSelectedFile(null);
      setDescription('');
      setPreviewUrl(null);
      setIsOpen(false);
    }
  };

  const handleRemoveAsset = async (asset: RestaurantAsset) => {
    await deleteAsset(asset.url);
    const remainingAssets = assets
      .filter(a => a.id !== asset.id)
      .map((a, index) => ({ ...a, order: index }));
    onAssetsChange(remainingAssets);
  };

  const handlePreview = (asset: RestaurantAsset) => {
    setPreviewAsset(asset);
    setPreviewOpen(true);
  };

  // Trier les assets par ordre (gérer les anciens assets sans champ order)
  const sortedAssets = [...assets]
    .map((asset, index) => ({
      ...asset,
      order: asset.order ?? index, // Assigner un ordre si manquant
    }))
    .sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Label className="text-base">Images du restaurant</Label>
        
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button variant="default" size="default" className="w-full sm:w-auto shadow-md">
              <Upload className="h-4 w-4 mr-2" />
              Ajouter une image
            </Button>
          </DialogTrigger>
          
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Ajouter une nouvelle image</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">
                  Description de l'image <span className="text-destructive">*</span>
                </Label>
                <p className="text-xs text-muted-foreground">
                  💡 Vous pouvez indiquer plusieurs catégories dans la même image
                </p>
                <Input
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex: Menu entrées, pizzas, paninis et desserts"
                />
              </div>

              {/* File input */}
              <div className="space-y-2">
                <Label htmlFor="file">
                  Image (PNG ou JPG) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="file"
                  type="file"
                  accept="image/png,image/jpeg,image/jpg"
                  onChange={handleFileSelect}
                />
              </div>

              {/* Preview */}
              {previewUrl && (
                <div className="rounded-lg border p-4">
                  <p className="text-sm text-muted-foreground mb-2">Aperçu :</p>
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-48 object-cover rounded"
                  />
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  onClick={handleUpload}
                  disabled={!selectedFile || !description.trim() || uploading}
                  className="flex-1"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Upload en cours...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Uploader
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setIsOpen(false)}
                  disabled={uploading}
                >
                  Annuler
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Liste des assets avec drag & drop */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={sortedAssets.map(a => a.id)} strategy={rectSortingStrategy}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 auto-rows-fr">
            {sortedAssets.map((asset) => (
              <SortableAssetCard
                key={asset.id}
                asset={asset}
                onRemove={() => handleRemoveAsset(asset)}
                onPreview={() => handlePreview(asset)}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
        
      {assets.length === 0 && (
        <Card className="p-12 col-span-full border-2 border-dashed">
          <div className="text-center space-y-4">
            <ImageIcon className="h-16 w-16 mx-auto text-muted-foreground opacity-50" />
            <div>
              <p className="text-lg font-medium">Aucune image pour le moment</p>
              <p className="text-sm text-muted-foreground mt-1">
                Uploadez des images de votre menu pour enrichir votre catalogue
              </p>
            </div>
            <Button 
              onClick={() => setIsOpen(true)}
              size="lg"
              className="mt-4"
            >
              <Upload className="h-5 w-5 mr-2" />
              Ajouter votre première image
            </Button>
          </div>
        </Card>
      )}

      {/* Dialog de prévisualisation */}
      <AssetPreviewDialog
        asset={previewAsset}
        open={previewOpen}
        onOpenChange={setPreviewOpen}
      />
    </div>
  );
}
