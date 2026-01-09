import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Pencil, Check, X, Loader2, AlertCircle, CheckCircle2, Copy, ExternalLink } from 'lucide-react';
import { useSlugAvailability, normalizeSlug, isValidSlug } from '@/hooks/useSlugAvailability';
import { toast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface SlugEditorProps {
  currentSlug: string;
  userId: string;
  onSave: (newSlug: string) => void;
  isSaving?: boolean;
}

export function SlugEditor({ currentSlug, userId, onSave, isSaving }: SlugEditorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedSlug, setEditedSlug] = useState(currentSlug);
  const { isAvailable, reason, isChecking } = useSlugAvailability(editedSlug, userId);

  const baseUrl = `https://chatfood.fr/r/`;
  const hasChanges = editedSlug !== currentSlug;
  const canSave = hasChanges && isAvailable && isValidSlug(editedSlug) && !isChecking;

  useEffect(() => {
    if (!isEditing) {
      setEditedSlug(currentSlug);
    }
  }, [currentSlug, isEditing]);

  const handleInputChange = (value: string) => {
    // Normalisation en temps réel
    const normalized = normalizeSlug(value);
    setEditedSlug(normalized);
  };

  const handleSave = () => {
    if (canSave) {
      onSave(editedSlug);
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setEditedSlug(currentSlug);
    setIsEditing(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(`${baseUrl}${currentSlug}`);
    toast({ title: 'Lien copié !' });
  };

  const getStatusIcon = () => {
    if (!hasChanges) return null;
    if (isChecking) return <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />;
    if (editedSlug.length < 3) return <AlertCircle className="h-4 w-4 text-amber-500" />;
    if (!isValidSlug(editedSlug)) return <AlertCircle className="h-4 w-4 text-destructive" />;
    if (isAvailable) return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    return <X className="h-4 w-4 text-destructive" />;
  };

  const getStatusMessage = () => {
    if (!hasChanges) return null;
    if (isChecking) return <span className="text-muted-foreground">Vérification...</span>;
    if (editedSlug.length < 3) return <span className="text-amber-500">Minimum 3 caractères</span>;
    if (!isValidSlug(editedSlug)) return <span className="text-destructive">Format invalide (lettres, chiffres, tirets)</span>;
    if (isAvailable) return <span className="text-green-500">Cette URL est disponible</span>;
    return <span className="text-destructive">Cette URL est déjà utilisée</span>;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-base font-medium">Votre URL publique</Label>
        {!isEditing && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="h-8 px-2"
          >
            <Pencil className="h-4 w-4 mr-1" />
            Modifier
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <div className={cn(
          "flex items-center flex-1 rounded-lg border bg-background overflow-hidden",
          isEditing && "ring-2 ring-primary/20 border-primary/50"
        )}>
          <span className="px-3 py-2 bg-muted text-muted-foreground text-sm font-mono border-r shrink-0">
            {baseUrl}
          </span>
          {isEditing ? (
            <div className="flex items-center flex-1 gap-2 pr-2">
              <Input
                value={editedSlug}
                onChange={(e) => handleInputChange(e.target.value)}
                className="border-0 shadow-none focus-visible:ring-0 font-mono text-sm"
                placeholder="mon-restaurant"
                autoFocus
              />
              {getStatusIcon()}
            </div>
          ) : (
            <span className="px-3 py-2 font-mono text-sm flex-1">{currentSlug}</span>
          )}
        </div>

        {isEditing ? (
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCancel}
              className="h-10 w-10"
            >
              <X className="h-4 w-4" />
            </Button>
            <Button
              size="icon"
              onClick={handleSave}
              disabled={!canSave || isSaving}
              className="h-10 w-10"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            </Button>
          </div>
        ) : (
          <div className="flex gap-1">
            <Button variant="outline" size="icon" onClick={handleCopy} className="h-10 w-10">
              <Copy className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon" asChild className="h-10 w-10">
              <a href={`https://chatfood.fr/r/${currentSlug}`} target="_blank" rel="noopener noreferrer">
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>
        )}
      </div>

      {isEditing && (
        <div className="flex items-center gap-2 text-sm">
          {getStatusMessage()}
        </div>
      )}
    </div>
  );
}
