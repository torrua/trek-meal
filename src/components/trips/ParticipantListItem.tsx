// src/components/trips/ParticipantListItem.tsx

import React from 'react';
import cn from 'classnames';
import { MapPin, Backpack, ExternalLink, Trash2 } from 'lucide-react';
import type { Participant } from '../../types';
import { calculateAge } from '../../utils';
import { GENDER_CONFIG, EXPERIENCE_CONFIG } from '../../constants/participants';
import useTripStore from '../../stores/useTripStore';

interface ParticipantListItemProps {
  participant: Participant;
  onRemove: () => void;
  onView: () => void;
}

const ParticipantListItem: React.FC<ParticipantListItemProps> = ({
  participant,
  onRemove,
  onView,
}) => {
  const { trips } = useTripStore();
  const genderInfo = GENDER_CONFIG[participant.gender];
  const experienceInfo = EXPERIENCE_CONFIG[participant.experienceLevel];
  const age = calculateAge(participant.birthDate);
  const isChild = participant.age === 'child';
  const tripCount = trips.filter((trip) => trip.participants.includes(participant.id)).length;
  const equipmentCount = 0; // Заглушка

  const ExperienceIcon = experienceInfo.icon;

  return (
    <div
      className={cn(
        'group relative bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-l-4 p-3 transition-colors hover:border-gray-300 dark:hover:border-gray-600',
        genderInfo.borderClassName
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex flex-col">
            <h3 className="font-semibold text-gray-900 dark:text-white truncate">
              {participant.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 flex-shrink-0">
              {age ? `${age} лет` : isChild ? 'Ребенок' : 'Взрослый'}
            </p>
          </div>
          <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
            <div title={`Опыт: ${experienceInfo.label}`}>
              <ExperienceIcon className={cn('w-4 h-4', experienceInfo.colorClassName)} />
            </div>
            <span className="text-gray-300 dark:text-gray-600 font-light">•</span>
            <div className="flex items-center gap-1.5" title="Походы">
              <MapPin className="w-4 h-4" />
              <span className="font-medium">{tripCount}</span>
            </div>
            <span className="text-gray-300 dark:text-gray-600 font-light">•</span>
            <div className="flex items-center gap-1.5" title="Снаряжение">
              <Backpack className="w-4 h-4" />
              <span className="font-medium">{equipmentCount}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute top-1/2 -translate-y-1/2 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="flex items-center gap-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-1">
          <button
            onClick={onView}
            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
            title="Перейти к участнику"
          >
            <ExternalLink className="w-3.5 h-3.5 text-gray-600 dark:text-gray-300" />
          </button>
          <button
            onClick={onRemove}
            className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-md transition-colors"
            title="Удалить из похода"
          >
            <Trash2 className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ParticipantListItem;
