import { useState, useEffect } from 'react';
import { Label } from '@/components/ui/label';
import { List, GripVertical, AlertCircle } from 'lucide-react';
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
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface CategoryOrderManagerProps {
  categories: string[];
  categoryOrder: string[];
  onOrderChange: (order: string[]) => void;
}

function SortableCategory({ category, index }: { category: string; index: number }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-3 rounded-lg border bg-background ${
        isDragging ? 'shadow-lg border-primary z-10' : 'border-border'
      }`}
    >
      <button
        type="button"
        className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>
      <span className="text-sm text-muted-foreground w-6">{index + 1}.</span>
      <span className="text-sm flex-1">{category}</span>
    </div>
  );
}

export function CategoryOrderManager({
  categories,
  categoryOrder,
  onOrderChange,
}: CategoryOrderManagerProps) {
  // Merge saved order with any new categories
  const [orderedCategories, setOrderedCategories] = useState<string[]>([]);

  useEffect(() => {
    // Start with saved order, then add any new categories not in the order
    const savedOrder = categoryOrder.filter(c => categories.includes(c));
    const newCategories = categories.filter(c => !categoryOrder.includes(c));
    setOrderedCategories([...savedOrder, ...newCategories]);
  }, [categories, categoryOrder]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = orderedCategories.indexOf(active.id as string);
      const newIndex = orderedCategories.indexOf(over.id as string);
      const newOrder = arrayMove(orderedCategories, oldIndex, newIndex);
      setOrderedCategories(newOrder);
      onOrderChange(newOrder);
    }
  };

  if (categories.length === 0) {
    return (
      <div className="space-y-3">
        <Label className="text-sm font-medium flex items-center gap-2">
          <List className="h-4 w-4" />
          Ordre des catégories
        </Label>
        <div className="flex items-center gap-2 p-4 bg-muted/50 rounded-lg text-muted-foreground text-sm">
          <AlertCircle className="h-4 w-4" />
          Ajoutez des produits à votre catalogue pour organiser vos catégories
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium flex items-center gap-2">
        <List className="h-4 w-4" />
        Ordre des catégories
      </Label>
      
      <p className="text-xs text-muted-foreground">
        Glissez-déposez pour réorganiser l'ordre d'affichage dans le menu
      </p>
      
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={orderedCategories}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-2">
            {orderedCategories.map((category, index) => (
              <SortableCategory 
                key={category} 
                category={category} 
                index={index} 
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
