// src/components/participants/ParticipantDetail.tsx

import React, { useState, useMemo } from 'react';
import {
  User,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Backpack,
  Award,
  Edit,
  MapPinPlus,
} from 'lucide-react';
import type { Participant, Trip } from '../../types';
import useTripStore from '../../stores/useTripStore';
import useEquipmentStore from '../../stores/useEquipmentStore';
import useEquipmentCategoryStore from '../../stores/useEquipmentCategoryStore';
import { formatDate } from '../../utils/index';
import { EXPERIENCE_CONFIG } from '../../constants/participants';
import { useNavigate } from 'react-router-dom';
import { isFuture, parseISO } from 'date-fns';
import ConfirmModal from '../../ui/ConfirmModal';
import DetailPane from '../../ui/DetailPane';
import Button from '../../ui/Button';
import InfoField from '../../ui/InfoField';
import EntityListItem from '../../ui/EntityListItem';
import { tripEntityConfig, equipmentEntityConfig } from '../../config/entityConfig';

interface ParticipantDetailProps {
  participant: Participant | null;
  onAddToTrip: () => void;
  onEdit: () => void;
  openSections: string[];
  onToggleSection: (sectionId: string) => void;
}

const ParticipantDetail: React.FC<ParticipantDetailProps> = ({
  participant,
  onAddToTrip,
  onEdit,
  openSections,
  onToggleSection,
}) => {
  const { trips, removeParticipantFromTrip } = useTripStore();
  const { equipment } = useEquipmentStore();
  const { categories } = useEquipmentCategoryStore();
  const navigate = useNavigate();
  const [tripToRemove, setTripToRemove] = useState<Trip | null>(null);

  const participantTrips = useMemo(
    () => (participant ? trips.filter((trip) => trip.participants.includes(participant.id)) : []),
    [trips, participant]
  );

  const participantEquipment = useMemo(
    () => (participant ? equipment.filter((eq) => eq.ownerId === participant.id) : []),
    [equipment, participant]
  );

  const formatWeight = (weight: number) => {
    if (weight < 1000) {
      return `${weight} г`;
    }
    return `${(weight / 1000).toFixed(1)} кг`;
  };

  if (!participant) {
    return null;
  }

  const sortedTrips = [...participantTrips].sort((a, b) => {
    const dateA = parseISO(a.startDate);
    const dateB = parseISO(b.startDate);
    return isFuture(dateA) && !isFuture(dateB)
      ? -1
      : !isFuture(dateA) && isFuture(dateB)
        ? 1
        : isFuture(dateA) && isFuture(dateB)
          ? dateA.getTime() - dateB.getTime()
          : dateB.getTime() - dateA.getTime();
  });

  const handleConfirmRemove = () => {
    if (tripToRemove) {
      removeParticipantFromTrip(tripToRemove.id, participant.id);
      setTripToRemove(null);
    }
  };

  const experienceInfo = EXPERIENCE_CONFIG[participant.experienceLevel];

  const sections = [
    {
      id: 'data',
      title: 'Данные',
      icon: User,
      actionButton: (
        <Button size="sm" variant="ghost" onClick={onEdit} title="Редактировать участника">
          <Edit className="w-4 h-4" />
        </Button>
      ),
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InfoField
              icon={Award}
              iconClassName={experienceInfo.colorClassName}
              label="Опыт"
              value={experienceInfo.label}
              valueClassName={experienceInfo.colorClassName}
            />
            {participant.birthDate && (
              <InfoField
                icon={Calendar}
                label="Дата рождения"
                value={formatDate(participant.birthDate)}
              />
            )}
            {participant.phone && (
              <InfoField icon={Phone} label="Телефон" value={participant.phone} />
            )}
            {participant.email && <InfoField icon={Mail} label="Email" value={participant.email} />}
          </div>
          {participant.notes && (
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {participant.notes}
              </p>
            </div>
          )}
        </div>
      ),
    },
    {
      id: 'trips',
      title: 'Походы',
      icon: MapPin,
      actionButton: (
        <Button size="sm" variant="ghost" onClick={onAddToTrip} title="Добавить в поход">
          <MapPinPlus className="w-4 h-4" />
        </Button>
      ),
      content: (
        <div className="space-y-2">
          {sortedTrips.length > 0 ? (
            sortedTrips.map((trip) => {
              const listItemConfig = tripEntityConfig.views.listItem;
              const actions = listItemConfig.actions?.({
                onView: () => navigate(`/trips/${trip.id}`),
                onRemove: () => setTripToRemove(trip),
              });

              return (
                <EntityListItem
                  key={trip.id}
                  title={listItemConfig.title(trip)}
                  icon={tripEntityConfig.getIcon(trip)}
                  borderColor={tripEntityConfig.getBorderColor(trip)}
                  details={listItemConfig.details?.(trip)}
                  menuItems={actions}
                  onClick={() => navigate(`/trips/${trip.id}`)}
                />
              );
            })
          ) : (
            <p className="text-sm text-center py-4 text-muted-foreground">Нет походов</p>
          )}
        </div>
      ),
    },
    {
      id: 'equipment',
      title: 'Снаряжение',
      icon: Backpack,
      actionButton: (
        <Button
          size="sm"
          variant="ghost"
          onClick={() => navigate('/equipment')}
          title="Перейти к снаряжению"
        >
          <Backpack className="w-4 h-4" />
        </Button>
      ),
      content: (
        <div className="space-y-2">
          {participantEquipment.length > 0 ? (
            participantEquipment.map((equipmentItem) => {
              const category = categories.find((c) => c.id === equipmentItem.categoryId);
              const listItemConfig = equipmentEntityConfig.views.listItem;
              const actions = listItemConfig.actions?.({
                onView: () => navigate(`/equipment?selectedId=${equipmentItem.id}`),
              });

              return (
                <EntityListItem
                  key={equipmentItem.id}
                  title={listItemConfig.title(equipmentItem)}
                  icon={equipmentEntityConfig.getIcon(equipmentItem)}
                  borderColor={equipmentEntityConfig.getBorderColor(equipmentItem, { category })}
                  details={listItemConfig.details?.(equipmentItem, {
                    formattedWeight: formatWeight(equipmentItem.weight),
                  })}
                  menuItems={actions}
                  onClick={() => navigate(`/equipment?selectedId=${equipmentItem.id}`)}
                />
              );
            })
          ) : (
            <p className="text-sm text-center py-4 text-muted-foreground">Нет снаряжения</p>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <DetailPane sections={sections} openSections={openSections} onToggleSection={onToggleSection}>
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-foreground truncate">{participant.name}</h2>
            <p className="text-muted-foreground">{experienceInfo.label}</p>
          </div>
          <Button variant="secondary" onClick={onEdit}>
            <Edit className="w-4 h-4 sm:mr-2" />
            <span className="hidden sm:inline">Изменить</span>
          </Button>
        </div>
      </DetailPane>
      <ConfirmModal
        isOpen={!!tripToRemove}
        onClose={() => setTripToRemove(null)}
        onConfirm={handleConfirmRemove}
        title="Убрать из похода?"
        variant="danger"
      >
        <p>
          Убрать участника <span className="font-bold">{participant.name}</span> из похода{' '}
          <span className="font-bold">{tripToRemove?.name}</span>?
        </p>
      </ConfirmModal>
    </>
  );
};

export default ParticipantDetail;
