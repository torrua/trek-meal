// src/components/participants/ParticipantCard.tsx

import React, { useState, useMemo } from 'react';
import { Baby, MapPin, Calendar, User, Award, Backpack, FileText, Grid, List } from 'lucide-react';
import { PARTICIPANT_CONSTANTS } from '../../constants/participants';
import useTripStore from '../../stores/useTripStore';
import type { Participant } from '../../types';

interface ParticipantCardProps {
  participant: Participant;
  onEdit: () => void;
  onDelete: (e: React.MouseEvent) => void;
  isCompact?: boolean;
}

type TabType = 'data' | 'trips' | 'gear';

const ParticipantCard: React.FC<ParticipantCardProps> = ({
  participant,
  onEdit,
  onDelete,
  isCompact = false,
}) => {
  const { gender, age, name, notes, experienceLevel, phone, email } = participant;
  const { trips } = useTripStore();
  const [activeTab, setActiveTab] = useState<TabType>('data');

  const cardStyles = PARTICIPANT_CONSTANTS.CARD_STYLES[gender];
  const isChild = age === 'child';

  // Вычисляем статистику походов участника
  const tripStats = useMemo(() => {
    const participantTrips = trips.filter((trip) => trip.participants.includes(participant.id));
    const completedTrips = participantTrips.filter((trip) => trip.status === 'completed');
    const planningTrips = participantTrips.filter((trip) => trip.status === 'planning');

    return {
      total: participantTrips.length,
      completed: completedTrips.length,
      planning: planningTrips.length,
      trips: participantTrips,
    };
  }, [trips, participant.id]);

  // Маппинг уровня опыта на русский с цветами
  const experienceConfig = {
    beginner: {
      label: 'Новичок',
      bgClass: 'bg-green-100 dark:bg-green-900/30',
      textClass: 'text-green-800 dark:text-green-200',
      borderClass: 'border-green-300 dark:border-green-700',
    },
    experienced: {
      label: 'Опытный',
      bgClass: 'bg-blue-100 dark:bg-blue-900/30',
      textClass: 'text-blue-800 dark:text-blue-200',
      borderClass: 'border-blue-300 dark:border-blue-700',
    },
    professional: {
      label: 'Профессионал',
      bgClass: 'bg-purple-100 dark:bg-purple-900/30',
      textClass: 'text-purple-800 dark:text-purple-200',
      borderClass: 'border-purple-300 dark:border-purple-700',
    },
  };

  const experienceInfo = experienceConfig[experienceLevel];

  const handleCardClick = (e: React.MouseEvent) => {
    // Не открываем редактирование если кликнули по вкладке
    if ((e.target as HTMLElement).closest('[data-tab-button]')) {
      return;
    }
    onEdit();
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit();
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(e);
  };

  const handleTabClick = (tab: TabType, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveTab(tab);
  };

  // Компактный вид
  if (isCompact) {
    return (
      <div
        className={`${cardStyles.background} border ${cardStyles.border} rounded-lg p-3 transition-all duration-200 hover:shadow-md cursor-pointer group flex items-center gap-3`}
        onClick={handleCardClick}
      >
        {/* Аватар и бейдж */}
        <div className="flex-shrink-0 relative">
          <div
            className={`w-12 h-12 ${cardStyles.header} border ${cardStyles.border} rounded-full flex items-center justify-center`}
          >
            {isChild ? (
              <Baby className="h-5 w-5 text-foreground" />
            ) : (
              <User className="h-5 w-5 text-foreground" />
            )}
          </div>
          {isChild && (
            <div className="absolute -top-1 -right-1">
              <div className="bg-orange-400 text-white rounded-full p-1">
                <Baby className="h-3 w-3" />
              </div>
            </div>
          )}
        </div>

        {/* Основная информация */}
        <div className="flex-grow min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-foreground truncate">{name}</h3>
            <span
              className={`px-1.5 py-0.5 text-xs font-medium rounded border ${experienceInfo.bgClass} ${experienceInfo.textClass} ${experienceInfo.borderClass}`}
            >
              {experienceInfo.label}
            </span>
          </div>

          {tripStats.total > 0 && (
            <div className="flex items-center gap-3 text-xs text-foreground/70">
              <span>{tripStats.total} походов</span>
              {tripStats.completed > 0 && <span>{tripStats.completed} завершено</span>}
            </div>
          )}
        </div>

        {/* Кнопки действий */}
        <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="flex gap-1">
            <button
              onClick={handleEditClick}
              className="p-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
              aria-label={`Редактировать ${name}`}
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path d="M17.414 2.586a2 2 0 00-2.828 0L7 10.172V13h2.828l7.586-7.586a2 2 0 000-2.828z" />
                <path
                  fillRule="evenodd"
                  d="M2 6a2 2 0 012-2h4a1 1 0 010 2H4v10h10v-4a1 1 0 112 0v4a2 2 0 01-2 2H4a2 2 0 01-2-2V6z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
            <button
              onClick={handleDeleteClick}
              className="p-1 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors"
              aria-label={`Удалить ${name}`}
            >
              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Обычный вид с вкладками
  return (
    <div
      className={`${cardStyles.background} border ${cardStyles.border} rounded-lg shadow-sm flex flex-col transition-all duration-200 hover:shadow-md hover:scale-[1.02] cursor-pointer group relative`}
      onClick={handleCardClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardClick(e as any);
        }
      }}
      aria-label={`Участник ${name}${isChild ? ' (ребенок)' : ''}, нажмите для редактирования`}
    >
      {/* === Детский бейдж === */}
      {isChild && (
        <div className="absolute -top-2 -right-2 z-10">
          <div className="bg-orange-400 text-white rounded-full p-2 shadow-lg border-2 border-white dark:border-gray-800">
            <Baby className="h-4 w-4" aria-label="Ребенок" />
          </div>
        </div>
      )}

      {/* === HEADER === */}
      <div className={`p-4 border-b ${cardStyles.border} ${cardStyles.header}`}>
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-bold text-foreground truncate pr-2" title={name}>
            {name}
          </h3>
          {/* Бейдж опыта - контрастный */}
          <span
            className={`px-2 py-1 text-xs font-medium rounded-md border flex-shrink-0 ${experienceInfo.bgClass} ${experienceInfo.textClass} ${experienceInfo.borderClass}`}
          >
            {experienceInfo.label}
          </span>
        </div>

        {/* Статистика походов */}
        {tripStats.total > 0 && (
          <div className="flex items-center gap-4 text-xs text-foreground/70 mb-3">
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              <span>{tripStats.total} походов</span>
            </div>
            {tripStats.completed > 0 && (
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                <span>{tripStats.completed} завершено</span>
              </div>
            )}
          </div>
        )}

        {/* Вкладки БЕЗ закругленных краев и синей обводки */}
        <div className="flex">
          <button
            data-tab-button
            onClick={(e) => handleTabClick('data', e)}
            className={`px-3 py-2 text-sm font-medium transition-colors relative ${
              activeTab === 'data'
                ? 'text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <div className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              Данные
            </div>
            {activeTab === 'data' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground"></div>
            )}
          </button>
          <button
            data-tab-button
            onClick={(e) => handleTabClick('trips', e)}
            className={`px-3 py-2 text-sm font-medium transition-colors relative ${
              activeTab === 'trips'
                ? 'text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <div className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              Походы
            </div>
            {activeTab === 'trips' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground"></div>
            )}
          </button>
          <button
            data-tab-button
            onClick={(e) => handleTabClick('gear', e)}
            className={`px-3 py-2 text-sm font-medium transition-colors relative ${
              activeTab === 'gear'
                ? 'text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <div className="flex items-center gap-1">
              <Backpack className="h-3 w-3" />
              Снаряжение
            </div>
            {activeTab === 'gear' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-foreground"></div>
            )}
          </button>
        </div>
      </div>

      {/* === BODY - Содержимое вкладок === */}
      <div className="p-4 flex-grow">
        {activeTab === 'data' && (
          <div className="space-y-3">
            {/* Контактная информация */}
            <div className="grid grid-cols-1 gap-2 text-sm">
              {phone && (
                <div className="flex items-center gap-2">
                  <svg
                    className="h-4 w-4 text-muted-foreground"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                  </svg>
                  <span className="text-foreground">{phone}</span>
                </div>
              )}
              {email && (
                <div className="flex items-center gap-2">
                  <svg
                    className="h-4 w-4 text-muted-foreground"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                    <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                  </svg>
                  <span className="text-foreground">{email}</span>
                </div>
              )}
            </div>

            {/* Заметки */}
            {notes ? (
              <div className="pt-2 border-t border-border/50">
                <p className="text-sm text-foreground/80 italic break-words" title={notes}>
                  &quot;{notes}&ldquo;
                </p>
              </div>
            ) : (
              <p className="text-sm text-foreground/50 text-center py-4">Нет заметок</p>
            )}
          </div>
        )}

        {activeTab === 'trips' && (
          <div className="space-y-3">
            {tripStats.trips.length > 0 ? (
              <div className="space-y-2">
                {tripStats.trips.map((trip) => (
                  <div key={trip.id} className="p-2 bg-muted/30 rounded border border-border/30">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-sm font-medium text-foreground">{trip.name}</h4>
                        {trip.destination && (
                          <p className="text-xs text-muted-foreground">{trip.destination}</p>
                        )}
                      </div>
                      <span
                        className={`px-2 py-0.5 text-xs rounded ${
                          trip.status === 'completed'
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-200'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200'
                        }`}
                      >
                        {trip.status === 'completed' ? 'Завершен' : 'Планируется'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-foreground/50 text-center py-4">Нет походов</p>
            )}
          </div>
        )}

        {activeTab === 'gear' && (
          <div className="space-y-3">
            <p className="text-sm text-foreground/50 text-center py-4">
              Функция управления снаряжением будет добавлена позже
            </p>
          </div>
        )}
      </div>

      {/* === FOOTER === */}
      <div
        className={`p-3 ${cardStyles.footer} border-t ${cardStyles.border} flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200`}
      >
        <button
          onClick={handleEditClick}
          className="text-sm font-medium text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors px-2 py-1 rounded"
          aria-label={`Редактировать ${name}`}
        >
          Редактировать
        </button>
        <button
          onClick={handleDeleteClick}
          className="text-sm font-medium text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition-colors px-2 py-1 rounded"
          aria-label={`Удалить ${name}`}
        >
          Удалить
        </button>
      </div>
    </div>
  );
};

export default React.memo(ParticipantCard);
