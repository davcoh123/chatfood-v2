import { useState, useEffect, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';

interface RestaurantFiltersProps {
  cities: string[];
  restaurantCount: number;
}

export default function RestaurantFilters({ cities, restaurantCount }: RestaurantFiltersProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState<string>('all');
  const [visibleCount, setVisibleCount] = useState(restaurantCount);

  const filterRestaurants = useCallback(() => {
    const grid = document.getElementById('restaurants-grid');
    if (!grid) return;

    const cards = grid.querySelectorAll<HTMLElement>('article[data-city]');
    let count = 0;

    cards.forEach((card) => {
      const cardCity = card.dataset.city || '';
      const cardName = card.dataset.name || '';

      const cityMatch = selectedCity === 'all' || cardCity === selectedCity.toLowerCase();
      const nameMatch = !searchTerm || cardName.includes(searchTerm.toLowerCase());

      if (cityMatch && nameMatch) {
        card.style.display = '';
        count++;
      } else {
        card.style.display = 'none';
      }
    });

    setVisibleCount(count);
  }, [searchTerm, selectedCity]);

  useEffect(() => {
    filterRestaurants();
  }, [filterRestaurants]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleCityChange = (value: string) => {
    setSelectedCity(value);
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
      {/* Search Input */}
      <div className="relative flex-1 w-full sm:max-w-md">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <circle cx="11" cy="11" r="8" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <Input
          type="search"
          placeholder="Rechercher un restaurant..."
          className="pl-10"
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
        />
      </div>

      {/* City Filter */}
      <Select value={selectedCity} onValueChange={handleCityChange}>
        <SelectTrigger className="w-full sm:w-[200px]">
          <SelectValue placeholder="Toutes les villes" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Toutes les villes</SelectItem>
          {cities.map((city) => (
            <SelectItem key={city} value={city.toLowerCase()}>
              {city}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Results Count */}
      <span className="text-sm text-muted-foreground whitespace-nowrap text-center sm:text-left">
        {visibleCount} restaurant{visibleCount !== 1 ? 's' : ''}
      </span>
    </div>
  );
}
