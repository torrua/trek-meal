// src/components/trips/TripListItemForMain.tsx

import React from 'react';
import cn from 'classnames';
import { Calendar, MapPin, Trash2, Users, Edit, Copy, Share } from 'lucide-react';
import type { Trip } from '../../types';
import { formatDate, getEffectiveStatus } from '../../utils/index';
import { DIFFICULTY_CONFIG, STATUS_CONFIG } from '../../constants/trips';
import { isFuture, parseISO } from 'date-fns';

interface TripListItemForMainProps {
  trip: Trip;
  isSelected?: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onClone: () => void;
  onExport: () => void;
  onDelete: () => void;
}

const TripListItemForMain: React.FC<TripListItemForMainProps> = ({
  trip,
  isSelected = false,
  onSelect,
  onEdit,
  onClone,
  onExport,
  onDelete,
}) => {
  const difficultyInfo = DIFFICULTY_CONFIG[trip.difficulty];
  const effectiveStatus = getEffectiveStatus(trip);
  const statusConfig = STATUS_CONFIG[effectiveStatus];

  // Status-based border color (following UI standards)
  const statusBorderColor =
    effectiveStatus === 'planning'
      ? '#f97316' // orange-600
      : effectiveStatus === 'active'
        ? '#9333ea' // purple-600
        : '#4b5563'; // gray-600

  const DifficultyIcon = difficultyInfo.icon;

  return (
    <div
      onClick={onSelect}
      className={cn(
        'group relative bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-l-4 px-3 py-2 transition-all duration-200 hover:shadow-sm hover:border-gray-300 dark:hover:border-gray-600 cursor-pointer',
        isSelected && 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20'
      )}
      style={{ borderLeftColor: statusBorderColor }}
      data-testid={`trip-main-${trip.id}`}
    >
      {/* One-line layout with justify-between */}
      <div className="flex items-center justify-between">
        {/* Left section: Difficulty • Trip Name • Place */}
        <div className="flex items-center gap-x-1.5 text-sm min-w-0">
          <div title={`Сложность: ${difficultyInfo.label}`}>
            <DifficultyIcon className={cn('w-4 h-4', difficultyInfo.colorClassName)} />
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

        {/* Right section: Status • Date • Participants + context menu */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-x-1.5 text-sm">
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
            {trip.startDate && (
              <>
                <span className="text-gray-400 dark:text-gray-500 text-xs select-none">•</span>
                <div
                  className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400"
                  title="Дата начала"
                >
                  <Calendar className="w-4 h-4" />
                  <span className="font-medium">{formatDate(trip.startDate)}</span>
                </div>
              </>
            )}
            <span className="text-gray-400 dark:text-gray-500 text-xs select-none">•</span>
            <div
              className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400"
              title="Участники"
            >
              <Users className="w-4 h-4" />
              <span className="font-medium">{trip.participants.length}</span>
            </div>
          </div>

          {/* Context menu buttons */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
              title="Редактировать"
              aria-label={`Редактировать ${trip.name}`}
            >
              <Edit className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onClone();
              }}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
              title="Клонировать"
              aria-label={`Клонировать ${trip.name}`}
            >
              <Copy className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onExport();
              }}
              className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
              title="Экспорт"
              aria-label={`Экспортировать ${trip.name}`}
            >
              <Share className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
              className="p-1 hover:bg-red-100 dark:hover:bg-red-900/50 rounded transition-colors"
              title="Удалить"
              aria-label={`Удалить ${trip.name}`}
            >
              <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripListItemForMain;
