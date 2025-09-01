// src/components/participants/ParticipantFiltersComponent.tsx

import React, { useState } from 'react';
import { Filter, X, Users, Baby, User, MapPin, RotateCcw, ChevronDown } from 'lucide-react';
import cn from 'classnames';
import {
  GENDER_OPTIONS,
  AGE_OPTIONS,
  EXPERIENCE_OPTIONS,
  TRIPS_OPTIONS,
} from '../../constants/participants';

export interface ParticipantFilters {
  gender: 'male' | 'female' | 'all';
  age: 'adult' | 'child' | 'all';
  experience: 'beginner' | 'experienced' | 'professional' | 'all';
  hasTrips: 'with_trips' | 'without_trips' | 'all';
}

interface ParticipantFiltersProps {
  filters: ParticipantFilters;
  onFiltersChange: (filters: ParticipantFilters) => void;
  stats: { [key: string]: number };
}

interface FilterOption {
  value: string;
  label: string;
  description?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

interface FilterDropdownProps {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  options: FilterOption[];
  value: string;
  onChange: (value: string) => void;
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({
  label,
  icon: Icon,
  options,
  value,
  onChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find((opt) => opt.value === value);
  const isActive = value !== 'all';

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center justify-between w-full px-4 py-2.5 rounded-xl border transition-all hover:shadow-sm',
          isActive
            ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300'
            : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300'
        )}
      >
        <div className="flex items-center gap-2 min-w-0">
          <Icon className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm font-medium truncate">
            {selectedOption ? selectedOption.label : label}
          </span>
        </div>
        <ChevronDown
          className={cn('w-4 h-4 transition-transform flex-shrink-0', isOpen ? 'rotate-180' : '')}
        />
      </button>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute z-50 top-full left-0 mt-2 min-w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl py-2">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={cn(
                  'w-full px-4 py-2.5 text-left text-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors flex items-center gap-3',
                  value === option.value
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                    : 'text-gray-700 dark:text-gray-300'
                )}
              >
                {option.icon && <option.icon className="w-4 h-4 flex-shrink-0" />}
                <div className="min-w-0 flex-1">
                  <div className="font-medium">{option.label}</div>
                  {option.description && (
                    <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {option.description}
                    </div>
                  )}
                </div>
                {value === option.value && (
                  <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

interface QuickFilterProps {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  isActive: boolean;
  onClick: () => void;
  count?: number;
}

const QuickFilter: React.FC<QuickFilterProps> = ({
  label,
  icon: Icon,
  isActive,
  onClick,
  count,
}) => (
  <button
    onClick={onClick}
    className={cn(
      'flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all hover:shadow-sm',
      isActive
        ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300'
        : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300'
    )}
  >
    <Icon className="w-4 h-4 flex-shrink-0" />
    <span className="text-sm font-medium whitespace-nowrap">{label}</span>
    {count !== undefined && (
      <span
        className={cn(
          'px-2 py-0.5 text-xs rounded-full flex-shrink-0',
          isActive
            ? 'bg-blue-600 text-white'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
        )}
      >
        {count}
      </span>
    )}
  </button>
);

const ParticipantFiltersComponent: React.FC<ParticipantFiltersProps> = ({
  filters,
  onFiltersChange,
  stats,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const handleFilterChange = (filterKey: keyof ParticipantFilters, value: string) => {
    onFiltersChange({ ...filters, [filterKey]: value });
  };

  const handleQuickFilterToggle = (filterKey: keyof ParticipantFilters, targetValue: string) => {
    const newValue = filters[filterKey] === targetValue ? 'all' : targetValue;
    handleFilterChange(filterKey, newValue);
  };

  const handleReset = () => {
    onFiltersChange({ gender: 'all', age: 'all', experience: 'all', hasTrips: 'all' });
  };

  const hasActiveFilters = Object.values(filters).some((value) => value !== 'all');
  const activeFiltersCount = Object.values(filters).filter((value) => value !== 'all').length;

  return (
    <div className="space-y-4">
      {/* Быстрые фильтры */}
      <div className="flex flex-wrap gap-2">
        <QuickFilter
          label="Взрослые"
          icon={User}
          isActive={filters.age === 'adult'}
          onClick={() => handleQuickFilterToggle('age', 'adult')}
          count={stats.adults}
        />
        <QuickFilter
          label="Дети"
          icon={Baby}
          isActive={filters.age === 'child'}
          onClick={() => handleQuickFilterToggle('age', 'child')}
          count={stats.children}
        />
        <QuickFilter
          label="С походами"
          icon={MapPin}
          isActive={filters.hasTrips === 'with_trips'}
          onClick={() => handleQuickFilterToggle('hasTrips', 'with_trips')}
          count={stats.withTrips}
        />
        <QuickFilter
          label="Без походов"
          icon={MapPin}
          isActive={filters.hasTrips === 'without_trips'}
          onClick={() => handleQuickFilterToggle('hasTrips', 'without_trips')}
          count={stats.withoutTrips}
        />
      </div>

      {/* Кнопка расширенных фильтров */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
        >
          <Filter className="w-4 h-4" />
          <span>Расширенные фильтры</span>
          <ChevronDown
            className={cn('w-4 h-4 transition-transform', isExpanded ? 'rotate-180' : '')}
          />
          {hasActiveFilters && (
            <span className="px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
              {activeFiltersCount}
            </span>
          )}
        </button>
        {hasActiveFilters && (
          <button
            onClick={handleReset}
            className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Сбросить все</span>
          </button>
        )}
      </div>

      {/* Расширенные фильтры */}
      <div
        className={cn(
          'grid transition-all duration-300 ease-in-out',
          isExpanded ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
        )}
      >
        <div className="overflow-hidden">
          <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <FilterDropdown
                label="Пол"
                icon={Users}
                options={GENDER_OPTIONS}
                value={filters.gender}
                onChange={(value) => handleFilterChange('gender', value)}
              />
              <FilterDropdown
                label="Возраст"
                icon={Users}
                options={AGE_OPTIONS}
                value={filters.age}
                onChange={(value) => handleFilterChange('age', value)}
              />
              <FilterDropdown
                label="Опыт"
                icon={Users}
                options={EXPERIENCE_OPTIONS}
                value={filters.experience}
                onChange={(value) => handleFilterChange('experience', value)}
              />
              <FilterDropdown
                label="Походы"
                icon={MapPin}
                options={TRIPS_OPTIONS}
                value={filters.hasTrips}
                onChange={(value) => handleFilterChange('hasTrips', value)}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParticipantFiltersComponent;
