// src/components/participants/ParticipantDetail.tsx

import React, { useState, useEffect, useMemo } from 'react';
import {
  User,
  Edit,
  Copy,
  Trash2,
  Baby,
  Info,
  MapPin,
  Backpack,
  Phone,
  Mail,
  Calendar,
  Clock,
  Mountain,
  TrendingUp,
  Zap,
  ChevronDown,
} from 'lucide-react';
import type { Participant, ParticipantData, Trip } from '../../types';
import useParticipantStore from '../../stores/useParticipantStore';
import useTripStore from '../../stores/useTripStore';
import ParticipantForm from './ParticipantForm';
import Button from '../../ui/Button';
import { PARTICIPANT_CONSTANTS } from '../../constants/participants';
import { calculateAge } from '../../utils';
import cn from 'classnames';
import { Link } from 'react-router-dom';
import { isFuture, isPast, parseISO, compareAsc, compareDesc } from 'date-fns';

interface ParticipantDetailProps {
  participantId: number | null;
  isEditing: boolean;
  onCloneRequest: (id: number) => void;
  onDeleteRequest: (p: Participant) => void;
  setEditingParticipant: (p: Participant | null) => void;
  onFormSubmit: (data: ParticipantData) => Promise<void> | void;
  onCancelEdit: () => void;
  onDirtyChange?: (isDirty: boolean) => void;
}

const DIFFICULTY_MAP: {
  [key in Trip['difficulty']]: { text: string; icon: React.ElementType; className: string };
} = {
  easy: {
    text: 'Легкий',
    icon: Mountain,
    className:
      'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400 border-green-500/20',
  },
  medium: {
    text: 'Средний',
    icon: TrendingUp,
    className:
      'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400 border-blue-500/20',
  },
  hard: {
    text: 'Сложный',
    icon: Zap,
    className:
      'bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400 border-purple-500/20',
  },
};

const STATUS_MAP: { [key in Trip['status']]: { text: string; className: string } } = {
  planning: {
    text: 'Планируется',
    className:
      'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400 border-yellow-500/20',
  },
  completed: {
    text: 'Завершен',
    className:
      'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400 border-green-500/20',
  },
};

const AccordionSection: React.FC<{
  title: string;
  icon: React.ElementType;
  count?: number;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}> = ({ title, icon: Icon, count, isOpen, onToggle, children }) => (
  <div className="border-b">
    <button
      onClick={onToggle}
      className="w-full flex justify-between items-center p-4 bg-muted/50 hover:bg-muted transition-colors"
    >
      <div className="flex items-center gap-3">
        <Icon className="h-5 w-5 text-primary" />
        <span className="font-semibold text-foreground">{title}</span>
        {count !== undefined && count > 0 && (
          <span className="text-sm text-muted-foreground">• {count}</span>
        )}
      </div>
      <ChevronDown
        className={cn('h-5 w-5 text-muted-foreground transition-transform', {
          'rotate-180': isOpen,
        })}
      />
    </button>
    <div
      className={cn(
        'grid transition-all duration-300 ease-in-out',
        isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
      )}
    >
      <div className="overflow-hidden">
        <div className="p-4 border-t bg-card">{children}</div>
      </div>
    </div>
  </div>
);

