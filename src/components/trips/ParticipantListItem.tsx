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
  const _genderInfo = GENDER_CONFIG[participant.gender]; // Keep for potential future use
  const experienceInfo = EXPERIENCE_CONFIG[participant.experienceLevel];
  const age = calculateAge(participant.birthDate);
  const isChild = participant.age === 'child';
  const tripCount = trips.filter((trip) => trip.participants.includes(participant.id)).length;
  const equipmentCount = 0; // Заглушка

  const ExperienceIcon = experienceInfo.icon;

  return (
    <div
      className={cn(
        'group relative bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-l-4 px-3 py-2 transition-all duration-200 hover:shadow-sm hover:border-gray-300 dark:hover:border-gray-600'
      )}
      style={{ borderLeftColor: experienceInfo.borderColor }}
      data-testid={`participant-${participant.id}`}
    >
      {/* КОМПАКТНАЯ однострочная информация */}
      <div className="flex items-center justify-between">
        {/* Left section: Experience • Name • Age */}
        <div className="flex items-center gap-x-1.5 text-sm">
          <div title={`Опыт: ${experienceInfo.label}`}>
            <ExperienceIcon className={cn('w-4 h-4', experienceInfo.colorClassName)} />
          </div>
          <span className="text-gray-400 dark:text-gray-500 text-xs select-none">•</span>
          <h3 className="font-semibold text-gray-900 dark:text-white truncate">
            {participant.name}
          </h3>
          <span className="text-gray-400 dark:text-gray-500 text-xs select-none">•</span>
          <p className="text-gray-500 dark:text-gray-400 flex-shrink-0">
            {age ? `${age} лет` : isChild ? 'Ребенок' : 'Взрослый'}
          </p>
        </div>

        {/* Right section: Trips • Equip + context menu */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-x-1.5 text-sm">
            <div
              className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400"
              title="Походы"
            >
              <MapPin className="w-4 h-4" />
              <span className="font-medium">{tripCount}</span>
            </div>
            <span className="text-gray-400 dark:text-gray-500 text-xs select-none">•</span>
            <div
              className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400"
              title="Снаряжение"
            >
              <Backpack className="w-4 h-4" />
              <span className="font-medium">{equipmentCount}</span>
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
              title="Открыть профиль"
              aria-label={`Открыть профиль ${participant.name}`}
            >
              <ExternalLink className="w-4 h-4 text-gray-600 dark:text-gray-300" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              className="p-1 hover:bg-red-100 dark:hover:bg-red-900/50 rounded transition-colors"
              title="Удалить из похода"
              aria-label={`Удалить ${participant.name} из похода`}
            >
              <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParticipantListItem;
