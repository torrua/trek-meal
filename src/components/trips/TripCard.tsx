// src/components/trips/TripCard.tsx

import React, { useState } from 'react';
import { MapPin, Users, Calendar, Copy, Trash2, Share } from 'lucide-react';
import cn from 'classnames';
import { isPast, isFuture, parseISO } from 'date-fns';
import type { Trip, TripStatus } from '../../types';
import { formatDate } from '../../utils';
import { DIFFICULTY_CONFIG, STATUS_CONFIG } from '../../constants/trips';

interface TripCardProps {
  trip: Trip;
  isSelected: boolean;
  onSelect: (id: number) => void;
  onDelete: () => void;
  onClone: () => void;
  onEdit: () => void;
  onExport: () => void;
}

const TripCard: React.FC<TripCardProps> = ({
  trip,
  isSelected,
  onSelect,
  onDelete,
  onClone,
  onExport,
}) => {
  const [showActions, setShowActions] = useState(false);

  const getEffectiveStatus = (): TripStatus => {
    if (!trip.startDate || !trip.endDate) {
      return 'planning';
    }
    const start = parseISO(trip.startDate);
    const end = parseISO(trip.endDate);
    if (isPast(end)) return 'completed';
    if (isFuture(start)) return 'planning';
    return 'active';
  };

  const effectiveStatus = getEffectiveStatus();
  const difficultyConfig = DIFFICULTY_CONFIG[trip.difficulty];
  const statusConfig = STATUS_CONFIG[effectiveStatus];
  const DifficultyIcon = difficultyConfig.icon;

  return (
    <div
      className={cn(
        'group relative bg-white dark:bg-gray-800 rounded-lg border transition-all duration-200 hover:shadow-lg cursor-pointer',
        'border-l-4',
        statusConfig.borderClassName,
        isSelected
          ? 'border-blue-400 shadow-blue-100 dark:shadow-blue-900/20 shadow-lg'
          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover-border-gray-600'
      )}
      onClick={() => onSelect(trip.id)}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div
        className={cn(
          'absolute top-3 right-3 z-10 transition-opacity duration-200',
          showActions || isSelected ? 'opacity-100' : 'opacity-0'
        )}
      >
        <div className="flex items-center gap-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onExport();
            }}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
            title="Экспортировать"
          >
            <Share className="w-3.5 h-3.5 text-gray-600 dark:text-gray-300" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClone();
            }}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
            title="Клонировать"
          >
            <Copy className="w-3.5 h-3.5 text-gray-600 dark:text-gray-300" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-md transition-colors"
            title="Удалить"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
          </button>
        </div>
      </div>

      <div className="p-4">
        <div className="min-w-0 flex-1 space-y-2">
          {/* --- ИЗМЕНЕНИЕ: Новая двухстрочная структура --- */}
          <div className="flex items-center gap-2">
            <div title={`Сложность: ${difficultyConfig.label}`}>
              <DifficultyIcon className={cn('w-4 h-4', difficultyConfig.colorClassName)} />
            </div>
            <span className="text-gray-300 dark:text-gray-600 font-light">•</span>
            <h3 className="font-semibold text-gray-900 dark:text-white truncate">{trip.name}</h3>
          </div>

          <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400 flex-wrap">
            <div className="flex items-center gap-1.5" title="Участники">
              <Users className="w-4 h-4" />
              <span className="font-medium">{trip.participants.length}</span>
            </div>
            {trip.destination && (
              <>
                <span className="text-gray-300 dark:text-gray-600 font-light">•</span>
                <div className="flex items-center gap-1.5" title="Место">
                  <MapPin className="w-4 h-4" />
                  <span className="font-medium truncate">{trip.destination}</span>
                </div>
              </>
            )}
            {trip.startDate && (
              <>
                <span className="text-gray-300 dark:text-gray-600 font-light">•</span>
                <div className="flex items-center gap-1.5" title="Дата начала">
                  <Calendar className="w-4 h-4" />
                  <span className="font-medium">{formatDate(trip.startDate)}</span>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripCard;
