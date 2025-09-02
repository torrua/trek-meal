// src/components/participants/ParticipantDetail.tsx

import React, { useState, useEffect } from 'react';
import {
  Users,
  User,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Clock,
  Info,
  Trash2,
  ChevronDown,
  Backpack,
  ExternalLink,
  Gauge,
  AlertTriangle,
  Award,
  CirclePlus,
  Edit,
} from 'lucide-react';
import type { Participant } from '../../types';
import useTripStore from '../../stores/useTripStore';
import { formatDate } from '../../utils';
import { EXPERIENCE_CONFIG } from '../../constants/participants';
import Button from '../../ui/Button';
import { useNavigate } from 'react-router-dom';
import cn from 'classnames';
import { isFuture, parseISO } from 'date-fns';

interface ParticipantDetailProps {
  participant: Participant | null;
  onAddToTrip: (participantId: number) => void;
  onAddEquipment: (participantId: number) => void;
  onEdit: () => void;
}

const DIFFICULTY_CONFIG = {
  easy: { color: 'bg-green-500', icon: Gauge },
  medium: { color: 'bg-yellow-500', icon: Gauge },
  hard: { color: 'bg-red-500', icon: Gauge },
};

interface AccordionSectionProps {
  title: string;
  icon: React.ElementType;
  count?: number;
  isOpen: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  actionButton?: React.ReactNode;
}

const AccordionSection: React.FC<AccordionSectionProps> = ({
  title,
  icon: Icon,
  count,
  isOpen,
  onToggle,
  children,
  actionButton,
}) => (
  <div className="border-b border-gray-200 dark:border-gray-700 last:border-b-0">
    <button
      onClick={onToggle}
      className="w-full flex justify-between items-center p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
    >
      <div className="flex items-center gap-3">
        <Icon className="w-5 h-5 text-blue-600" />
        <span className="font-semibold text-gray-900 dark:text-white">{title}</span>
        {count !== undefined && count > 0 && (
          <>
            <span className="text-gray-300 dark:text-gray-600 font-light mx-1">•</span>
            <span className="text-sm text-gray-500 dark:text-gray-400">{count}</span>
          </>
        )}
      </div>
      <div className="flex items-center gap-2">
        {actionButton}
        <ChevronDown
          className={cn('w-5 h-5 text-gray-400 transition-transform', { 'rotate-180': isOpen })}
        />
      </div>
    </button>
    <div
      className={cn(
        'grid transition-all duration-300 ease-in-out',
        isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
      )}
    >
      <div className="overflow-hidden">
        <div className="p-4 pt-2">{children}</div>
      </div>
    </div>
  </div>
);

