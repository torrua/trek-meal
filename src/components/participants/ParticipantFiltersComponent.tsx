// src/components/participants/ParticipantFiltersComponent.tsx

import React from 'react';
import type { Gender, AgeGroup, ExperienceLevel } from '../../types';
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
}) => {
  const handleFilterChange = (
    key: keyof ParticipantFilters,
    option: SingleValue<FilterOption<string>>
  ) => {
    onFiltersChange({
      ...filters,
      [key]: option?.value || 'all',
    });
  };

  return (
    <div className="w-72 space-y-4">
      <h3 className="text-sm font-medium text-foreground">Фильтры</h3>
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
  );
};

export default ParticipantFiltersComponent;
