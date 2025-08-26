// src/components/participants/ParticipantCard.tsx

import React from 'react';
import { Baby, MapPin, Calendar, Phone, Mail, Award, User } from 'lucide-react';
import { PARTICIPANT_CONSTANTS } from '../../constants/participants';
import type { Participant } from '../../types';

interface ParticipantCardProps {
  participant: Participant;
  onEdit: () => void;
  onDelete: (e: React.MouseEvent) => void;
  participantTrips?: Array<{ id: string; name: string; date?: string }>;
  viewMode?: 'compact' | 'expanded';
}

const ParticipantCard: React.FC<ParticipantCardProps> = ({
  participant,
  onEdit,
  onDelete,
  participantTrips = [],
  viewMode = 'expanded',
}) => {
  const { gender, age, name, notes, experienceLevel, phone, email, birthDate } = participant;
  const cardStyles = PARTICIPANT_CONSTANTS.CARD_STYLES[gender];
  const experienceStyles = PARTICIPANT_CONSTANTS.EXPERIENCE_STYLES[experienceLevel];
  const isChild = age === 'child';

  const calculateAge = (birthDate: string) => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  const handleCardClick = () => onEdit();

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit();
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(e);
  };

  const getExperienceLabel = (level: string) => {
    const option = PARTICIPANT_CONSTANTS.EXPERIENCE_OPTIONS.find((opt) => opt.value === level);
    return option?.label || level;
  };

  if (viewMode === 'compact') {
    return (
      <div
        className={`${cardStyles.background} border ${cardStyles.border} rounded-lg shadow-sm transition-all duration-200 hover:shadow-md hover:scale-[1.02] cursor-pointer group relative overflow-hidden`}
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
        {/* Детский значок как наклейка */}
        {isChild && (
          <div className="absolute top-0 right-0 w-0 h-0 border-l-[40px] border-l-transparent border-t-[40px] border-t-orange-400">
            <Baby className="absolute -top-[35px] -right-[32px] h-4 w-4 text-white transform rotate-45" />
          </div>
        )}

        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-lg font-bold text-foreground truncate pr-2" title={name}>
              {name}
            </h3>
            <div
              className={`px-2 py-1 rounded-full text-xs font-medium ${experienceStyles.bg} ${experienceStyles.color} border ${experienceStyles.border}`}
            >
              {getExperienceLabel(experienceLevel)}
            </div>
          </div>

          {participantTrips.length > 0 && (
            <div className="flex items-center gap-1 text-sm text-foreground/60">
              <MapPin className="h-3 w-3" />
              <span>{participantTrips.length} походов</span>
            </div>
          )}

          {/* Кнопки действий */}
          <div className="flex justify-end gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={handleEditClick}
              className="text-xs font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors px-2 py-1 rounded"
              aria-label={`Редактировать ${name}`}
            >
              Изменить
            </button>
            <button
              onClick={handleDeleteClick}
              className="text-xs font-medium text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors px-2 py-1 rounded"
              aria-label={`Удалить ${name}`}
            >
              Удалить
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`${cardStyles.background} border ${cardStyles.border} rounded-lg shadow-sm flex flex-col transition-all duration-200 hover:shadow-md hover:scale-[1.02] cursor-pointer group relative overflow-hidden`}
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
      {/* Детский значок как наклейка на уголок */}
      {isChild && (
        <div className="absolute top-0 right-0 w-0 h-0 border-l-[50px] border-l-transparent border-t-[50px] border-t-orange-400 z-10">
          <Baby className="absolute -top-[43px] -right-[40px] h-5 w-5 text-white transform rotate-45" />
        </div>
      )}

      {/* HEADER */}
      <div className={`p-4 border-b ${cardStyles.border} ${cardStyles.header} rounded-t-lg`}>
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-bold text-foreground truncate pr-2" title={name}>
            {name}
          </h3>
          <div
            className={`px-2 py-1 rounded-full text-xs font-medium ${experienceStyles.bg} ${experienceStyles.color} border ${experienceStyles.border}`}
          >
            <Award className="h-3 w-3 inline mr-1" />
            {getExperienceLabel(experienceLevel)}
          </div>
        </div>

        {birthDate && (
          <div className="flex items-center gap-1 text-sm text-foreground/70 mt-1">
            <User className="h-3 w-3" />
            <span>{calculateAge(birthDate)} лет</span>
          </div>
        )}
      </div>

      {/* BODY */}
      <div className="p-4 flex-grow space-y-3">
        {/* Контактная информация */}
        {(phone || email) && (
          <div className="space-y-1">
            {phone && (
              <div className="flex items-center gap-2 text-sm text-foreground/70">
                <Phone className="h-3 w-3" />
                <span className="truncate">{phone}</span>
              </div>
            )}
            {email && (
              <div className="flex items-center gap-2 text-sm text-foreground/70">
                <Mail className="h-3 w-3" />
                <span className="truncate">{email}</span>
              </div>
            )}
          </div>
        )}

        {/* Заметки */}
        <div>
          {notes ? (
            <p className="text-sm text-foreground/80 italic break-words" title={notes}>
              &quot;{notes}&ldquo;
            </p>
          ) : (
            <p className="text-sm text-foreground/50 text-center py-2">Нет заметок</p>
          )}
        </div>

        {/* Информация о походах */}
        {participantTrips.length > 0 && (
          <div className="border-t border-border pt-3">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="h-4 w-4 text-foreground/60" />
              <span className="text-sm font-medium text-foreground/80">
                Участник походов ({participantTrips.length})
              </span>
            </div>
            <div className="space-y-1">
              {participantTrips.slice(0, 3).map((trip, index) => (
                <div key={trip.id} className="flex items-center gap-2 text-xs text-foreground/60">
                  <div className="w-1.5 h-1.5 rounded-full bg-current opacity-50" />
                  <span className="truncate flex-1">{trip.name}</span>
                  {trip.date && (
                    <div className="flex items-center gap-1 text-foreground/40">
                      <Calendar className="h-3 w-3" />
                      <span>{trip.date}</span>
                    </div>
                  )}
                </div>
              ))}
              {participantTrips.length > 3 && (
                <p className="text-xs text-foreground/40 pl-3.5">
                  и еще {participantTrips.length - 3}...
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div
        className={`p-3 ${cardStyles.footer} border-t ${cardStyles.border} flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-b-lg`}
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
