// src/components/participants/ParticipantListItem.tsx

import React, { useMemo } from 'react';
import { Baby, User, Edit, Copy, Trash2, MoreVertical } from 'lucide-react';
import { PARTICIPANT_CONSTANTS } from '../../constants/participants';
import { calculateAge } from '../../utils';
import type { Participant } from '../../types';
import cn from 'classnames';
import Popover from '../../ui/Popover';
import Button from '../../ui/Button';

interface ParticipantListItemProps {
  participant: Participant;
  isSelected: boolean;
  isChecked: boolean;
  onItemClick: () => void;
  onCheckboxClick: (e: React.MouseEvent) => void;
  onEdit: () => void;
  onClone: () => void;
  onDelete: () => void;
}

const ParticipantListItem: React.FC<ParticipantListItemProps> = ({
  participant,
  isSelected,
  isChecked,
  onItemClick,
  onCheckboxClick,
  onEdit,
  onClone,
  onDelete,
}) => {
  const { age: ageGroup, name, experienceLevel, birthDate } = participant;
  const experienceInfo = PARTICIPANT_CONSTANTS.EXPERIENCE_CONFIG[experienceLevel];
  const isChild = ageGroup === 'child';
  const age = useMemo(() => calculateAge(birthDate), [birthDate]);

  const { label: experienceLabel, className: experienceClassName } = experienceInfo;

  const handleMenuAction = (action: () => void) => (e: React.MouseEvent) => {
    e.stopPropagation();
    action();
  };

  return (
    <div
      className={cn(
        'group p-2 pr-3 rounded-lg transition-colors flex items-center gap-3 relative',
        isSelected ? 'bg-primary/10' : 'hover:bg-muted'
      )}
    >
      <div className="flex-shrink-0 p-1" onClick={onCheckboxClick}>
        <input
          type="checkbox"
          checked={isChecked}
          readOnly
          className="h-4 w-4 rounded border-input text-primary focus:ring-ring cursor-pointer"
        />
      </div>
      <div
        className="flex-grow flex items-center gap-3 min-w-0 cursor-pointer"
        onClick={onItemClick}
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
        <div className="flex-shrink-0 flex items-center gap-2">
          <span
            title={`Уровень опыта: ${experienceLabel}`}
            className={cn('px-1.5 py-0.5 text-xs font-medium rounded border', experienceClassName)}
          >
            {experienceLabel}
          </span>

          {/* Меню действий - появляется при hover или на мобильных всегда видно */}
          <div className="opacity-0 group-hover:opacity-100 transition-opacity md:opacity-100">
            <Popover
              trigger={
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              }
              align="end"
            >
              <div className="w-48 py-1">
                <button
                  onClick={handleMenuAction(onEdit)}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-muted rounded-sm flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Редактировать
                </button>
                <button
                  onClick={handleMenuAction(onClone)}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-muted rounded-sm flex items-center gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Клонировать
                </button>
                <button
                  onClick={handleMenuAction(onDelete)}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-destructive/10 text-destructive rounded-sm flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Удалить
                </button>
              </div>
            </Popover>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ParticipantListItem;
