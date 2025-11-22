// src/components/trips/TripDetail.tsx

import React, { useMemo, useState } from 'react';
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
  Trash2,
} from 'lucide-react';
import type { Trip, Participant } from '../types';
import { formatDate } from '../utils';
import { useNavigate } from 'react-router-dom';
import cn from 'classnames';
import useParticipantStore from '../stores/useParticipantStore';
import useProductStore from '../stores/useProductStore';
import useDishStore from '../stores/useDishStore';
import { calculateTripSummary } from '../utils';
import { DIFFICULTY_CONFIG } from '../constants/trips';
import ConfirmModal from '../ui/ConfirmModal';
import Button from '../ui/Button';
import InfoField from '../ui/InfoField';
import ContentBlock from '../ui/ContentBlock';
import EntityListItem from '../ui/EntityListItem';
import useTripStore from '../stores/useTripStore';
import { participantEntityConfig } from '../config/entityConfig';

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
  const [participantToRemove, setParticipantToRemove] = useState<Participant | null>(null);

  const tripParticipants = useMemo(
    () => allParticipants.filter((p) => trip?.participants.includes(p.id)),
    [allParticipants, trip?.participants]
  );

  const summary = useMemo(() => {
    if (!trip) return null;
    return calculateTripSummary(trip, products, allParticipants, dishes);
  }, [trip, products, allParticipants, dishes]);

  const handleConfirmRemove = () => {
    if (participantToRemove && trip) {
      removeParticipantFromTrip(trip.id, participantToRemove.id);
      setParticipantToRemove(null);
    }
  };

  const handleNavigateToParticipant = (participantId: number) => {
    navigate(`/participants?selectedId=${participantId}`);
  };

  const handleNavigateToPlanning = () => {
    if (trip) {
      navigate(`/trips/${trip.id}`);
    }
  };

  if (!trip) {
    return null;
  }

  const difficultyInfo = DIFFICULTY_CONFIG[trip.difficulty];

  return (
    <div className="space-y-6 pl-1 pb-10">
      {/* Header */}
      <div className="bg-card p-6 rounded-xl border border-border shadow-sm">
        <div className="flex justify-between items-start gap-4">
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
          <Button variant="secondary" onClick={onEdit}>
            <Edit className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Изменить</span>
          </Button>
        </div>
      </div>

      <ContentBlock title="Параметры похода" icon={Info} variant="blue">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {trip.startDate && (
            <InfoField
              icon={Calendar}
              label="Даты"
              value={`${formatDate(trip.startDate)} - ${formatDate(trip.endDate)}`}
            />
          )}
          <InfoField
            icon={Sun}
            label="Длительность"
            value={`${trip.days} ${trip.days === 1 ? 'день' : trip.days < 5 ? 'дня' : 'дней'}`}
          />
          <InfoField
            icon={Gauge}
            iconClassName={difficultyInfo.colorClassName}
            label="Сложность"
            value={
              <span className={cn(difficultyInfo.colorClassName)}>{difficultyInfo.label}</span>
            }
          />
        </div>
        {trip.description && (
          <div className="mt-4 p-4 bg-white/50 dark:bg-black/20 rounded-lg border border-border/50">
            <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
              {trip.description}
            </p>
          </div>
        )}
      </ContentBlock>

      <ContentBlock
        title={`Участники (${tripParticipants.length})`}
        icon={Users}
        variant="purple"
        actionButton={
          <Button
            size="sm"
            variant="ghost"
            onClick={onAddParticipant}
            title="Добавить участника"
            disabled={tripParticipants.length >= 20}
          >
            <UserRoundPlus className="w-4 h-4" />
          </Button>
        }
      >
        <div className="space-y-2">
          {tripParticipants.length > 0 ? (
            tripParticipants.map((p: Participant) => {
              const listItemConfig = participantEntityConfig.views.listItem;
              const actions = listItemConfig.actions?.({
                onView: () => handleNavigateToParticipant(p.id),
                onRemove: () => setParticipantToRemove(p),
              });

              return (
                <EntityListItem
                  key={p.id}
                  title={listItemConfig.title(p)}
                  meta={[
                    { icon: Users, text: 'Участник' }, // Можно добавить детали, если нужно
                  ]}
                  borderColor={participantEntityConfig.getBorderColor(p)}
                  menuItems={actions}
                />
              );
            })
          ) : (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground mb-3">Участники не добавлены</p>
              <Button size="sm" onClick={onAddParticipant} variant="secondary">
                <UserRoundPlus className="w-4 h-4 mr-2" />
                Добавить участника
              </Button>
            </div>
          )}
        </div>
      </ContentBlock>

      <ContentBlock
        title="Питание и Статистика"
        icon={Utensils}
        variant="green"
        actionButton={
          <Button
            size="sm"
            variant="ghost"
            onClick={handleNavigateToPlanning}
            title="Перейти к планированию"
          >
            <HandPlatter className="w-4 h-4 mr-2" />
            Планирование
          </Button>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {summary && (
            <InfoField
              icon={BarChart}
              label="Средний вес еды"
              value={`${Math.round(summary.averageWeightPerPersonPerDay)} г / чел / день`}
            />
          )}
        </div>
        {tripParticipants.length === 0 && (
          <div className="mt-3 p-3 bg-warning/10 border border-warning/20 rounded-lg text-center">
            <p className="text-sm text-warning-foreground">
              Добавьте участников для расчета норм питания
            </p>
          </div>
        )}
      </ContentBlock>

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
        </p>
      </ConfirmModal>
    </div>
  );
};

export default TripDetail;
