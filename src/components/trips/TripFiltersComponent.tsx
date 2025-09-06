// src/components/trips/TripFiltersComponent.tsx

import React, { useCallback } from 'react';
import { List, Gauge, RotateCcw, X } from 'lucide-react';
import { TRIP_STATUS_OPTIONS, TRIP_DIFFICULTY_OPTIONS } from '../../constants/trips';
import DropdownSelect from '../../ui/DropdownSelect';
import Button from '../../ui/Button';

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
  const handleFilterChange = useCallback(
    (filterKey: keyof TripFilters, value: string) => {
      onFiltersChange({ ...filters, [filterKey]: value });
    },
    [filters, onFiltersChange]
  );

  const handleReset = useCallback(() => {
    onFiltersChange({ status: 'all', difficulty: 'all' });
  }, [onFiltersChange]);

  const handleClearFilter = useCallback(
    (filterKey: keyof TripFilters) => {
      onFiltersChange({ ...filters, [filterKey]: 'all' });
    },
    [filters, onFiltersChange]
  );

  const hasActiveFilters = Object.values(filters).some((value) => value !== 'all');
  const activeFiltersCount = Object.values(filters).filter((value) => value !== 'all').length;

  return (
    <div className={className} data-testid="trip-filters">
      <div className="space-y-4">
        {/* Заголовок с кнопкой сброса */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-900 dark:text-white">Фильтры</span>
            {activeFiltersCount > 0 && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                {activeFiltersCount}
              </span>
            )}
          </div>

          {hasActiveFilters && (
            <Button
              onClick={handleReset}
              variant="ghost"
              size="sm"
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 self-start sm:self-auto"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Сбросить все</span>
            </Button>
          )}
        </div>

        {/* Фильтры */}
        <div className="flex flex-col sm:flex-row items-start gap-4">
          <div className="relative">
            <DropdownSelect
              label="Статус"
              icon={List}
              options={TRIP_STATUS_OPTIONS || []}
              value={filters.status}
              onChange={(value) => handleFilterChange('status', value)}
              isActive={filters.status !== 'all'}
              data-testid="status-filter"
            />
            {filters.status !== 'all' && (
              <button
                onClick={() => handleClearFilter('status')}
                className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors z-10"
                title="Очистить фильтр статуса"
                aria-label="Очистить фильтр статуса"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="relative">
            <DropdownSelect
              label="Сложность"
              icon={Gauge}
              options={TRIP_DIFFICULTY_OPTIONS || []}
              value={filters.difficulty}
              onChange={(value) => handleFilterChange('difficulty', value)}
              isActive={filters.difficulty !== 'all'}
              data-testid="difficulty-filter"
            />
            {filters.difficulty !== 'all' && (
              <button
                onClick={() => handleClearFilter('difficulty')}
                className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors z-10"
                title="Очистить фильтр сложности"
                aria-label="Очистить фильтр сложности"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>
        </div>

        {/* Активные фильтры в виде тегов (альтернативный способ отображения) */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            <span className="text-xs text-gray-500 dark:text-gray-400 self-center">
              Активные фильтры:
            </span>

            {filters.status !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                <List className="w-3 h-3" />
                {TRIP_STATUS_OPTIONS?.find((opt) => opt.value === filters.status)?.label ||
                  filters.status}
                <button
                  onClick={() => handleClearFilter('status')}
                  className="ml-1 hover:bg-blue-200 dark:hover:bg-blue-800 rounded-full p-0.5"
                  aria-label="Удалить фильтр статуса"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            )}

            {filters.difficulty !== 'all' && (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                <Gauge className="w-3 h-3" />
                {TRIP_DIFFICULTY_OPTIONS?.find((opt) => opt.value === filters.difficulty)?.label ||
                  filters.difficulty}
                <button
                  onClick={() => handleClearFilter('difficulty')}
                  className="ml-1 hover:bg-green-200 dark:hover:bg-green-800 rounded-full p-0.5"
                  aria-label="Удалить фильтр сложности"
                >
                  <X className="w-2.5 h-2.5" />
                </button>
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TripFiltersComponent;