const ParticipantDetail: React.FC<ParticipantDetailProps> = ({
  participantId,
  isEditing,
  onCloneRequest,
  onDeleteRequest,
  setEditingParticipant,
  onFormSubmit,
  onCancelEdit,
  onDirtyChange,
}) => {
  const { participants } = useParticipantStore();
  const { trips, removeParticipantFromTrip } = useTripStore();
  const [participant, setParticipant] = useState<Participant | null>(null);
  const [openSections, setOpenSections] = useState<string[]>(['data']);
  const [isLoading, setIsLoading] = useState(false);

  const participantTrips = useMemo(
    () => trips.filter((trip) => trip.participants.includes(participant?.id ?? 0)),
    [trips, participant]
  );

  useEffect(() => {
    if (participantId) {
      const selected = participants.find((p) => p.id === participantId);
      setParticipant(selected || null);
    } else {
      setParticipant(null);
    }
  }, [participantId, participants]);

  const displayedTrips = useMemo(() => {
    const tripsWithDate = participantTrips.filter((trip) => trip.startDate);
    const tripsWithoutDate = participantTrips
      .filter((trip) => !trip.startDate)
      .sort((a, b) =>
        compareDesc(new Date(a.createdAt || Date.now()), new Date(b.createdAt || Date.now()))
      );

    const upcoming = tripsWithDate
      .filter((trip) => isFuture(parseISO(trip.startDate)))
      .sort((a, b) => compareAsc(parseISO(a.startDate), parseISO(b.startDate)));

    const past = tripsWithDate
      .filter((trip) => isPast(parseISO(trip.startDate)))
      .sort((a, b) => compareDesc(parseISO(a.startDate), parseISO(b.startDate)));

    return [...upcoming, ...past, ...tripsWithoutDate];
  }, [participantTrips]);

  const handleToggleSection = (sectionId: string) => {
    setOpenSections((prev) =>
      prev.includes(sectionId) ? prev.filter((id) => id !== sectionId) : [...prev, sectionId]
    );
  };

  const handleRemoveFromTrip = async (e: React.MouseEvent, tripId: number) => {
    e.stopPropagation();
    e.preventDefault();

    if (!participant) return;

    const confirmRemove = window.confirm('Удалить участника из этого похода?');
    if (!confirmRemove) return;

    try {
      removeParticipantFromTrip(tripId, participant.id);
    } catch (error) {
      console.error('Ошибка при удалении участника из похода:', error);
    }
  };

  const handleFormSubmit = async (data: ParticipantData) => {
    setIsLoading(true);
    try {
      await onFormSubmit(data);
    } finally {
      setIsLoading(false);
    }
  };

  if (isEditing) {
    return (
      <div className="p-6 overflow-y-auto h-full">
        <div className="mb-4">
          <h3 className="text-xl font-bold">
            {participant?.id ? `Редактирование: ${participant.name}` : 'Новый участник'}
          </h3>
          {participant?.id && (
            <p className="text-sm text-muted-foreground mt-1">ID: {participant.id}</p>
          )}
        </div>
        <ParticipantForm
          participant={participant}
          onSubmit={handleFormSubmit}
          onCancel={onCancelEdit}
          isLoading={isLoading}
          onDirtyChange={onDirtyChange}
        />
      </div>
    );
  }

  if (!participant) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-center p-6">
        <div className="max-w-md mx-auto">
          <User className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">Участник не выбран</h3>
          <p className="text-muted-foreground mb-4">
            Выберите участника из списка слева или создайте нового.
          </p>
          <Button
            onClick={() => setEditingParticipant(null)}
            variant="primary"
            className="inline-flex items-center gap-2"
          >
            <User className="h-4 w-4" />
            Создать участника
          </Button>
        </div>
      </div>
    );
  }

  const experienceInfo = PARTICIPANT_CONSTANTS.EXPERIENCE_CONFIG[participant.experienceLevel];
  const age = calculateAge(participant.birthDate);
  const isChild = participant.age === 'child';

  return (
    <div className="bg-card h-full flex flex-col">
      <div className="p-4 border-b">
        <div className="flex justify-between items-start gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex-shrink-0">
              {isChild ? (
                <Baby className="h-8 w-8 text-muted-foreground" />
              ) : (
                <User className="h-8 w-8 text-muted-foreground" />
              )}
            </div>
            <div className="min-w-0">
              <h2 className="text-xl font-bold text-foreground truncate">{participant.name}</h2>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                <span>{age ? `${age} лет` : isChild ? 'Ребенок' : 'Взрослый'}</span>
                <span>•</span>
                <span
                  className={cn(
                    'px-2 py-1 text-xs font-medium rounded-full border',
                    experienceInfo.className
                  )}
                >
                  {experienceInfo.label}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditingParticipant(participant)}
              className="text-xs"
            >
              <Edit className="h-4 w-4 mr-1" />
              Изменить
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onCloneRequest(participant.id)}
              className="text-xs"
            >
              <Copy className="h-4 w-4 mr-1" />
              Копия
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDeleteRequest(participant)}
              className="text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Удалить
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-grow overflow-y-auto">
        <AccordionSection
          title="Контактные данные"
          icon={User}
          isOpen={openSections.includes('data')}
          onToggle={() => handleToggleSection('data')}
        >
          {!participant.phone &&
          !participant.email &&
          !participant.birthDate &&
          !participant.notes ? (
            <div className="text-center py-8 text-muted-foreground">
              <Info className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Контактные данные не указаны</p>
              <p className="text-xs mt-2">Добавьте их в режиме редактирования</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {participant.phone && (
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Телефон</p>
                      <p className="text-foreground">{participant.phone}</p>
                    </div>
                  </div>
                )}

                {participant.email && (
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Email</p>
                      <p className="text-foreground break-all">{participant.email}</p>
                    </div>
                  </div>
                )}

                {participant.birthDate && (
                  <div className="flex items-center gap-3">
                    <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">Дата рождения</p>
                      <p className="text-foreground">
                        {new Date(participant.birthDate).toLocaleDateString('ru-RU')}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {participant.notes && (
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    Заметки
                  </p>
                  <div className="bg-muted/30 rounded-lg p-3">
                    <p className="text-foreground whitespace-pre-wrap text-sm leading-relaxed">
                      {participant.notes}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </AccordionSection>

        <AccordionSection
          title="Походы"
          icon={MapPin}
          count={participantTrips.length}
          isOpen={openSections.includes('trips')}
          onToggle={() => handleToggleSection('trips')}
        >
          <div className="space-y-3">
            {displayedTrips.length > 0 ? (
              displayedTrips.map((trip: Trip) => {
                const difficulty = trip.difficulty ? DIFFICULTY_MAP[trip.difficulty] : null;
                const status = STATUS_MAP[trip.status];
                const isUpcoming = trip.startDate && isFuture(parseISO(trip.startDate));

                return (
                  <div key={trip.id} className="group/trip relative">
                    <Link
                      to={`/trips/${trip.id}`}
                      className="block p-4 bg-muted/50 hover:bg-muted rounded-lg transition-colors"
                    >
                      <div className="flex justify-between items-start gap-3">
                        <div className="min-w-0 flex-grow">
                          <h4 className="font-medium text-foreground truncate">{trip.name}</h4>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                            <Clock className="h-3 w-3" />
                            <span>
                              {trip.startDate
                                ? new Date(trip.startDate).toLocaleDateString('ru-RU')
                                : 'Дата не определена'}
                            </span>
                            {trip.destination && (
                              <>
                                <span>•</span>
                                <MapPin className="h-3 w-3" />
                                <span className="truncate">{trip.destination}</span>
                              </>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 flex-shrink-0">
                          {difficulty && (
                            <span
                              className={cn(
                                'text-xs px-2 py-1 rounded-full border flex items-center gap-1',
                                difficulty.className
                              )}
                            >
                              <difficulty.icon className="h-3 w-3" />
                              {difficulty.text}
                            </span>
                          )}

                          <span
                            className={cn(
                              'text-xs px-2 py-1 rounded-full border flex items-center gap-1',
                              status.className
                            )}
                          >
                            <Clock className="h-3 w-3" />
                            {status.text}
                          </span>

                          <button
                            onClick={(e) => handleRemoveFromTrip(e, trip.id)}
                            className="p-1.5 rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive opacity-0 group-hover/trip:opacity-100 transition-all"
                            title="Удалить из похода"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>

                      {isUpcoming && (
                        <div className="mt-2 text-xs text-primary font-medium">
                          Предстоящий поход
                        </div>
                      )}
                    </Link>
                  </div>
                );
              })
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Участник не записан в походы</p>
                <p className="text-xs mt-2">Добавьте участника в поход через список участников</p>
              </div>
            )}
          </div>
        </AccordionSection>

        <AccordionSection
          title="Снаряжение"
          icon={Backpack}
          isOpen={openSections.includes('equipment')}
          onToggle={() => handleToggleSection('equipment')}
        >
          <div className="text-center py-8 text-muted-foreground">
            <Backpack className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Снаряжение не добавлено</p>
            <p className="text-xs mt-2">Эта функция находится в разработке</p>
          </div>
        </AccordionSection>
      </div>
    </div>
  );
};

export default ParticipantDetail;
