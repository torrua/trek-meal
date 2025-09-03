// src/components/trips/TripDetail.tsx

import React, { useMemo, useState } from 'react';
import {
  Users,
  Calendar,
  ChevronDown,
  Info,
  Edit,
  BarChart,
  Backpack,
  Sun,
  Utensils,
  Gauge,
  MapPin,
  UserRoundPlus,
  HandPlatter,
} from 'lucide-react';
import type { Trip, Participant } from '../../types';
import { formatDate } from '../../utils';
import { useNavigate } from 'react-router-dom';
import cn from 'classnames';
import useParticipantStore from '../../stores/useParticipantStore';
import useProductStore from '../../stores/useProductStore';
import useDishStore from '../../stores/useDishStore';
import { calculateTripSummary } from '../../utils';
import { DIFFICULTY_CONFIG } from '../../constants/trips';
import ParticipantListItem from './ParticipantListItem';
import ConfirmModal from '../../ui/ConfirmModal';
import useTripStore from '../../stores/useTripStore';

interface TripDetailProps {
  trip: Trip | null;
  onEdit: () => void;
  onAddParticipant: () => void;
}

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

const TripDetail: React.FC<TripDetailProps> = ({ trip, onEdit, onAddParticipant }) => {
  const navigate = useNavigate();
  const { participants: allParticipants } = useParticipantStore();
  const { products } = useProductStore();
  const { dishes } = useDishStore();
  const { removeParticipantFromTrip } = useTripStore();
  const [openSections, setOpenSections] = useState<string[]>(['info']);
  const [participantToRemove, setParticipantToRemove] = useState<Participant | null>(null);

  const tripParticipants = useMemo(
    () => allParticipants.filter((p) => trip?.participants.includes(p.id)),
    [allParticipants, trip]
  );

  const summary = useMemo(
    () => calculateTripSummary(trip, products, allParticipants, dishes),
    [trip, products, allParticipants, dishes]
  );

  React.useEffect(() => {
    if (trip) {
      setOpenSections(['info']);
    }
  }, [trip]);

  if (!trip) {
    return (
      <div className="h-full flex items-center justify-center bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700">
        <div className="text-center">
          <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700/50 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Backpack className="w-10 h-10 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Выберите поход</h3>
          <p className="text-gray-500 dark:text-gray-400">
            Кликните на карточку для просмотра подробной информации.
          </p>
        </div>
      </div>
    );
  }

  const handleToggleSection = (sectionId: string) => {
    setOpenSections((prev) =>
      prev.includes(sectionId) ? prev.filter((id) => id !== sectionId) : [...prev, sectionId]
    );
  };

  const handleRequestRemove = (participant: Participant) => {
    setParticipantToRemove(participant);
  };

  const handleConfirmRemove = () => {
    if (participantToRemove) {
      removeParticipantFromTrip(trip.id, participantToRemove.id);
      setParticipantToRemove(null);
    }
  };

  const difficultyInfo = DIFFICULTY_CONFIG[trip.difficulty];

  return (
    <div className="h-full bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col">
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <AccordionSection
          title="Данные"
          icon={Info}
          isOpen={openSections.includes('info')}
          onToggle={() => handleToggleSection('info')}
          actionButton={
            <button
              onClick={(e) => {
                e.stopPropagation();
                onEdit();
              }}
              className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors"
              title="Редактировать поход"
            >
              <Edit className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </button>
          }
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {trip.startDate && (
                <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Даты</p>
                    <p className="text-base text-gray-600 dark:text-gray-300">
                      {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                    </p>
                  </div>
                </div>
              )}
              <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <Sun className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Длительность</p>
                  <p className="text-base text-gray-600 dark:text-gray-300">{trip.days}</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <Gauge className="w-5 h-5 text-gray-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Сложность</p>
                  <p className={cn('text-base', difficultyInfo.colorClassName)}>
                    {difficultyInfo.label}
                  </p>
                </div>
              </div>
            </div>
            {trip.description && (
              <div className="mt-4">
                <h4 className="text-md font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <Info className="w-5 h-5" />
                  Заметки
                </h4>
                <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {trip.description}
                  </p>
                </div>
              </div>
            )}
          </div>
        </AccordionSection>

        <AccordionSection
          title="Участники"
          icon={Users}
          count={tripParticipants.length}
          isOpen={openSections.includes('participants')}
          onToggle={() => handleToggleSection('participants')}
          actionButton={
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddParticipant();
              }}
              className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors"
              title="Добавить участника"
            >
              <UserRoundPlus className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </button>
          }
        >
          <div className="space-y-2">
            {tripParticipants.length > 0 ? (
              tripParticipants.map((p: Participant) => (
                <ParticipantListItem
                  key={p.id}
                  participant={p}
                  onRemove={() => handleRequestRemove(p)}
                  onView={() => navigate(`/participants?selectedId=${p.id}`)}
                />
              ))
            ) : (
              <p className="text-sm text-center text-gray-500 py-4">Участники не добавлены</p>
            )}
          </div>
        </AccordionSection>

        <AccordionSection
          title="Питание"
          icon={Utensils}
          isOpen={openSections.includes('summary')}
          onToggle={() => handleToggleSection('summary')}
          actionButton={
            <button
              onClick={(e) => {
                e.stopPropagation();
                navigate(`/trips/${trip.id}`);
              }}
              className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-md transition-colors"
              title="Перейти к планированию"
            >
              <HandPlatter className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </button>
          }
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <Utensils className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Приемов пищи в день
                </p>
                <p className="text-base text-gray-600 dark:text-gray-300">{trip.mealsPerDay}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
              <BarChart className="w-5 h-5 text-gray-400 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">г/чел/день</p>
                <p className="text-base text-gray-600 dark:text-gray-300">
                  {summary.averageWeightPerPersonPerDay}
                </p>
              </div>
            </div>
          </div>
        </AccordionSection>
      </div>
      <ConfirmModal
        isOpen={!!participantToRemove}
        onClose={() => setParticipantToRemove(null)}
        onConfirm={handleConfirmRemove}
        title={`Удалить участника?`}
        variant="danger"
        confirmText="Удалить"
      >
        <p>
          Вы уверены, что хотите удалить участника{' '}
          <span className="font-bold">{participantToRemove?.name}</span> из этого похода?
        </p>
      </ConfirmModal>
    </div>
  );
};

export default TripDetail;
