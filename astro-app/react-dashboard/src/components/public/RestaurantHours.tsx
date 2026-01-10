import { Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { OpeningHours } from '@/hooks/usePublicRestaurant';

interface RestaurantHoursProps {
  openingHours: OpeningHours[];
}

const DAYS_ORDER = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];

export function RestaurantHours({ openingHours }: RestaurantHoursProps) {
  // Sort hours by day order
  const sortedHours = [...openingHours].sort(
    (a, b) => DAYS_ORDER.indexOf(a.day) - DAYS_ORDER.indexOf(b.day)
  );

  // Get today's day name
  const now = new Date();
  const dayNames = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];
  const todayName = dayNames[now.getDay()];

  const hasAnyHours = openingHours.some(h => h.slot1 || h.slot2);

  if (!hasAnyHours) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Clock className="h-5 w-5 text-primary" />
          Horaires d'ouverture
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {sortedHours.map((hours) => {
            const isToday = hours.day === todayName;
            const isClosed = !hours.slot1 && !hours.slot2;
            const slots = [hours.slot1, hours.slot2].filter(Boolean).join(', ');

            return (
              <div 
                key={hours.day}
                className={`flex justify-between items-center py-1.5 px-2 rounded ${
                  isToday ? 'bg-primary/10 font-medium' : ''
                }`}
              >
                <span className="capitalize text-sm">
                  {hours.day}
                  {isToday && <span className="ml-2 text-xs text-primary">(aujourd'hui)</span>}
                </span>
                <span className={`text-sm ${isClosed ? 'text-muted-foreground' : ''}`}>
                  {isClosed ? 'Fermé' : slots}
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
