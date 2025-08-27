// src/components/participants/ParticipantFilters.tsx

import React from 'react';
import { X, Filter } from 'lucide-react';
import type { Gender, AgeGroup, ExperienceLevel } from '../../types';

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

const ParticipantFiltersComponent: React.FC<ParticipantFiltersProps> = ({
  filters,
  onFiltersChange,
  onReset,
}) => {
  const handleFilterChange = (key: keyof ParticipantFilters, value: string) => {
    onFiltersChange({
      ...filters,
      [key]: value,
    });
  };

  const hasActiveFilters = Object.values(filters).some((value) => value !== 'all');

  return (
    <div className="bg-card border border-border rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-medium text-foreground">Фильтры</h3>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onReset}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <X className="h-3 w-3" />
            Сбросить
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Фильтр по полу */}
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">Пол</label>
          <select
            value={filters.gender}
            onChange={(e) => handleFilterChange('gender', e.target.value)}
            className="w-full px-2 py-1 text-sm border border-input rounded bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="all">Все</option>
            <option value="male">Мужской</option>
            <option value="female">Женский</option>
          </select>
        </div>

        {/* Фильтр по возрасту */}
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">Возраст</label>
          <select
            value={filters.age}
            onChange={(e) => handleFilterChange('age', e.target.value)}
            className="w-full px-2 py-1 text-sm border border-input rounded bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="all">Все</option>
            <option value="adult">Взрослые</option>
            <option value="child">Дети</option>
          </select>
        </div>

        {/* Фильтр по опыту */}
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">Опыт</label>
          <select
            value={filters.experience}
            onChange={(e) => handleFilterChange('experience', e.target.value)}
            className="w-full px-2 py-1 text-sm border border-input rounded bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="all">Любой</option>
            <option value="beginner">Новички</option>
            <option value="experienced">Опытные</option>
            <option value="professional">Профессионалы</option>
          </select>
        </div>

        {/* Фильтр по участию в походах */}
        <div>
          <label className="block text-xs font-medium text-muted-foreground mb-1">Походы</label>
          <select
            value={filters.hasTrips}
            onChange={(e) => handleFilterChange('hasTrips', e.target.value)}
            className="w-full px-2 py-1 text-sm border border-input rounded bg-background text-foreground focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="all">Все</option>
            <option value="with_trips">С походами</option>
            <option value="without_trips">Без походов</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default ParticipantFiltersComponent;
