// src/components/participants/ParticipantFiltersComponent.tsx

import React from 'react';
import { Users, MapPin, RotateCcw, Award, Baby } from 'lucide-react';
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
  const activeFiltersCount = Object.values(filters).filter((value) => value !== 'all').length;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="text-base font-semibold text-gray-900 dark:text-white">Фильтры</span>
          {hasActiveFilters && (
            <span className="px-2.5 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-semibold rounded-full border border-blue-200 dark:border-blue-800">
              {activeFiltersCount} активных
            </span>
          )}
        </div>
        {hasActiveFilters && (
          <button
            onClick={handleReset}
            className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors self-start sm:self-auto px-3 py-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="font-medium">Сбросить все</span>
          </button>
        )}
      </div>

      {/* --- ИЗМЕНЕНИЕ: Используем Flexbox вместо Grid --- */}
      <div className="flex flex-wrap items-center gap-4">
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
          icon={Baby}
          options={AGE_OPTIONS}
          value={filters.age}
          onChange={(value) => handleFilterChange('age', value)}
          isActive={filters.age !== 'all'}
        />
        <DropdownSelect
          label="Уровень опыта"
          icon={Award}
          options={EXPERIENCE_OPTIONS}
          value={filters.experience}
          onChange={(value) => handleFilterChange('experience', value)}
          isActive={filters.experience !== 'all'}
        />
        <DropdownSelect
          label="Участие в походах"
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
