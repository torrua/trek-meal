// src/components/participants/ParticipantCard.tsx

import React, { useState } from 'react';
import { Edit, Copy, Trash2, Baby, User, MapPin, Phone, Mail } from 'lucide-react';
import cn from 'classnames';
import type { Participant } from '../../types';
import { calculateAge } from '../../utils';
import { EXPERIENCE_CONFIG } from '../../constants/participants';
import useTripStore from '../../stores/useTripStore';

interface ParticipantCardProps {
  participant: Participant;
  isSelected: boolean;
  onSelect: (id: number) => void;
  onEdit: () => void;
  onClone: () => void;
  onDelete: () => void;
}

const ParticipantCard: React.FC<ParticipantCardProps> = ({
  participant,
  isSelected,
  onSelect,
  onEdit,
  onClone,
  onDelete,
}) => {
  const [showActions, setShowActions] = useState(false);
  const { trips } = useTripStore();

  const experienceInfo = EXPERIENCE_CONFIG[participant.experienceLevel];
  const age = calculateAge(participant.birthDate);
  const isChild = participant.age === 'child';
  const participantTrips = trips.filter((trip) => trip.participants.includes(participant.id));

  return (
    <div
      className={cn(
        'group relative bg-white dark:bg-gray-800 rounded-xl border transition-all duration-200 hover:shadow-lg cursor-pointer',
        isSelected
          ? 'border-blue-500 shadow-lg ring-2 ring-blue-500/20'
          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
      )}
      onClick={() => onSelect(participant.id)}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div
        className={cn(
          'absolute top-3 right-3 z-10 transition-opacity duration-200',
          showActions ? 'opacity-100' : 'opacity-0'
        )}
      >
        <div className="flex items-center gap-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-1">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
            title="Редактировать"
          >
            <Edit className="w-3.5 h-3.5 text-gray-600 dark:text-gray-300" />
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
        <div className="flex items-start gap-3 mb-3">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center">
              {isChild ? (
                <Baby className="w-6 h-6 text-white" />
              ) : (
                <User className="w-6 h-6 text-white" />
              )}
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-white truncate">
              {participant.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
              {age ? `${age} лет` : isChild ? 'Ребенок' : 'Взрослый'}
            </p>
          </div>
        </div>
        <div className="mb-4">
          <span
            className={cn(
              'inline-flex items-center px-3 py-1.5 rounded-full text-xs font-medium border',
              experienceInfo.className
            )}
          >
            {experienceInfo.label}
          </span>
        </div>
        <div className="space-y-2 mb-4">
          {participant.phone && (
            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
              <Phone className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              <span className="truncate">{participant.phone}</span>
            </div>
          )}
          {participant.email && (
            <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
              <Mail className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
              <span className="truncate">{participant.email}</span>
            </div>
          )}
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <MapPin className="w-3.5 h-3.5" />
            <span>
              {participantTrips.length}{' '}
              {participantTrips.length === 1
                ? 'поход'
                : participantTrips.length > 1 && participantTrips.length < 5
                  ? 'похода'
                  : 'походов'}
            </span>
          </div>
          {participantTrips.length > 0 && (
            <div className="w-2 h-2 bg-green-500 rounded-full" title="Активный участник" />
          )}
        </div>
        {participant.notes && (
          <div className="mt-3 p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
            <p className="text-xs text-amber-800 dark:text-amber-200 line-clamp-2">
              {participant.notes}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ParticipantCard;
