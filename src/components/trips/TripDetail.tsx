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
import DetailPane from '../../ui/DetailPane';
import Button from '../../ui/Button';

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
    [allParticipants, trip]
  );

  const summary = useMemo(
    () => calculateTripSummary(trip || undefined, products, allParticipants, dishes),
    [trip, products, allParticipants, dishes]
  );

  React.useEffect(() => {
    if (trip) {
      setOpenSections(['info', 'participants']);
    }
  }, [trip]);

  if (!trip) {
    // Этот return больше не используется, т.к. заглушка теперь в родительском компоненте,
    // но оставим его для надежности
    return null;
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {trip.startDate && (
              <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
                <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">Даты</p>
                  <p className="text-base text-muted-foreground">
                    {formatDate(trip.startDate)} - {formatDate(trip.endDate)}
                  </p>
                </div>
              </div>
            )}
            <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
              <Sun className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">Длительность</p>
                <p className="text-base text-muted-foreground">{trip.days}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
              <Gauge className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">Сложность</p>
                <p className={cn('text-base', difficultyInfo.colorClassName)}>
                  {difficultyInfo.label}
                </p>
              </div>
            </div>
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
        <Button size="sm" variant="ghost" onClick={onAddParticipant} title="Добавить участника">
          <UserRoundPlus className="w-4 h-4" />
        </Button>
      ),
      content: (
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
            <p className="text-sm text-center text-muted-foreground py-4">Участники не добавлены</p>
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
          onClick={() => navigate(`/trips/${trip.id}`)}
          title="Перейти к планированию"
        >
          <HandPlatter className="w-4 h-4" />
        </Button>
      ),
      content: (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
            <Utensils className="w-5 h-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">Приемов пищи в день</p>
              <p className="text-base text-muted-foreground">{trip.mealsPerDay}</p>
            </div>
          </div>
          <div className="flex items-start gap-3 p-3 bg-muted rounded-lg">
            <BarChart className="w-5 h-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">г/чел/день</p>
              <p className="text-base text-muted-foreground">
                {summary.averageWeightPerPersonPerDay}
              </p>
            </div>
          </div>
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
          <h2 className="text-2xl font-bold text-foreground truncate">{trip.name}</h2>
          {trip.destination && (
            <p className="text-muted-foreground mt-1 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              <span>{trip.destination}</span>
            </p>
          )}
        </div>
      </DetailPane>
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
    </>
  );
};

export default TripDetail;
