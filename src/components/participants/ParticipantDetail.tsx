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
  FileText,
  ExternalLink,
  Trash2,
  Scale, // Добавлен импорт Scale
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
import Button from '../../ui/Button';
import InfoField from '../../ui/InfoField';
import ContentBlock from '../../ui/ContentBlock';
import EntityListItem from '../../ui/EntityListItem';
import { tripEntityConfig, equipmentEntityConfig } from '../../config/entityConfig';
import cn from 'classnames';

interface ParticipantDetailProps {
  participant: Participant | null;
  onAddToTrip: () => void;
  onEdit: () => void;
  openSections?: string[];
  onToggleSection?: (sectionId: string) => void;
}

const ParticipantDetail: React.FC<ParticipantDetailProps> = ({
  participant,
  onAddToTrip,
  onEdit,
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

  return (
    <div className="space-y-6 pl-1 pb-10">
      {/* 1. Основная информация (Blue Variant) */}
      <ContentBlock
        title="Основная информация"
        icon={User}
        variant="blue"
        actionButton={
          <Button size="sm" variant="ghost" onClick={onEdit}>
            <Edit className="w-4 h-4 mr-2" />
            Редактировать
          </Button>
        }
      >
        <div className="space-y-6">
          {/* Имя и Опыт - Крупно */}
          <div>
            <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">
              Участник
            </label>
            <div className="text-xl font-bold text-foreground">{participant.name}</div>
            <div
              className={cn(
                'inline-flex items-center gap-1.5 mt-2 px-2.5 py-1 rounded-md text-sm font-medium bg-muted/50',
                experienceInfo.colorClassName
              )}
            >
              <Award className="w-4 h-4" />
              {experienceInfo.label}
            </div>
          </div>

          {/* Сетка контактов и дат */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

          {/* Заметки */}
          {participant.notes && (
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wider flex items-center gap-2">
                <FileText className="w-3 h-3" /> Заметки
              </label>
              <div className="p-4 bg-white/50 dark:bg-black/20 rounded-lg border border-border/50 text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                {participant.notes}
              </div>
            </div>
          )}
        </div>
      </ContentBlock>

      {/* 2. Походы (Orange Variant) */}
      <ContentBlock
        title={`Походы (${sortedTrips.length})`}
        icon={MapPin}
        variant="orange"
        actionButton={
          <Button size="sm" variant="ghost" onClick={onAddToTrip} title="Добавить в поход">
            <MapPinPlus className="w-4 h-4" />
          </Button>
        }
      >
        <div className="space-y-2">
          {sortedTrips.length > 0 ? (
            sortedTrips.map((trip) => {
              const listItemConfig = tripEntityConfig.views.listItem;
              const actions = [
                {
                  label: 'Открыть поход',
                  icon: ExternalLink,
                  onClick: () => navigate(`/trips?selectedId=${trip.id}`),
                },
                {
                  label: 'Убрать из похода',
                  icon: Trash2,
                  onClick: () => setTripToRemove(trip),
                  className: 'text-red-600 dark:text-red-400',
                },
              ];

              return (
                <EntityListItem
                  key={trip.id}
                  title={listItemConfig.title(trip)}
                  meta={[
                    { icon: Calendar, text: formatDate(trip.startDate) },
                    { icon: MapPin, text: trip.destination || '—' },
                  ]}
                  borderColor={tripEntityConfig.getBorderColor(trip)}
                  menuItems={actions}
                  variant="neutral"
                />
              );
            })
          ) : (
            <div className="text-center py-8 px-4 border-2 border-dashed border-border/50 rounded-lg">
              <MapPin className="w-8 h-8 mx-auto mb-2 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">Нет активных или завершенных походов</p>
            </div>
          )}
        </div>
      </ContentBlock>

      {/* 3. Снаряжение (Purple Variant) */}
      <ContentBlock
        title={`Личное снаряжение (${participantEquipment.length})`}
        icon={Backpack}
        variant="purple"
        actionButton={
          <Button
            size="sm"
            variant="ghost"
            onClick={() => navigate('/equipment')}
            title="Перейти к списку снаряжения"
          >
            <ExternalLink className="w-4 h-4" />
          </Button>
        }
      >
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
                  borderColor={equipmentEntityConfig.getBorderColor(equipmentItem, { category })}
                  meta={[{ icon: Scale, text: formatWeight(equipmentItem.weight) }]}
                  menuItems={actions}
                  variant="info"
                />
              );
            })
          ) : (
            <div className="text-center py-8 px-4 border-2 border-dashed border-border/50 rounded-lg">
              <Backpack className="w-8 h-8 mx-auto mb-2 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">Нет закрепленного личного снаряжения</p>
            </div>
          )}
        </div>
      </ContentBlock>

      {/* Модалка удаления из похода */}
      <ConfirmModal
        isOpen={!!tripToRemove}
        onClose={() => setTripToRemove(null)}
        onConfirm={handleConfirmRemove}
        title="Убрать из похода?"
        variant="danger"
        confirmText="Убрать"
      >
        <p>
          Вы уверены, что хотите убрать участника{' '}
          <span className="font-bold">{participant.name}</span> из похода{' '}
          <span className="font-bold">{tripToRemove?.name}</span>?
        </p>
      </ConfirmModal>
    </div>
  );
};

export default ParticipantDetail;
