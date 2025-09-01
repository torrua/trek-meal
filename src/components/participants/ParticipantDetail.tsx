// src/components/participants/ParticipantDetail.tsx

import React from 'react';
import {
  Users,
  User,
  Baby,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Clock,
  Edit,
  Info,
  Trash2,
} from 'lucide-react';
import cn from 'classnames';
import type { Participant, Trip } from '../../types';
import { calculateAge, formatDate } from '../../utils';
import { EXPERIENCE_CONFIG } from '../../constants/participants';
import useTripStore from '../../stores/useTripStore';
import Button from '../../ui/Button';
import { Link } from 'react-router-dom';

interface ParticipantDetailProps {
  participant: Participant | null;
  onEdit: () => void;
}

const DIFFICULTY_MAP: { [key in Trip['difficulty']]: { text: string; className: string } } = {
  easy: {
    text: 'Легкий',
    className: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
  },
  medium: {
    text: 'Средний',
    className: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
  },
  hard: {
    text: 'Сложный',
    className: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
  },
};

const ParticipantDetail: React.FC<ParticipantDetailProps> = ({ participant, onEdit }) => {
  const { trips, removeParticipantFromTrip } = useTripStore();

  if (!participant) {
    return (
      <div className="h-full flex items-center justify-center bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Users className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Выберите участника
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            Кликните на карточку для просмотра подробной информации.
          </p>
        </div>
      </div>
    );
  }

  const experienceInfo = EXPERIENCE_CONFIG[participant.experienceLevel];
  const age = calculateAge(participant.birthDate);
  const isChild = participant.age === 'child';
  const participantTrips = trips.filter((trip) => trip.participants.includes(participant.id));

  const handleRemoveFromTrip = (e: React.MouseEvent, tripId: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm('Удалить участника из этого похода?')) {
      removeParticipantFromTrip(tripId, participant.id);
    }
  };

  return (
    <div className="h-full bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-gray-800 dark:to-gray-700">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center flex-shrink-0">
              {isChild ? (
                <Baby className="w-8 h-8 text-white" />
              ) : (
                <User className="w-8 h-8 text-white" />
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1 truncate">
                {participant.name}
              </h2>
              <div className="flex items-center gap-3 mb-2 flex-wrap">
                <span className="text-gray-600 dark:text-gray-300">
                  {age ? `${age} лет` : isChild ? 'Ребенок' : 'Взрослый'}
                </span>
                <span
                  className={cn(
                    'px-3 py-1 rounded-full text-sm font-medium border',
                    experienceInfo.className
                  )}
                >
                  {experienceInfo.label}
                </span>
              </div>
            </div>
          </div>
          <Button onClick={onEdit} className="flex items-center gap-2 flex-shrink-0">
            <Edit className="w-4 h-4" />
            Изменить
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
        {/* Contact Information */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-600" />
            Контактная информация
          </h3>
          <div className="grid grid-cols-1 gap-4">
            {participant.phone && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <Phone className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Телефон</p>
                  <a
                    href={`tel:${participant.phone}`}
                    className="text-gray-600 dark:text-gray-300 hover:underline break-all"
                  >
                    {participant.phone}
                  </a>
                </div>
              </div>
            )}
            {participant.email && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <Mail className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Email</p>
                  <a
                    href={`mailto:${participant.email}`}
                    className="text-gray-600 dark:text-gray-300 break-all hover:underline"
                  >
                    {participant.email}
                  </a>
                </div>
              </div>
            )}
            {participant.birthDate && (
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <Calendar className="w-5 h-5 text-gray-400 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Дата рождения</p>
                  <p className="text-gray-600 dark:text-gray-300">
                    {formatDate(participant.birthDate)}
                  </p>
                </div>
              </div>
            )}
            {!participant.phone && !participant.email && !participant.birthDate && (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <p>Контактная информация не указана</p>
              </div>
            )}
          </div>
        </div>

        {/* Notes */}
        {participant.notes && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-600" />
              Заметки
            </h3>
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {participant.notes}
              </p>
            </div>
          </div>
        )}

        {/* Trips */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-blue-600" />
            Походы ({participantTrips.length})
          </h3>
          {participantTrips.length > 0 ? (
            <div className="space-y-3">
              {participantTrips.map((trip) => (
                <Link
                  to={`/trips/${trip.id}`}
                  key={trip.id}
                  className="block p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group/trip relative"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-1 truncate">
                        {trip.name}
                      </h4>
                      <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300 flex-wrap">
                        <Clock className="w-4 h-4 flex-shrink-0" />
                        <span>{formatDate(trip.startDate)}</span>
                        {trip.destination && (
                          <>
                            <span>•</span>
                            <MapPin className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{trip.destination}</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span
                        className={cn(
                          'px-3 py-1.5 rounded-full text-xs font-medium',
                          DIFFICULTY_MAP[trip.difficulty].className
                        )}
                      >
                        {DIFFICULTY_MAP[trip.difficulty].text}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleRemoveFromTrip(e, trip.id)}
                        className="h-8 w-8 p-0 text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50 opacity-0 group-hover/trip:opacity-100 transition-all"
                        title="Удалить участника из этого похода"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>Участник не записан в походы.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParticipantDetail;
