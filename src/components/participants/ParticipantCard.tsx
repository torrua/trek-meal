// src/components/participants/ParticipantCard.tsx

import React from 'react';
import { Baby } from 'lucide-react';
import { PARTICIPANT_CONSTANTS } from '../../constants/participants';
import type { Participant } from '../../types';

interface ParticipantCardProps {
  participant: Participant;
  onEdit: () => void;
  onDelete: (e: React.MouseEvent) => void;
}

const ParticipantCard: React.FC<ParticipantCardProps> = ({ participant, onEdit, onDelete }) => {
  const { gender, age, name, notes } = participant;
  const cardStyles = PARTICIPANT_CONSTANTS.CARD_STYLES[gender];
  const isChild = age === 'child';

  const handleCardClick = () => onEdit();

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit();
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(e);
  };

  return (
    <div
      className={`${cardStyles.background} border ${cardStyles.border} rounded-lg shadow-sm flex flex-col transition-all duration-200 hover:shadow-md hover:scale-[1.02] cursor-pointer group relative`}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick();
        }
      }}
      aria-label={`Участник ${name}${isChild ? ' (ребенок)' : ''}, нажмите для редактирования`}
    >
      {/* === Ð"Ð•Ð¢Ð¡ÐšÐ˜Ð™ Ð—ÐÐÐ§ÐžÐš === */}
      {isChild && (
        <div className="absolute -top-2 -right-2 z-10">
          <div className="bg-orange-400 text-white rounded-full p-2 shadow-lg border-2 border-white dark:border-gray-800">
            <Baby className="h-4 w-4" aria-label="Ребенок" />
          </div>
        </div>
      )}

      {/* === HEADER === */}
      <div className={`p-4 border-b ${cardStyles.border} ${cardStyles.header}`}>
        <h3 className="text-lg font-bold text-foreground truncate" title={name}>
          {name}
        </h3>
      </div>

      {/* === BODY === */}
      <div className="p-4 flex-grow">
        {notes ? (
          <p className="text-sm text-foreground/80 italic break-words" title={notes}>
            &quot;{notes}&quot;
          </p>
        ) : (
          <p className="text-sm text-foreground/50 text-center py-4">Нет заметок</p>
        )}
      </div>

      {/* === FOOTER === */}
      <div
        className={`p-3 ${cardStyles.footer} border-t ${cardStyles.border} flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200`}
      >
        <button
          onClick={handleEditClick}
          className="text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label={`Редактировать ${name}`}
        >
          Редактировать
        </button>
        <button
          onClick={handleDeleteClick}
          className="text-sm font-medium text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors px-2 py-1 rounded focus:outline-none focus:ring-2 focus:ring-red-500"
          aria-label={`Удалить ${name}`}
        >
          Удалить
        </button>
      </div>
    </div>
  );
};

export default React.memo(ParticipantCard);
