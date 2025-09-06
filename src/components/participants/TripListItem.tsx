// src/components/participants/TripListItem.tsx

import React from 'react';
import cn from 'classnames';
import { Calendar, MapPin, ExternalLink, Trash2, Users, Backpack } from 'lucide-react';
import type { Trip } from '../../types';
import { formatDate, getEffectiveStatus } from '../../utils/index';
import { DIFFICULTY_CONFIG, STATUS_CONFIG } from '../../constants/trips';
import { isFuture, parseISO } from 'date-fns';

interface TripListItemProps {
  trip: Trip;
  onRemove: () => void;
  onView: () => void;
}

const TripListItem: React.FC<TripListItemProps> = ({ trip, onRemove, onView }) => {
  const _difficultyInfo = DIFFICULTY_CONFIG[trip.difficulty];
  const effectiveStatus = getEffectiveStatus(trip);
  const statusConfig = STATUS_CONFIG[effectiveStatus];

  // Status-based border color (following UI Card Layout Standards)
  const statusBorderColor =
    effectiveStatus === 'planning'
      ? '#f97316' // orange-600
      : effectiveStatus === 'active'
        ? '#9333ea' // purple-600
        : '#4b5563'; // gray-600

  return (
    <div
      className={cn(
        'group relative bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-l-4 px-3 py-2 transition-all duration-200 hover:shadow-sm hover:border-gray-300 dark:hover:border-gray-600'
      )}
      style={{ borderLeftColor: statusBorderColor }}
      data-testid={`trip-${trip.id}`}
    >
      {/* One-line layout with justify-between */}
      <div className="flex items-center justify-between">
        {/* Left section: Status • Title • Place */}
        <div className="flex items-center gap-x-1.5 text-sm min-w-0">
          <div
            className={cn(
              'flex items-center gap-1 text-xs',
              effectiveStatus === 'planning'
                ? 'text-orange-600 dark:text-orange-400'
                : effectiveStatus === 'active'
                  ? 'text-purple-600 dark:text-purple-400'
                  : 'text-gray-600 dark:text-gray-400'
            )}
            title={statusConfig.label}
          >
            <statusConfig.icon className="w-4 h-4" />
            {isFuture(parseISO(trip.startDate)) && <span className="font-medium">План</span>}
          </div>
          <span className="text-gray-400 dark:text-gray-500 text-xs select-none">•</span>
          <h3 className="font-semibold text-gray-900 dark:text-white truncate">{trip.name}</h3>
          {trip.destination && (
            <>
              <span className="text-gray-400 dark:text-gray-500 text-xs select-none">•</span>
              <div
                className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400"
                title="Место"
              >
                <MapPin className="w-4 h-4" />
                <span className="font-medium truncate max-w-[120px]">{trip.destination}</span>
              </div>
            </>
          )}
        </div>

        {/* Right section: Date • Participants • Equipment + context menu */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-x-1.5 text-sm">
            {trip.startDate && (
              <>
                <div
                  className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400"
                  title="Дата начала"
                >
                  <Calendar className="w-4 h-4" />
                  <span className="font-medium">{formatDate(trip.startDate)}</span>
                </div>
                <span className="text-gray-400 dark:text-gray-500 text-xs select-none">•</span>
              </>
            )}
            <div
              className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400"
              title="Участники"
            >
              <Users className="w-4 h-4" />
              <span className="font-medium">{trip.participants.length}</span>
            </div>
            <span className="text-gray-400 dark:text-gray-500 text-xs select-none">•</span>
            <div
              className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400"
              title="Снаряжение"
            >
              <Backpack className="w-4 h-4" />
              <span className="font-medium">0</span>
            </div>
          </div>

          {/* Context menu buttons */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onView();
              }}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
              title="Открыть поход"
              aria-label={`Открыть поход ${trip.name}`}
            >
              <ExternalLink className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              className="p-1 hover:bg-red-100 dark:hover:bg-red-900/50 rounded transition-colors"
              title="Убрать из похода"
              aria-label={`Убрать из похода ${trip.name}`}
            >
              <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripListItem;
