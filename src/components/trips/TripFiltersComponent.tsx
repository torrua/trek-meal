// src/components/trips/TripFiltersComponent.tsx

import React, { useCallback, useMemo } from 'react';
import { List, Gauge } from 'lucide-react';
import { TRIP_STATUS_OPTIONS, TRIP_DIFFICULTY_OPTIONS } from '../../constants/trips';
import FiltersPanel from '../../ui/filters/FiltersPanel';

export interface TripFilters {
  status: 'all' | 'planning' | 'completed' | 'active';
  difficulty: 'all' | 'easy' | 'medium' | 'hard';
}

interface TripFiltersProps {
  filters: TripFilters;
  onFiltersChange: (filters: TripFilters) => void;
  className?: string;
}

const TripFiltersComponent: React.FC<TripFiltersProps> = ({
  filters,
  onFiltersChange,
  className,
}) => {
  const handlePanelChange = useCallback(
    (next: Partial<TripFilters>) => onFiltersChange({ ...filters, ...next }),
    [filters, onFiltersChange]
  );

  const fields = useMemo(
    () => [
      { type: 'select', name: 'status', label: 'Статус', icon: List, options: TRIP_STATUS_OPTIONS },
      {
        type: 'select',
        name: 'difficulty',
        label: 'Сложность',
        icon: Gauge,
        options: TRIP_DIFFICULTY_OPTIONS,
      },
    ],
    []
  );

  return (
    <div className={className} data-testid="trip-filters">
      <FiltersPanel values={filters} onChange={handlePanelChange} fields={fields} />
    </div>
  );
};

export default TripFiltersComponent;
