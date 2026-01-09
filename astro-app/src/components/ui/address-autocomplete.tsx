import React, { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Command, CommandEmpty, CommandGroup, CommandItem, CommandList } from '@/components/ui/command';
import { Popover, PopoverContent, PopoverAnchor } from '@/components/ui/popover';
import { MapPin, Loader2 } from 'lucide-react';

interface AddressSuggestion {
  label: string;
  street: string;
  postcode: string;
  city: string;
  longitude: number;
  latitude: number;
}

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onAddressSelect: (address: {
    street: string;
    postalCode: string;
    city: string;
    longitude: number;
    latitude: number;
  }) => void;
  placeholder?: string;
  id?: string;
}

export function AddressAutocomplete({
  value,
  onChange,
  onAddressSelect,
  placeholder = "Ex: 12 rue de la Paix",
  id
}: AddressAutocompleteProps) {
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Clear previous timeout
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Don't search if value is too short or user hasn't interacted yet
    if (!value || value.length < 3 || !hasInteracted) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }

    // Debounce API call
    debounceRef.current = setTimeout(async () => {
      setIsLoading(true);
      try {
        const response = await fetch(
          `https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(value)}&limit=5`
        );
        const data = await response.json();

        if (data.features && data.features.length > 0) {
          const formattedSuggestions: AddressSuggestion[] = data.features.map((feature: any) => ({
            label: feature.properties.label,
            street: feature.properties.name,
            postcode: feature.properties.postcode,
            city: feature.properties.city,
            longitude: feature.geometry.coordinates[0],
            latitude: feature.geometry.coordinates[1],
          }));
          setSuggestions(formattedSuggestions);
          setIsOpen(true);
        } else {
          setSuggestions([]);
          setIsOpen(false);
        }
      } catch (error) {
        console.error('Error fetching address suggestions:', error);
        setSuggestions([]);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [value]);

  const handleSelect = (suggestion: AddressSuggestion) => {
    // Reset interaction state to prevent dropdown from reopening
    setHasInteracted(false);
    setIsOpen(false);
    setSuggestions([]);
    
    onAddressSelect({
      street: suggestion.street,
      postalCode: suggestion.postcode,
      city: suggestion.city,
      longitude: suggestion.longitude,
      latitude: suggestion.latitude,
    });
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverAnchor asChild>
        <div className="relative">
          <Input
            ref={inputRef}
            id={id}
            value={value}
            onChange={(e) => {
              setHasInteracted(true);
              onChange(e.target.value);
            }}
            onFocus={() => setHasInteracted(true)}
            placeholder={placeholder}
            autoComplete="off"
          />
          {isLoading && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
          )}
        </div>
      </PopoverAnchor>
      <PopoverContent 
        className="w-[var(--radix-popover-trigger-width)] p-0" 
        align="start"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <Command>
          <CommandList>
            <CommandEmpty>Aucune adresse trouvée</CommandEmpty>
            <CommandGroup>
              {suggestions.map((suggestion, index) => (
                <CommandItem
                  key={index}
                  value={suggestion.label}
                  onSelect={() => handleSelect(suggestion)}
                  className="cursor-pointer"
                >
                  <MapPin className="mr-2 h-4 w-4 text-muted-foreground shrink-0" />
                  <span className="truncate">{suggestion.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
