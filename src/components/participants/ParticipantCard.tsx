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
}

type TabType = 'data' | 'trips' | 'equipment';

const ParticipantCard: React.FC<ParticipantCardProps> = ({
  participant,
  onEdit,
  onDelete,
  onClone,
  isCompact = false,
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

  if (isCompact) {
    return (
      <div
        className={cn(
          'border rounded-lg p-3 transition-all duration-200 hover:shadow-md cursor-pointer group flex items-center gap-3',
          cardStyles.background,
          cardStyles.border,
          cardStyles.header
        )}
        onClick={onEdit}
      >
        <div className="flex-shrink-0 relative">
          <div
            className={cn(
              'w-12 h-12 border rounded-full flex items-center justify-center',
              cardStyles.border
            )}
          >
            {isChild ? (
              <Baby className="h-6 w-6" title="Возрастная группа: Ребенок" />
            ) : (
              <User className="h-6 w-6" />
            )}
          </div>
        </div>
        <div className="flex-grow min-w-0">
          <h3 className="font-semibold text-foreground truncate">{name}</h3>
          <div className="text-xs text-muted-foreground flex items-center gap-2">
            <span>{age ? `${age} лет` : isChild ? 'Ребенок' : 'Взрослый'}</span>
            <span>•</span>
            <span title={`Уровень опыта: ${experienceInfo.label}`}>{experienceInfo.label}</span>
          </div>
        </div>
        <div className="flex-shrink-0">
          <KebabMenu />
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'border rounded-lg shadow-sm flex flex-col transition-all duration-200 hover:shadow-md group relative',
        cardStyles.background,
        cardStyles.border
      )}
    >
      <header className={cn('p-4 border-b', cardStyles.border, cardStyles.header)}>
        <div className="flex justify-between items-start gap-2">
          <div>
            <h3 className="text-lg font-bold text-foreground truncate" title={name}>
              {name}
            </h3>
            <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
              {isChild ? (
                <Baby className="h-4 w-4 flex-shrink-0" />
              ) : (
                <User className="h-4 w-4 flex-shrink-0" />
              )}
              <span>{age ? `${age} лет` : isChild ? 'Ребенок' : 'Взрослый'}</span>
              <span className="text-muted-foreground/50">•</span>
              <span
                title={`Уровень опыта: ${experienceInfo.label}`}
                className={cn(
                  'px-1.5 py-0.5 text-xs font-medium rounded border',
                  experienceInfo.className
                )}
              >
                {experienceInfo.label}
              </span>
            </div>
          </div>
          <KebabMenu />
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
              <span>
                {tab.label} {tab.count > 0 && `(${tab.count})`}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div key={activeTab} className="p-4 pt-2 min-h-[160px] flex-grow animate-fade-in">
        {activeTab === 'data' && (
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
        )}
        {activeTab === 'trips' && (
          <div className="space-y-3">
            {displayedTrips.length > 0 ? (
              displayedTrips.map((trip: Trip) => (
                <Link
                  to={`/trips/${trip.id}`}
                  key={trip.id}
                  className="block p-3 bg-muted rounded-lg hover:bg-secondary transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-foreground">{trip.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {trip.startDate
                          ? new Date(trip.startDate).toLocaleDateString('ru-RU')
                          : 'Дата не определена'}
                      </p>
                    </div>
                    <span
                      className={cn(
                        'text-xs px-2 py-1 rounded-full',
                        trip.status === 'completed'
                          ? 'bg-green-500/10 text-green-500'
                          : 'bg-yellow-500/10 text-yellow-400'
                      )}
                    >
                      {trip.status === 'completed' ? 'Завершен' : 'Планируется'}
                    </span>
                  </div>
                </Link>
              ))
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
