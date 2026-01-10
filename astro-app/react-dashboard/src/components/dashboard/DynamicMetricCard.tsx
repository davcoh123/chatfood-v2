import { LucideIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { useDashboardConfig } from '@/hooks/useDashboardConfig';
import * as Icons from 'lucide-react';
import { Pencil } from 'lucide-react';
import { useState } from 'react';

interface DynamicMetricCardProps {
  sectionId: string;
  defaultTitle: string;
  defaultValue?: string;
  defaultIcon: LucideIcon;
  defaultColor?: string;
  isAdminMode?: boolean;
  userId?: string;
  onEdit?: () => void;
}

export function DynamicMetricCard({
  sectionId,
  defaultTitle,
  defaultValue,
  defaultIcon,
  defaultColor = 'text-primary',
  isAdminMode = false,
  userId,
  onEdit,
}: DynamicMetricCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { title, value, isLoading, icon, color, hasWebhook } = useDashboardConfig(sectionId, { userId });

  // Get icon component from lucide-react
  const IconComponent = icon && Icons[icon as keyof typeof Icons] 
    ? (Icons[icon as keyof typeof Icons] as LucideIcon)
    : defaultIcon;

  const displayTitle = title || defaultTitle;
  const displayColor = color || defaultColor;
  
  // Use Supabase value if available, otherwise use default
  const displayValue = value ?? defaultValue ?? '...';

  return (
    <Card 
      className={`relative transition-all hover:shadow-md ${isAdminMode && isHovered ? 'ring-2 ring-primary shadow-lg' : ''}`}
      onMouseEnter={() => isAdminMode && setIsHovered(true)}
      onMouseLeave={() => isAdminMode && setIsHovered(false)}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 md:p-6">
        <CardTitle className="text-sm font-medium text-muted-foreground">{displayTitle}</CardTitle>
        <div className="flex items-center gap-2">
          <div className={`h-8 w-8 rounded-lg bg-muted/50 flex items-center justify-center transition-colors group-hover:bg-primary/10`}>
            <IconComponent className={`h-4 w-4 ${displayColor}`} />
          </div>
          {isAdminMode && isHovered && (
            <Button
              size="icon"
              variant="ghost"
              className="h-6 w-6 absolute top-2 right-2"
              onClick={onEdit}
            >
              <Pencil className="h-3 w-3" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4 md:p-6 pt-0 md:pt-0">
        {isLoading && hasWebhook ? (
          <Skeleton className="h-8 w-20" />
        ) : (
          <div className="text-2xl md:text-3xl font-bold tracking-tight">{displayValue || '...'}</div>
        )}
      </CardContent>
    </Card>
  );
}
