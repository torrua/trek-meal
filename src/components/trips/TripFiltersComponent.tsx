// src/components/trips/TripFiltersComponent.tsx

import React from 'react';
import { List, Gauge, RotateCcw } from 'lucide-react';
import { TRIP_STATUS_OPTIONS, TRIP_DIFFICULTY_OPTIONS } from '../../constants/trips';
import DropdownSelect from '../../ui/DropdownSelect';

export interface TripFilters {
  status: 'all' | 'planning' | 'completed';
  difficulty: 'all' | 'easy' | 'medium' | 'hard';
}

interface TripFiltersProps {
  filters: TripFilters;
  onFiltersChange: (filters: TripFilters) => void;
}

const TripFiltersComponent: React.FC<TripFiltersProps> = ({ filters, onFiltersChange }) => {
  const handleFilterChange = (filterKey: keyof TripFilters, value: string) => {
    onFiltersChange({ ...filters, [filterKey]: value });
  };

  const handleReset = () => {
    onFiltersChange({ status: 'all', difficulty: 'all' });
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
      <div className="grid gap-4 grid-cols-[repeat(auto-fit,minmax(200px,1fr))]">
        <DropdownSelect
          label="Статус"
          icon={List}
          options={TRIP_STATUS_OPTIONS}
          value={filters.status}
          onChange={(value) => handleFilterChange('status', value)}
          isActive={filters.status !== 'all'}
        />
        <DropdownSelect
          label="Сложность"
          icon={Gauge}
          options={TRIP_DIFFICULTY_OPTIONS}
          value={filters.difficulty}
          onChange={(value) => handleFilterChange('difficulty', value)}
          isActive={filters.difficulty !== 'all'}
        />
      </div>
    </div>
  );
};

export default TripFiltersComponent;
