// src/components/participants/ParticipantListItem.tsx

import React, { useMemo } from 'react';
import { Baby, User } from 'lucide-react';
import { PARTICIPANT_CONSTANTS } from '../../constants/participants';
import { calculateAge } from '../../utils';
import type { Participant } from '../../types';
import cn from 'classnames';

interface ParticipantListItemProps {
  participant: Participant;
  isSelected: boolean;
  onClick: () => void;
}

const ParticipantListItem: React.FC<ParticipantListItemProps> = ({
  participant,
  isSelected,
  onClick,
}) => {
  const { gender, age: ageGroup, name, experienceLevel, birthDate } = participant;

  const experienceInfo = PARTICIPANT_CONSTANTS.EXPERIENCE_CONFIG[experienceLevel];
  const isChild = ageGroup === 'child';
  const age = useMemo(() => calculateAge(birthDate), [birthDate]);

  const { label: experienceLabel, className: experienceClassName } = experienceInfo;

  return (
    <div
      className={cn(
        'p-3 rounded-lg transition-colors cursor-pointer flex items-center gap-3',
        isSelected ? 'bg-primary/10' : 'hover:bg-muted'
      )}
      onClick={onClick}
    >
      <div className="flex-shrink-0">
        {isChild ? (
          <Baby className="h-6 w-6 text-muted-foreground" />
        ) : (
          <User className="h-6 w-6 text-muted-foreground" />
        )}
      </div>
      <div className="flex-grow min-w-0">
        <h3 className="font-semibold text-foreground truncate">{name}</h3>
        <p className="text-sm text-muted-foreground">
          {age ? `${age} лет` : isChild ? 'Ребенок' : 'Взрослый'}
        </p>
      </div>
      <div className="flex-shrink-0 ml-auto">
        <span
          title={`Уровень опыта: ${experienceLabel}`}
          className={cn('px-1.5 py-0.5 text-xs font-medium rounded border', experienceClassName)}
        >
          {experienceLabel}
        </span>
      </div>
    </div>
  );
};

export default ParticipantListItem;
