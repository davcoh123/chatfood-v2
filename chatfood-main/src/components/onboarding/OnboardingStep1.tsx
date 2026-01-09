import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AddressAutocomplete } from '@/components/ui/address-autocomplete';

interface OnboardingStep1Props {
  data: {
    restaurant_name: string;
    address_street: string;
    address_postal_code: string;
    address_city: string;
    longitude?: number | null;
    latitude?: number | null;
  };
  onChange: (data: Partial<OnboardingStep1Props['data']>) => void;
}

const OnboardingStep1: React.FC<OnboardingStep1Props> = ({ data, onChange }) => {
  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-foreground">Bienvenue sur ChatFood !</h2>
        <p className="text-muted-foreground mt-2">
          Commençons par les informations de base de votre restaurant.
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="restaurant_name">Nom du restaurant *</Label>
          <Input
            id="restaurant_name"
            placeholder="Ex: Le Petit Bistrot"
            value={data.restaurant_name}
            onChange={(e) => onChange({ restaurant_name: e.target.value })}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="address_street">Adresse</Label>
          <AddressAutocomplete
            id="address_street"
            value={data.address_street}
            onChange={(value) => onChange({ address_street: value })}
            onAddressSelect={(addr) => onChange({
              address_street: addr.street,
              address_postal_code: addr.postalCode,
              address_city: addr.city,
              longitude: addr.longitude,
              latitude: addr.latitude,
            })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="address_postal_code">Code postal</Label>
            <Input
              id="address_postal_code"
              placeholder="75001"
              value={data.address_postal_code}
              onChange={(e) => onChange({ address_postal_code: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address_city">Ville</Label>
            <Input
              id="address_city"
              placeholder="Paris"
              value={data.address_city}
              onChange={(e) => onChange({ address_city: e.target.value })}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingStep1;
