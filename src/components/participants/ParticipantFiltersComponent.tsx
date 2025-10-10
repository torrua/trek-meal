// src/components/participants/ParticipantFiltersComponent.tsx

import React, { useCallback, useMemo } from 'react';
import { Users, MapPin, Award, Baby } from 'lucide-react';
import {
  GENDER_OPTIONS,
  AGE_OPTIONS,
  EXPERIENCE_OPTIONS,
  TRIPS_OPTIONS,
} from '../../constants/participants';
import FiltersPanel from '../../ui/filters/FiltersPanel';

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
  const handlePanelChange = useCallback(
    (next: Partial<ParticipantFilters>) => onFiltersChange({ ...filters, ...next }),
    [filters, onFiltersChange]
  );

  const fields = useMemo(
    () => [
      { type: 'select', name: 'gender', label: 'Пол', icon: Users, options: GENDER_OPTIONS },
      { type: 'select', name: 'age', label: 'Возраст', icon: Baby, options: AGE_OPTIONS },
      {
        type: 'select',
        name: 'experience',
        label: 'Уровень опыта',
        icon: Award,
        options: EXPERIENCE_OPTIONS,
      },
      {
        type: 'select',
        name: 'hasTrips',
        label: 'Участие в походах',
        icon: MapPin,
        options: TRIPS_OPTIONS,
      },
    ],
    []
  );

  return <FiltersPanel values={filters} onChange={handlePanelChange} fields={fields} />;
};

export default ParticipantFiltersComponent;
