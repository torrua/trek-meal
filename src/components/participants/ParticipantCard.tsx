// src/components/participants/ParticipantCard.tsx

import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Baby,
  User,
  MapPin,
  Backpack,
  Edit,
  Trash2,
  Phone,
  Mail,
  Calendar,
  MoreVertical,
  Copy,
  Clock,
  Mountain,
  TrendingUp,
  Zap,
  Info,
} from 'lucide-react';
import { isFuture, isPast, parseISO, compareAsc, compareDesc } from 'date-fns';
import { PARTICIPANT_CONSTANTS } from '../../constants/participants';
import useTripStore from '../../stores/useTripStore';
import { calculateAge } from '../../utils';
import type { Participant, Trip } from '../../types';
import cn from 'classnames';
import DropdownMenu from '../../ui/DropdownMenu';

interface ParticipantCardProps {
  participant: Participant;
  onEdit: () => void;
  onDelete: (e: React.MouseEvent) => void;
  onClone: () => void;
  isCompact?: boolean;
  isSelected: boolean;
  onSelect: (id: number) => void;
}

type TabType = 'data' | 'trips' | 'equipment';

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

const ParticipantCard: React.FC<ParticipantCardProps> = ({
  participant,
  onEdit,
  onDelete,
  onClone,
  isCompact = false,
  isSelected,
  onSelect,
}) => {
  const {
    gender,
    age: ageGroup,
    name,
    notes,
    experienceLevel,
    phone,
    email,
    birthDate,
  } = participant;
  const { trips } = useTripStore();
  const [activeTab, setActiveTab] = useState<TabType>('data');

  const cardStyles = PARTICIPANT_CONSTANTS.CARD_STYLES[gender];
  const experienceInfo = PARTICIPANT_CONSTANTS.EXPERIENCE_CONFIG[experienceLevel];
  const isChild = ageGroup === 'child';
  const age = useMemo(() => calculateAge(birthDate), [birthDate]);

  const participantTrips = useMemo(
    () => trips.filter((trip) => trip.participants.includes(participant.id)),
    [trips, participant.id]
  );
  const participantEquipment: unknown[] = useMemo(() => [], []);

  const displayedTrips = useMemo(() => {
    const tripsWithDate = participantTrips.filter((trip) => trip.startDate);
    const tripsWithoutDate = participantTrips
      .filter((trip) => !trip.startDate)
      .sort((a, b) => compareDesc(new Date(a.createdAt), new Date(b.createdAt)));
    const upcoming = tripsWithDate
      .filter((trip) => isFuture(parseISO(trip.startDate)))
      .sort((a, b) => compareAsc(parseISO(a.startDate), parseISO(b.startDate)));
    const past = tripsWithDate
      .filter((trip) => isPast(parseISO(trip.startDate)))
      .sort((a, b) => compareDesc(parseISO(a.startDate), parseISO(b.startDate)));
    return [...upcoming, ...past, ...tripsWithoutDate].slice(0, 3);
  }, [participantTrips]);

  const tabs: { id: TabType; label: string; icon: React.ElementType; count: number }[] = [
    { id: 'data', label: 'Данные', icon: User, count: 0 },
    { id: 'trips', label: 'Походы', icon: MapPin, count: participantTrips.length },
    { id: 'equipment', label: 'Снаряжение', icon: Backpack, count: participantEquipment.length },
  ];

  const handleActionClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation();
    action();
  };
  const handleCardClick = () => onSelect(participant.id);

  const KebabMenu = () => (
    <DropdownMenu
      trigger={
        <button className="p-1.5 text-muted-foreground hover:text-primary rounded-full hover:bg-muted transition-colors">
          <MoreVertical className="h-4 w-4" />
        </button>
      }
    >
      <button
        onClick={(e) => handleActionClick(e, onClone)}
        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
        role="menuitem"
      >
        <Copy className="h-4 w-4" /> Клонировать
      </button>
      <button
        onClick={(e) => handleActionClick(e, onEdit)}
        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors"
        role="menuitem"
      >
        <Edit className="h-4 w-4" /> Редактировать
      </button>
      <button
        onClick={(e) => onDelete(e)}
        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-danger hover:bg-danger/10 transition-colors"
        role="menuitem"
      >
        <Trash2 className="h-4 w-4" /> Удалить
      </button>
    </DropdownMenu>
  );

  const {
    label: experienceLabel,
    className: experienceClassName,
    icon: ExperienceIcon,
  } = experienceInfo;

  if (isCompact) {
    return (
      <div
        className={cn(
          'border rounded-lg p-3 transition-all duration-200 group flex items-center gap-3 cursor-pointer',
          cardStyles.background,
          cardStyles.border,
          cardStyles.header,
          { 'ring-2 ring-primary ring-offset-background': isSelected }
        )}
        onClick={handleCardClick}
      >
        <div className="flex-shrink-0">
          <input
            type="checkbox"
            checked={isSelected}
            readOnly
            className="h-4 w-4 rounded border-input text-primary focus:ring-ring"
          />
        </div>
        <div className="flex-shrink-0">
          {isChild ? (
            <Baby className="h-6 w-6 text-muted-foreground" title="Возрастная группа: Ребенок" />
          ) : (
            <User className="h-6 w-6 text-muted-foreground" />
          )}
        </div>
        <div className="flex-grow min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-semibold text-foreground truncate">{name}</h3>
            <p className="text-sm text-muted-foreground">
              {age ? `${age} лет` : isChild ? 'Ребенок' : 'Взрослый'}
            </p>
          </div>
        </div>
        <div className="flex-shrink-0 ml-auto flex items-center gap-2">
          <span
            title={`Уровень опыта: ${experienceLabel}`}
            className={cn(
              'px-1.5 py-0.5 text-xs font-medium rounded border flex items-center gap-1',
              experienceClassName
            )}
          >
            <ExperienceIcon className="h-3 w-3" />
            {experienceLabel}
          </span>
          <KebabMenu />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'border rounded-lg shadow-sm flex flex-col transition-all duration-200 group relative',
        cardStyles.background,
        cardStyles.border,
        { 'ring-2 ring-primary ring-offset-background': isSelected }
      )}
    >
      <header className={cn('p-4 border-b', cardStyles.border, cardStyles.header)}>
        <div className="flex justify-between items-center gap-2">
          <div
            className="flex items-center gap-3 min-w-0 flex-grow cursor-pointer"
            onClick={handleCardClick}
          >
            <input
              type="checkbox"
              checked={isSelected}
              readOnly
              className="h-5 w-5 rounded border-input text-primary focus:ring-ring flex-shrink-0"
            />
            <div className="flex-shrink-0">
              {isChild ? (
                <Baby className="h-6 w-6 text-muted-foreground" />
              ) : (
                <User className="h-6 w-6 text-muted-foreground" />
              )}
            </div>
            <div className="flex-grow min-w-0 flex items-center gap-2 flex-wrap">
              <h3 className="text-lg font-bold text-foreground truncate" title={name}>
                {name}
              </h3>
              <p className="text-sm text-muted-foreground whitespace-nowrap">
                {age ? `• ${age} лет` : `• ${isChild ? 'Ребенок' : 'Взрослый'}`}
              </p>
            </div>
          </div>
          <div className="flex-shrink-0 flex items-center gap-2">
            <span
              title={`Уровень опыта: ${experienceLabel}`}
              className={cn(
                'px-1.5 py-0.5 text-xs font-medium rounded border flex items-center gap-1',
                experienceClassName
              )}
            >
              <ExperienceIcon className="h-3 w-3" />
              {experienceLabel}
            </span>
            <KebabMenu />
          </div>
        </div>
      </header>

      <div className="p-2">
        <div className="bg-muted p-1 rounded-lg flex items-center gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={(e) => {
                e.stopPropagation();
                setActiveTab(tab.id);
              }}
              className={cn(
                'flex-1 flex justify-center items-center gap-2 px-2 py-1.5 text-sm font-medium rounded-md transition-all duration-200',
                activeTab === tab.id
                  ? 'bg-card shadow text-foreground'
                  : 'text-muted-foreground hover:bg-card/50'
              )}
            >
              <tab.icon className="h-4 w-4" />
              <span className="whitespace-nowrap">
                {tab.label} {tab.count > 0 && `• ${tab.count}`}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div key={activeTab} className="p-4 pt-2 min-h-[160px] flex-grow animate-fade-in">
        {activeTab === 'data' &&
          (!phone && !email && !birthDate && !notes ? (
            <div className="text-center py-8 text-muted-foreground flex flex-col items-center justify-center">
              <Info className="h-8 w-8 mb-2 opacity-50" />
              <p>Нет дополнительных данных.</p>
              <p className="text-xs mt-2">
                Вы можете добавить их, нажав на меню и выбрав &quot;Редактировать&quot;.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="grid grid-cols-1 gap-3 text-sm">
                {phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={`tel:${phone}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-foreground hover:underline"
                    >
                      {phone}
                    </a>
                  </div>
                )}
                {email && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <a
                      href={`mailto:${email}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-foreground hover:underline"
                    >
                      {email}
                    </a>
                  </div>
                )}
                {birthDate && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>{new Date(birthDate).toLocaleDateString('ru-RU')}</span>
                  </div>
                )}
              </div>
              {notes && (
                <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground italic">&quot;{notes}&quot;</p>
                </div>
              )}
            </div>
          ))}
        {activeTab === 'trips' && (
          <div className="space-y-3">
            {displayedTrips.length > 0 ? (
              displayedTrips.map((trip: Trip) => {
                const difficulty = trip.difficulty ? DIFFICULTY_MAP[trip.difficulty] : null;
                return (
                  <Link
                    to={`/trips/${trip.id}`}
                    key={trip.id}
                    className="block p-3 bg-muted rounded-lg hover:bg-secondary transition-colors"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div className="min-w-0">
                        <h4 className="font-medium text-foreground truncate">{trip.name}</h4>
                        <div className="text-xs text-muted-foreground flex items-center flex-wrap gap-x-2 gap-y-1 mt-1">
                          <span>
                            {trip.startDate
                              ? new Date(trip.startDate).toLocaleDateString('ru-RU')
                              : 'Дата не определена'}
                          </span>
                          {trip.destination && (
                            <>
                              {' '}
                              <span className="text-muted-foreground/50">•</span>{' '}
                              <span>{trip.destination}</span>{' '}
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex-shrink-0 flex items-center gap-1.5">
                        {difficulty && (
                          <span
                            className={cn(
                              'text-[11px] px-1.5 py-0.5 rounded-full border flex items-center gap-1',
                              difficulty.className
                            )}
                          >
                            <difficulty.icon className="h-3 w-3" />
                            {difficulty.text}
                          </span>
                        )}
                        <span
                          className={cn(
                            'text-[11px] px-1.5 py-0.5 rounded-full border flex items-center gap-1',
                            trip.status === 'completed'
                              ? 'bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400 border-green-500/20'
                              : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/20 dark:text-yellow-400 border-yellow-500/20'
                          )}
                        >
                          <Clock className="h-3 w-3" />
                          {trip.status === 'completed' ? 'Завершен' : 'Планируется'}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })
            ) : (
              <div className="text-center py-8 text-muted-foreground flex flex-col items-center justify-center">
                <MapPin className="h-8 w-8 mb-2 opacity-50" />
                <p>Нет данных о походах.</p>
                <p className="text-xs mt-2">Добавьте участника в поход, и он отобразится здесь.</p>
              </div>
            )}
          </div>
        )}
        {activeTab === 'equipment' && (
          <div className="text-center py-8 text-muted-foreground flex flex-col items-center justify-center">
            <Backpack className="h-8 w-8 mb-2 opacity-50" />
            <p>Снаряжение не добавлено.</p>
            <p className="text-xs mt-2">Эта функция находится в разработке.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(ParticipantCard);
