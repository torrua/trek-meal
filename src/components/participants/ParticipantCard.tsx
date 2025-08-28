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
  Award,
  Calendar,
} from 'lucide-react';
import { isFuture, isPast, parseISO, compareAsc, compareDesc } from 'date-fns';
import { PARTICIPANT_CONSTANTS } from '../../constants/participants';
import useTripStore from '../../stores/useTripStore';
import type { Participant, Trip } from '../../types';
import cn from 'classnames';

interface ParticipantCardProps {
  participant: Participant;
  onEdit: () => void;
  onDelete: (e: React.MouseEvent) => void;
  isCompact?: boolean;
}

type TabType = 'data' | 'trips' | 'equipment';

const ParticipantCard: React.FC<ParticipantCardProps> = ({
  participant,
  onEdit,
  onDelete,
  isCompact = false,
}) => {
  const { gender, age, name, notes, experienceLevel, phone, email, birthDate } = participant;
  const { trips } = useTripStore();
  const [activeTab, setActiveTab] = useState<TabType>('data');

  const cardStyles = PARTICIPANT_CONSTANTS.CARD_STYLES[gender];
  const experienceInfo = PARTICIPANT_CONSTANTS.EXPERIENCE_CONFIG[experienceLevel];
  const isChild = age === 'child';

  const participantTrips = useMemo(
    () => trips.filter((trip) => trip.participants.includes(participant.id)),
    [trips, participant.id]
  );

  const participantEquipment: unknown[] = useMemo(() => [], []);

  const displayedTrips = useMemo(() => {
    // 1. Разделяем походы на те, у которых есть дата, и те, у которых нет
    const tripsWithDate = participantTrips.filter((trip) => trip.startDate);
    const tripsWithoutDate = participantTrips
      .filter((trip) => !trip.startDate)
      .sort((a, b) => compareDesc(new Date(a.createdAt), new Date(b.createdAt))); // Сортируем по дате создания

    // 2. Сортируем походы с датой
    const upcoming = tripsWithDate
      .filter((trip) => isFuture(parseISO(trip.startDate)))
      .sort((a, b) => compareAsc(parseISO(a.startDate), parseISO(b.startDate)));
    const past = tripsWithDate
      .filter((trip) => isPast(parseISO(trip.startDate)))
      .sort((a, b) => compareDesc(parseISO(a.startDate), parseISO(b.startDate)));

    // 3. Объединяем все группы и берем первые 3
    return [...upcoming, ...past, ...tripsWithoutDate].slice(0, 3);
  }, [participantTrips]);

  const tabs: { id: TabType; label: string; icon: React.ElementType; count: number }[] = [
    { id: 'data', label: 'Данные', icon: User, count: 0 },
    { id: 'trips', label: 'Походы', icon: MapPin, count: participantTrips.length },
    { id: 'equipment', label: 'Снаряжение', icon: Backpack, count: participantEquipment.length },
  ];

  const handleActionClick = (e: React.MouseEvent, action: (e: React.MouseEvent) => void) => {
    e.stopPropagation();
    action(e);
  };

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
            {isChild ? <Baby className="h-6 w-6" /> : <User className="h-6 w-6" />}
          </div>
        </div>
        <div className="flex-grow min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-foreground truncate">{name}</h3>
            <span
              className={cn(
                'px-1.5 py-0.5 text-xs font-medium rounded border',
                experienceInfo.className
              )}
            >
              {experienceInfo.label}
            </span>
          </div>
          {participantTrips.length > 0 && (
            <p className="text-xs text-muted-foreground">{participantTrips.length} походов</p>
          )}
        </div>
        <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
          <button
            onClick={(e) => handleActionClick(e, () => onEdit())}
            className="p-1.5 text-muted-foreground hover:text-primary rounded transition-colors"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={(e) => handleActionClick(e, onDelete)}
            className="p-1.5 text-muted-foreground hover:text-danger rounded transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
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
      {isChild && (
        <div className="absolute -top-2 -right-2 z-10">
          <div className="bg-orange-400 text-white rounded-full p-2 shadow-lg border-2 border-card">
            <Baby className="h-4 w-4" />
          </div>
        </div>
      )}
      <header className={cn('p-4 border-b', cardStyles.border, cardStyles.header)}>
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-bold text-foreground truncate pr-2" title={name}>
            {name}
          </h3>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={(e) => handleActionClick(e, () => onEdit())}
              className="p-1.5 text-muted-foreground hover:text-primary rounded"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              onClick={(e) => handleActionClick(e, onDelete)}
              className="p-1.5 text-muted-foreground hover:text-danger rounded"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </header>
      <div className="border-t border-border/50">
        <div className="flex overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={(e) => {
                e.stopPropagation();
                setActiveTab(tab.id);
              }}
              className={cn(
                'flex items-center gap-2 px-4 py-2 text-sm font-medium whitespace-nowrap transition-all duration-200 border-b-2 flex-shrink-0',
                activeTab === tab.id ? cardStyles.tabActive : cardStyles.tabInactive
              )}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label} {tab.count > 0 && `(${tab.count})`}
            </button>
          ))}
        </div>
      </div>
      <div className="p-4 min-h-[180px] flex-grow">
        {activeTab === 'data' && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 gap-3 text-sm">
              <div className="flex items-center gap-2">
                <Award className="h-4 w-4 text-muted-foreground" />
                <span className="text-foreground">{experienceInfo.label}</span>
              </div>
              {phone && (
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">{phone}</span>
                </div>
              )}
              {email && (
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">{email}</span>
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
                <p className="text-sm text-muted-foreground italic">&ldquo;{notes}&rdquo;</p>
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
              <div className="text-center py-8 text-muted-foreground">
                <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Пока не участвовал в походах</p>
              </div>
            )}
          </div>
        )}
        {activeTab === 'equipment' && (
          <div className="text-center py-8 text-muted-foreground">
            <Backpack className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>Управление снаряжением будет добавлено позже</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(ParticipantCard);
