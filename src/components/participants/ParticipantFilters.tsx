// src/components/participants/ParticipantFilters.tsx

import React, { useState } from 'react';
import { X, Filter, ChevronDown } from 'lucide-react';
import type { Gender, AgeGroup, ExperienceLevel } from '../../types';
import cn from 'classnames';
import ThemedSelect from '../../ui/ThemedSelect';
import { SingleValue } from 'react-select';

export interface ParticipantFilters {
  gender: Gender | 'all';
  age: AgeGroup | 'all';
  experience: ExperienceLevel | 'all';
  hasTrips: 'all' | 'with_trips' | 'without_trips';
}

interface ParticipantFiltersProps {
  filters: ParticipantFilters;
  onFiltersChange: (filters: ParticipantFilters) => void;
  onReset: () => void;
}

type FilterOption<T> = { value: T; label: string };

const GENDER_OPTIONS: FilterOption<Gender | 'all'>[] = [
  { value: 'all', label: 'Пол: Все' },
  { value: 'male', label: 'Мужской' },
  { value: 'female', label: 'Женский' },
];
const AGE_OPTIONS: FilterOption<AgeGroup | 'all'>[] = [
  { value: 'all', label: 'Возраст: Все' },
  { value: 'adult', label: 'Взрослые' },
  { value: 'child', label: 'Дети' },
];
const EXP_OPTIONS: FilterOption<ExperienceLevel | 'all'>[] = [
  { value: 'all', label: 'Опыт: Любой' },
  { value: 'beginner', label: 'Новички' },
  { value: 'experienced', label: 'Опытные' },
  { value: 'professional', label: 'Профессионалы' },
];
const TRIPS_OPTIONS: FilterOption<'all' | 'with_trips' | 'without_trips'>[] = [
  { value: 'all', label: 'Походы: Все' },
  { value: 'with_trips', label: 'С походами' },
  { value: 'without_trips', label: 'Без походов' },
];

const ParticipantFiltersComponent: React.FC<ParticipantFiltersProps> = ({
  filters,
  onFiltersChange,
  onReset,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterChange = (
    key: keyof ParticipantFilters,
    option: SingleValue<FilterOption<string>>
  ) => {
    onFiltersChange({
      ...filters,
      [key]: option?.value || 'all',
    });
  };

  const hasActiveFilters = Object.values(filters).some((value) => value !== 'all');

  return (
    <div className="bg-card border rounded-lg mb-6 transition-all duration-300">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4"
      >
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-medium text-foreground">Фильтры</h3>
          {hasActiveFilters && <div className="w-2 h-2 rounded-full bg-primary" />}
        </div>
        <div className="flex items-center gap-2">
          {hasActiveFilters && (
            <div
              onClick={(e) => {
                e.stopPropagation();
                onReset();
              }}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-3 w-3" />
              Сбросить
            </div>
          )}
          <ChevronDown
            className={cn('h-4 w-4 text-muted-foreground transition-transform', {
              'rotate-180': isExpanded,
            })}
          />
        </div>
      </button>

      {isExpanded && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-4 border-t">
          <ThemedSelect
            value={GENDER_OPTIONS.find((o) => o.value === filters.gender)}
            onChange={(opt) => handleFilterChange('gender', opt)}
            options={GENDER_OPTIONS}
          />
          <ThemedSelect
            value={AGE_OPTIONS.find((o) => o.value === filters.age)}
            onChange={(opt) => handleFilterChange('age', opt)}
            options={AGE_OPTIONS}
          />
          <ThemedSelect
            value={EXP_OPTIONS.find((o) => o.value === filters.experience)}
            onChange={(opt) => handleFilterChange('experience', opt)}
            options={EXP_OPTIONS}
          />
          <ThemedSelect
            value={TRIPS_OPTIONS.find((o) => o.value === filters.hasTrips)}
            onChange={(opt) => handleFilterChange('hasTrips', opt)}
            options={TRIPS_OPTIONS}
          />
        </div>
      )}
    </div>
  );
};

export default ParticipantFiltersComponent;
