// src/components/participants/ParticipantCard.tsx

import React, { useState } from 'react';
import { Copy, Trash2, MapPin, Backpack, Share } from 'lucide-react';
import cn from 'classnames';
import type { Participant } from '../../types';
import { calculateAge } from '../../utils';
import { EXPERIENCE_CONFIG, GENDER_CONFIG } from '../../constants/participants';
import useTripStore from '../../stores/useTripStore';

interface ParticipantCardProps {
  participant: Participant;
  isSelected: boolean;
  onSelect: (id: number) => void;
  onEdit: () => void;
  onClone: () => void;
  onDelete: () => void;
  onAddToTrip: () => void;
  onAddEquipment: () => void;
  onExport: () => void;
}

const ParticipantCard: React.FC<ParticipantCardProps> = ({
  participant,
  isSelected,
  onSelect,
  onClone,
  onDelete,
  onExport,
}) => {
  const [showActions, setShowActions] = useState(false);
  const { trips } = useTripStore();

  const experienceInfo = EXPERIENCE_CONFIG[participant.experienceLevel];
  const genderInfo = GENDER_CONFIG[participant.gender];
  const age = calculateAge(participant.birthDate);
  const isChild = participant.age === 'child';
  const participantTrips = trips.filter((trip) => trip.participants.includes(participant.id));

  const tripCount = participantTrips.length;
  const equipmentCount = 0;

  const ExperienceIcon = experienceInfo.icon;

  return (
    <div
      className={cn(
        'group relative bg-white dark:bg-gray-800 rounded-lg border transition-all duration-200 hover:shadow-lg cursor-pointer',
        'border-l-4',
        genderInfo.borderClassName,
        isSelected
          ? 'border-blue-400 shadow-blue-100 dark:shadow-blue-900/20 shadow-lg'
          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
      )}
      onClick={() => onSelect(participant.id)}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div
        className={cn(
          'absolute top-2 right-2 z-10 transition-opacity duration-200',
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

      <div className="p-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-gray-900 dark:text-white truncate">
              {participant.name}
            </h3>
            <span className="text-gray-300 dark:text-gray-600 font-light">•</span>
            <p className="text-sm text-gray-500 dark:text-gray-400 flex-shrink-0">
              {age ? `${age} лет` : isChild ? 'Ребенок' : 'Взрослый'}
            </p>
          </div>

          <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
            <div title={`Опыт: ${experienceInfo.label}`}>
              <ExperienceIcon className={cn('w-4 h-4', experienceInfo.colorClassName)} />
            </div>
            <span className="text-gray-300 dark:text-gray-600 font-light">•</span>
            <div className="flex items-center gap-1" title="Походы">
              <MapPin className="w-4 h-4" />
              <span className="font-medium">{tripCount}</span>
            </div>
            <span className="text-gray-300 dark:text-gray-600 font-light">•</span>
            <div className="flex items-center gap-1" title="Снаряжение">
              <Backpack className="w-4 h-4" />
              <span className="font-medium">{equipmentCount}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParticipantCard;
