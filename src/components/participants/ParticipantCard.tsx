// src/components/participants/ParticipantCard.tsx

import React from 'react';
import type { Participant } from '../../types';

interface ParticipantCardProps {
  participant: Participant;
  onEdit: () => void;
  onDelete: (e: React.MouseEvent) => void;
}

const GENDER_ICONS: { [key in Participant['gender']]: string } = { male: '👨', female: '👩' };
const AGE_META: { [key in Participant['age']]: { text: string; className: string } } = {
  adult: { text: 'Взрослый', className: 'bg-green-100 text-green-800' },
  child: { text: 'Ребенок', className: 'bg-yellow-100 text-yellow-800' },
};

const ParticipantCard: React.FC<ParticipantCardProps> = ({ participant, onEdit, onDelete }) => {
  const { gender, age, name, notes } = participant;
  const ageMeta = AGE_META[age];

  const handleCardClick = () => onEdit();
  const handleButtonClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(e);
  };

  return (
    <div
      className="bg-secondary border border-primary rounded-lg shadow-sm flex flex-col transition-shadow hover:shadow-md cursor-pointer"
      onClick={handleCardClick}
    >
      {/* === HEADER === */}
      <div className="p-4 border-b border-secondary">
        <h3
          className="text-lg font-bold text-primary truncate flex items-center gap-2"
          title={name}
        >
          <span>{GENDER_ICONS[gender]}</span>
          {name}
        </h3>
        <div className="flex items-center gap-2 mt-1.5 flex-wrap h-5">
          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${ageMeta.className}`}>
            {ageMeta.text}
          </span>
        </div>
      </div>

      {/* === BODY === */}
      <div className="p-4 flex-grow">
        {notes ? (
          <p className="text-sm text-secondary italic">&quot;{notes}&ldquo;</p>
        ) : (
          <p className="text-sm text-muted text-center py-4">Нет заметок</p>
        )}
      </div>

      {/* === FOOTER === */}
      <div className="p-3 bg-muted border-t border-secondary flex justify-end gap-2">
        <button
          onClick={(e) => handleButtonClick(e, onEdit)}
          className="text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          Редактировать
        </button>
        <button
          onClick={handleDeleteClick}
          className="text-sm font-medium text-red-600 hover:text-red-800"
        >
          Удалить
        </button>
      </div>
    </div>
  );
};

export default ParticipantCard;
