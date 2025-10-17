// src/components/trips/TripDetail.tsx

import React, { useMemo, useState, useCallback } from 'react';
import {
  Users,
  Calendar,
  Info,
  Edit,
  BarChart,
  Sun,
  Utensils,
  Gauge,
  UserRoundPlus,
  HandPlatter,
  MapPin,
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
import ConfirmModal from '../../ui/ConfirmModal';
import useTripStore from '../../stores/useTripStore';
import DetailPane from '../../ui/DetailPane';
import Button from '../../ui/Button';
import InfoField from '../../ui/InfoField';
import EntityListItem from '../../ui/EntityListItem';
import { participantEntityConfig } from '../../config/entityConfig';

interface TripDetailProps {
  trip: Trip | null;
  onEdit: () => void;
  onAddParticipant: () => void;
}

const TripDetail: React.FC<TripDetailProps> = ({ trip, onEdit, onAddParticipant }) => {
  const navigate = useNavigate();
  const { participants: allParticipants } = useParticipantStore();
  const { products } = useProductStore();
  const { dishes } = useDishStore();
  const { removeParticipantFromTrip } = useTripStore();
  const [openSections, setOpenSections] = useState<string[]>(['info', 'participants']);
  const [participantToRemove, setParticipantToRemove] = useState<Participant | null>(null);

  const tripParticipants = useMemo(
    () => allParticipants.filter((p) => trip?.participants.includes(p.id)),
    [allParticipants, trip?.participants]
  );

  const summary = useMemo(() => {
    if (!trip) return null;
    return calculateTripSummary(trip, products, allParticipants, dishes);
  }, [trip, products, allParticipants, dishes]);

  React.useEffect(() => {
    if (trip) {
      setOpenSections(['info', 'participants']);
    }
  }, [trip]);

  const handleToggleSection = useCallback((sectionId: string) => {
    setOpenSections((prev) =>
      prev.includes(sectionId) ? prev.filter((id) => id !== sectionId) : [...prev, sectionId]
    );
  }, []);

  const handleRequestRemove = useCallback((participant: Participant) => {
    setParticipantToRemove(participant);
  }, []);

  const handleConfirmRemove = useCallback(() => {
    if (participantToRemove && trip) {
      removeParticipantFromTrip(trip.id, participantToRemove.id);
      setParticipantToRemove(null);
    }
  }, [participantToRemove, trip, removeParticipantFromTrip]);

  const handleNavigateToParticipant = useCallback(
    (participantId: number) => {
      navigate(`/participants?selectedId=${participantId}`);
    },
    [navigate]
  );

  const handleNavigateToPlanning = useCallback(() => {
    if (trip) {
      navigate(`/trips/${trip.id}`);
    }
  }, [trip, navigate]);

  if (!trip) {
    return null;
  }

  const difficultyInfo = DIFFICULTY_CONFIG[trip.difficulty];

  const sections = [
    {
      id: 'info',
      title: 'Данные',
      icon: Info,
      actionButton: (
        <Button size="sm" variant="ghost" onClick={onEdit} title="Редактировать поход">
          <Edit className="w-4 h-4" />
        </Button>
      ),
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {trip.startDate && (
              <InfoField
                icon={Calendar}
                label="Даты"
                value={`${formatDate(trip.startDate)} - ${formatDate(trip.endDate)}`}
                data-testid="trip-dates"
              />
            )}
            <InfoField
              icon={Sun}
              label="Длительность"
              value={`${trip.days} ${trip.days === 1 ? 'день' : trip.days < 5 ? 'дня' : 'дней'}`}
              data-testid="trip-duration"
            />
            <InfoField
              icon={Gauge}
              iconClassName={difficultyInfo.colorClassName}
              label="Сложность"
              value={
                <span className={cn(difficultyInfo.colorClassName)}>{difficultyInfo.label}</span>
              }
              data-testid="trip-difficulty"
            />
          </div>
          {trip.description && (
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {trip.description}
              </p>
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'participants',
      title: `Участники (${tripParticipants.length})`,
      icon: Users,
      actionButton: (
        <Button
          size="sm"
          variant="ghost"
          onClick={onAddParticipant}
          title="Добавить участника"
          disabled={tripParticipants.length >= 20}
        >
          <UserRoundPlus className="w-4 h-4" />
        </Button>
      ),
      content: (
        <div className="space-y-2">
          {tripParticipants.length > 0 ? (
            tripParticipants.map((p: Participant) => {
              const listItemConfig = participantEntityConfig.views.listItem;
              const actions = listItemConfig.actions?.({
                onView: () => handleNavigateToParticipant(p.id),
                onRemove: () => handleRequestRemove(p),
              });

              return (
                <EntityListItem
                  key={p.id}
                  title={listItemConfig.title(p)}
                  icon={participantEntityConfig.getIcon(p)}
                  borderColor={participantEntityConfig.getBorderColor(p)}
                  details={listItemConfig.details?.(p)}
                  menuItems={actions}
                  onClick={() => handleNavigateToParticipant(p.id)}
                />
              );
            })
          ) : (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Users className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground mb-3">Участники не добавлены</p>
              <Button size="sm" onClick={onAddParticipant}>
                <UserRoundPlus className="w-4 h-4 mr-2" />
                Добавить первого участника
              </Button>
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'summary',
      title: 'Питание',
      icon: Utensils,
      actionButton: (
        <Button
          size="sm"
          variant="ghost"
          onClick={handleNavigateToPlanning}
          title="Перейти к планированию"
        >
          <HandPlatter className="w-4 h-4" />
        </Button>
      ),
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {summary && (
              <InfoField
                icon={BarChart}
                label="г/чел/день"
                value={summary.averageWeightPerPersonPerDay}
                data-testid="weight-per-person"
              />
            )}
          </div>
          {tripParticipants.length === 0 && (
            <div className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <p className="text-sm text-amber-700 dark:text-amber-300">
                Добавьте участников для расчета питания
              </p>
            </div>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <DetailPane
        sections={sections}
        openSections={openSections}
        onToggleSection={handleToggleSection}
      >
        <div>
          <h2 className="text-2xl font-bold text-foreground truncate" title={trip.name}>
            {trip.name}
          </h2>
          {trip.destination && (
            <p className="text-muted-foreground mt-1 flex items-center gap-2">
              <MapPin className="w-4 h-4 flex-shrink-0" />
              <span title={trip.destination}>{trip.destination}</span>
            </p>
          )}
        </div>
      </DetailPane>

      <ConfirmModal
        isOpen={!!participantToRemove}
        onClose={() => setParticipantToRemove(null)}
        onConfirm={handleConfirmRemove}
        title="Удалить участника?"
        variant="danger"
        confirmText="Удалить"
      >
        <p>
          Вы уверены, что хотите удалить участника{' '}
          <span className="font-bold">{participantToRemove?.name}</span> из этого похода?
          <br />
          <span className="text-sm text-muted-foreground mt-2 block">
            Участник останется в базе данных, но будет исключен из данного похода.
          </span>
        </p>
      </ConfirmModal>
    </>
  );
};

export default TripDetail;
