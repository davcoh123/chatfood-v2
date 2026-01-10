import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Star, AlertCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface FeaturedCategoriesSelectorProps {
  categories: string[];
  selectedCategories: string[];
  onSelectionChange: (categories: string[]) => void;
  maxSelection?: number;
}

export function FeaturedCategoriesSelector({
  categories,
  selectedCategories,
  onSelectionChange,
  maxSelection = 3,
}: FeaturedCategoriesSelectorProps) {
  const handleToggle = (category: string) => {
    if (selectedCategories.includes(category)) {
      onSelectionChange(selectedCategories.filter(c => c !== category));
    } else if (selectedCategories.length < maxSelection) {
      onSelectionChange([...selectedCategories, category]);
    }
  };

  if (categories.length === 0) {
    return (
      <div className="space-y-3">
        <Label className="text-sm font-medium flex items-center gap-2">
          <Star className="h-4 w-4" />
          Catégories mises en avant
        </Label>
        <div className="flex items-center gap-2 p-4 bg-muted/50 rounded-lg text-muted-foreground text-sm">
          <AlertCircle className="h-4 w-4" />
          Ajoutez des produits à votre catalogue pour voir vos catégories
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium flex items-center gap-2">
          <Star className="h-4 w-4" />
          Catégories mises en avant
        </Label>
        <span className="text-xs text-muted-foreground">
          {selectedCategories.length}/{maxSelection} sélectionnées
        </span>
      </div>
      
      <p className="text-xs text-muted-foreground">
        Ces catégories apparaissent sous le nom de votre restaurant
      </p>
      
      <div className="grid grid-cols-2 gap-2">
        {categories.map((category) => {
          const isSelected = selectedCategories.includes(category);
          const isDisabled = !isSelected && selectedCategories.length >= maxSelection;
          
          return (
            <label
              key={category}
              className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                isSelected 
                  ? 'border-primary bg-primary/5' 
                  : isDisabled 
                    ? 'border-muted bg-muted/50 cursor-not-allowed opacity-50'
                    : 'border-border hover:border-primary/50'
              }`}
            >
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => !isDisabled && handleToggle(category)}
                disabled={isDisabled}
              />
              <span className="text-sm truncate">{category}</span>
            </label>
          );
        })}
      </div>
      
      {selectedCategories.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2">
          {selectedCategories.map((cat) => (
            <Badge key={cat} variant="secondary" className="text-xs">
              {cat}
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}
