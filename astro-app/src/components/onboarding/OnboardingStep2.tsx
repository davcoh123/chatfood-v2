import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface OpeningHour {
  day: string;
  slot1: string;
  slot2: string;
}

interface OnboardingStep2Props {
  data: OpeningHour[];
  onChange: (data: OpeningHour[]) => void;
}

const DAYS = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];

const OnboardingStep2: React.FC<OnboardingStep2Props> = ({ data, onChange }) => {
  const handleChange = (index: number, field: 'slot1' | 'slot2', value: string) => {
    const newData = [...data];
    newData[index] = { ...newData[index], [field]: value };
    onChange(newData);
  };

  // Initialize data if empty
  React.useEffect(() => {
    if (!data || data.length === 0) {
      onChange(DAYS.map(day => ({ day, slot1: '', slot2: '' })));
    }
  }, [data, onChange]);

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground">Horaires d'ouverture</h2>
        <p className="text-muted-foreground mt-2">
          Indiquez vos horaires pour chaque jour de la semaine.
        </p>
      </div>

      <div className="space-y-3">
        <div className="grid grid-cols-[100px_1fr_1fr] gap-3 text-sm font-medium text-muted-foreground mb-2">
          <span>Jour</span>
          <span>Matin / Midi</span>
          <span>Soir</span>
        </div>
        
        {(data?.length > 0 ? data : DAYS.map(day => ({ day, slot1: '', slot2: '' }))).map((hour, index) => (
          <div key={hour.day} className="grid grid-cols-[100px_1fr_1fr] gap-3 items-center">
            <Label className="capitalize font-medium">{hour.day}</Label>
            <Input
              placeholder="Ex: 12h-14h30"
              value={hour.slot1}
              onChange={(e) => handleChange(index, 'slot1', e.target.value)}
            />
            <Input
              placeholder="Ex: 19h-22h"
              value={hour.slot2}
              onChange={(e) => handleChange(index, 'slot2', e.target.value)}
            />
          </div>
        ))}
      </div>

      <p className="text-sm text-muted-foreground text-center">
        Laissez vide les jours où vous êtes fermé.
      </p>
    </div>
  );
};

export default OnboardingStep2;
