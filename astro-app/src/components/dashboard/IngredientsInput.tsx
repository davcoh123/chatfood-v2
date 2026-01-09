import { useState, KeyboardEvent, ClipboardEvent } from 'react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface IngredientsInputProps {
  value: string[];
  onChange: (ingredients: string[]) => void;
  placeholder?: string;
  className?: string;
}

export function IngredientsInput({ value, onChange, placeholder = "Ajouter un ingrédient...", className }: IngredientsInputProps) {
  const [inputValue, setInputValue] = useState('');

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addIngredient();
    }
  };

  const addIngredient = () => {
    const trimmed = inputValue.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
      setInputValue('');
    }
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const pastedText = e.clipboardData.getData('text');
    
    // Détecter si c'est une liste (contient virgule, point-virgule ou retour ligne)
    if (pastedText.includes(',') || pastedText.includes(';') || pastedText.includes('\n')) {
      e.preventDefault();
      
      // Parser en séparant par virgule, point-virgule ou retour à la ligne
      const parsed = pastedText
        .split(/[,;\n]+/)
        .map(s => s.replace(/^["']|["']$/g, '').trim())
        .filter(s => s.length > 0 && !value.includes(s));
      
      if (parsed.length > 0) {
        onChange([...value, ...parsed]);
        setInputValue('');
      }
    }
    // Sinon, laisser le comportement par défaut
  };

  const removeIngredient = (ingredient: string) => {
    onChange(value.filter(i => i !== ingredient));
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Input
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onBlur={addIngredient}
        placeholder={placeholder}
      />
      {value.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {value.map((ingredient, index) => {
            // Nettoyer les guillemets résiduels
            const cleanIngredient = ingredient.replace(/^["']|["']$/g, '').trim();
            return (
              <Badge key={index} variant="secondary" className="gap-1 pr-1">
                {cleanIngredient}
                <button
                  type="button"
                  onClick={() => removeIngredient(ingredient)}
                  className="ml-1 rounded-full hover:bg-muted-foreground/20 p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            );
          })}
        </div>
      )}
      <p className="text-xs text-muted-foreground">
        Appuyez sur <kbd className="px-1 py-0.5 bg-muted rounded text-xs">Entrée</kbd> ou <kbd className="px-1 py-0.5 bg-muted rounded text-xs">,</kbd> pour ajouter un ingrédient
      </p>
    </div>
  );
}