const ParticipantDetail: React.FC<ParticipantDetailProps> = ({
  participant,
  onAddToTrip,
  onAddEquipment,
  onEdit,
}) => {
  const { trips, removeParticipantFromTrip } = useTripStore();
  const navigate = useNavigate();
  const [openSections, setOpenSections] = useState<string[]>(['data']);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{
    show: boolean;
    tripId: number | null;
  }>({
    show: false,
    tripId: null,
  });

  useEffect(() => {
    if (participant) {
      setOpenSections(['data']);
    }
  }, [participant]);

  if (!participant) {
    return (
      <div className="h-full flex items-center justify-center bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
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
  const participantTrips = trips.filter((trip) => trip.participants.includes(participant.id));

  const sortedTrips = participantTrips.sort((a, b) => {
    const dateA = parseISO(a.startDate);
    const dateB = parseISO(b.startDate);
    const isAFuture = isFuture(dateA);
    const isBFuture = isFuture(b.startDate);

    if (isAFuture && !isBFuture) return -1;
    if (!isAFuture && isBFuture) return 1;
    if (isAFuture && isBFuture) return dateA.getTime() - dateB.getTime();
    return dateB.getTime() - dateA.getTime();
  });

  const handleRemoveFromTrip = (e: React.MouseEvent, tripId: number) => {
    e.preventDefault();
    e.stopPropagation();
    setShowDeleteConfirm({ show: true, tripId });
  };

  const confirmRemoveFromTrip = () => {
    if (showDeleteConfirm.tripId && participant) {
      removeParticipantFromTrip(showDeleteConfirm.tripId, participant.id);
      setShowDeleteConfirm({ show: false, tripId: null });
    }
  };

  const cancelRemoveFromTrip = () => {
    setShowDeleteConfirm({ show: false, tripId: null });
  };

  const handleToggleSection = (sectionId: string) => {
    setOpenSections((prev) =>
      prev.includes(sectionId) ? prev.filter((id) => id !== sectionId) : [...prev, sectionId]
    );
  };

  return (
    <div className="h-full bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col">
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <AccordionSection
          title="Данные"
          icon={User}
          isOpen={openSections.includes('data')}
          onToggle={() => handleToggleSection('data')}
          actionButton={
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors"
              title="Редактировать данные"
            >
              <Edit className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </button>
          }
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <Award className="w-4 sm:w-5 h-4 sm:h-5 text-gray-400 flex-shrink-0" />
                <div>
                  <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                    Опыт
                  </p>
                  <p
                    className={cn(
                      'text-sm sm:text-base font-semibold',
                      experienceInfo.className.replace(
                        /bg-\w+-50|border-\w+-200|dark:bg-\w+-900\/30|dark:border-\w+-700/g,
                        ''
                      )
                    )}
                  >
                    {experienceInfo.label}
                  </p>
                </div>
              </div>
              {participant.birthDate && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <Calendar className="w-4 sm:w-5 h-4 sm:h-5 text-gray-400 flex-shrink-0" />
                  <div>
                    <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                      Дата рождения
                    </p>
                    <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                      {formatDate(participant.birthDate)}
                    </p>
                  </div>
                </div>
              )}
              {participant.phone && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <Phone className="w-4 sm:w-5 h-4 sm:h-5 text-gray-400 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                      Телефон
                    </p>
                    <a
                      href={`tel:${participant.phone}`}
                      className="text-sm sm:text-base text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors break-all"
                    >
                      {participant.phone}
                    </a>
                  </div>
                </div>
              )}
              {participant.email && (
                <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <Mail className="w-4 sm:w-5 h-4 sm:h-5 text-gray-400 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
                      Email
                    </p>
                    <a
                      href={`mailto:${participant.email}`}
                      className="text-sm sm:text-base text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors break-all"
                    >
                      {participant.email}
                    </a>
                  </div>
                </div>
              )}
            </div>
            {participant.notes && (
              <div>
                <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <Info className="w-5 h-5" />
                  Заметки
                </h4>
                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
                    {participant.notes}
                  </p>
                </div>
              </div>
            )}
          </div>
        </AccordionSection>

        <AccordionSection
          title="Походы"
          icon={MapPin}
          count={participantTrips.length}
          isOpen={openSections.includes('trips')}
          onToggle={() => handleToggleSection('trips')}
          actionButton={
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddToTrip(participant.id);
              }}
              className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors"
              title="Добавить в поход"
            >
              <CirclePlus className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </button>
          }
        >
          {participantTrips.length > 0 ? (
            <div className="space-y-3">
              {sortedTrips.map((trip) => {
                const isUpcoming = isFuture(parseISO(trip.startDate));
                const difficultyConfig = DIFFICULTY_CONFIG[trip.difficulty];

                return (
                  <div
                    key={trip.id}
                    className="group/trip relative p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                  >
                    <div className="absolute top-3 right-3 z-10 opacity-0 group-hover/trip:opacity-100 transition-opacity">
                      <div className="flex items-center gap-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-1">
                        <button
                          onClick={() => navigate(`/trips/${trip.id}`)}
                          className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                          title="Открыть поход"
                        >
                          <ExternalLink className="w-3.5 h-3.5 text-gray-600 dark:text-gray-300" />
                        </button>
                        <button
                          onClick={(e) => handleRemoveFromTrip(e, trip.id)}
                          className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/50 rounded-md transition-colors"
                          title="Удалить участника из этого похода"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                        </button>
                      </div>
                    </div>

                    <div className="pr-16">
                      <div className="flex items-center gap-3 mb-2">
                        <div
                          className={cn(
                            'w-4 h-4 rounded flex items-center justify-center',
                            difficultyConfig.color
                          )}
                        >
                          <Gauge className="w-2.5 h-2.5 text-white" />
                        </div>
                        <h4 className="font-medium text-gray-900 dark:text-white truncate flex-1">
                          {trip.name}
                        </h4>
                        {isUpcoming && (
                          <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs rounded-full">
                            Предстоящий
                          </span>
                        )}
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-sm text-gray-600 dark:text-gray-300">
                        <div className="flex items-center gap-3 flex-wrap">
                          {trip.startDate && (
                            <div className="flex items-center gap-1">
                              <Clock className="w-4 h-4 flex-shrink-0" />
                              <span>{formatDate(trip.startDate)}</span>
                            </div>
                          )}
                          {trip.destination && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4 flex-shrink-0" />
                              <span className="truncate">{trip.destination}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Users className="w-4 h-4 flex-shrink-0" />
                            <span>{trip.participants.length} чел.</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <MapPin className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p className="font-medium mb-1">Участник не записан в походы</p>
              <p className="text-xs flex items-center justify-center gap-1">
                {'Добавьте участника в поход, нажав'}
                <CirclePlus className="w-3 h-3 inline-block" />
                {'в заголовке'}
              </p>
            </div>
          )}
        </AccordionSection>

        <AccordionSection
          title="Снаряжение"
          icon={Backpack}
          isOpen={openSections.includes('equipment')}
          onToggle={() => handleToggleSection('equipment')}
          actionButton={
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddEquipment(participant.id);
              }}
              className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors"
              title="Добавить снаряжение"
            >
              <CirclePlus className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </button>
          }
        >
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <Backpack className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p className="font-medium mb-1">Снаряжение не добавлено</p>
            <p className="text-xs">{'Эта функция находится в разработке'}</p>
          </div>
        </AccordionSection>
      </div>

      {showDeleteConfirm.show && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-4 sm:p-6 max-w-sm sm:max-w-md w-full shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 sm:w-10 h-8 sm:h-10 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-4 sm:w-5 h-4 sm:h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                  Удалить участника
                </h3>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                  Это действие нельзя отменить
                </p>
              </div>
            </div>
            <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 mb-4 sm:mb-6">
              Вы уверены, что хотите удалить участника из этого похода?
            </p>
            <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
              <Button
                variant="ghost"
                onClick={cancelRemoveFromTrip}
                className="px-4 py-2 order-2 sm:order-1"
              >
                Отмена
              </Button>
              <Button
                onClick={confirmRemoveFromTrip}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white order-1 sm:order-2"
              >
                Удалить
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParticipantDetail;
