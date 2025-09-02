// src/components/participants/ParticipantFiltersComponent.tsx

import React from 'react';
import { Users, MapPin, RotateCcw } from 'lucide-react';
import {
  GENDER_OPTIONS,
  AGE_OPTIONS,
  EXPERIENCE_OPTIONS,
  TRIPS_OPTIONS,
} from '../../constants/participants';
import DropdownSelect from '../../ui/DropdownSelect';

export interface ParticipantFilters {
  gender: 'male' | 'female' | 'all';
  age: 'adult' | 'child' | 'all';
  experience: 'beginner' | 'experienced' | 'professional' | 'all';
  hasTrips: 'with_trips' | 'without_trips' | 'all';
}

interface ParticipantFiltersProps {
  filters: ParticipantFilters;
  onFiltersChange: (filters: ParticipantFilters) => void;
}

const ParticipantFiltersComponent: React.FC<ParticipantFiltersProps> = ({
  filters,
  onFiltersChange,
}) => {
  const handleFilterChange = (filterKey: keyof ParticipantFilters, value: string) => {
    onFiltersChange({ ...filters, [filterKey]: value });
  };

  const handleReset = () => {
    onFiltersChange({ gender: 'all', age: 'all', experience: 'all', hasTrips: 'all' });
  };

  const hasActiveFilters = Object.values(filters).some((value) => value !== 'all');

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <span className="text-sm font-medium text-gray-900 dark:text-white">Фильтры</span>
        {hasActiveFilters && (
          <button
            onClick={handleReset}
            className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors self-start sm:self-auto"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Сбросить все</span>
          </button>
        )}
      </div>

      {/* --- ИЗМЕНЕНИЕ: Заменяем flex на grid --- */}
      <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(200px,1fr))]">
        <DropdownSelect
          label="Пол"
          icon={Users}
          options={GENDER_OPTIONS}
          value={filters.gender}
          onChange={(value) => handleFilterChange('gender', value)}
          isActive={filters.gender !== 'all'}
        />
        <DropdownSelect
          label="Возраст"
          icon={Users}
          options={AGE_OPTIONS}
          value={filters.age}
          onChange={(value) => handleFilterChange('age', value)}
          isActive={filters.age !== 'all'}
        />
        <DropdownSelect
          label="Опыт"
          icon={Users}
          options={EXPERIENCE_OPTIONS}
          value={filters.experience}
          onChange={(value) => handleFilterChange('experience', value)}
          isActive={filters.experience !== 'all'}
        />
        <DropdownSelect
          label="Походы"
          icon={MapPin}
          options={TRIPS_OPTIONS}
          value={filters.hasTrips}
          onChange={(value) => handleFilterChange('hasTrips', value)}
          isActive={filters.hasTrips !== 'all'}
        />
      </div>
    </div>
  );
};

export default ParticipantFiltersComponent;
