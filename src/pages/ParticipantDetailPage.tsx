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
} from 'lucide-react';
import type { Participant, Trip } from '../types';
import useTripStore from '../stores/useTripStore';
import useEquipmentStore from '../stores/useEquipmentStore';
import useEquipmentCategoryStore from '../stores/useEquipmentCategoryStore';
import { formatDate } from '../utils/index';
import { EXPERIENCE_CONFIG } from '../constants/participants';
import { useNavigate } from 'react-router-dom';
import { isFuture, parseISO } from 'date-fns';
import ConfirmModal from '../ui/ConfirmModal';
import Button from '../ui/Button';
import InfoField from '../ui/InfoField';
import ContentBlock from '../ui/ContentBlock';
import EntityListItem from '../ui/EntityListItem';
import { tripEntityConfig, equipmentEntityConfig } from '../config/entityConfig';

interface ParticipantDetailProps {
  participant: Participant | null;
  onAddToTrip: () => void;
  onEdit: () => void;
  openSections: string[]; // Пропсы для совместимости
  onToggleSection: (sectionId: string) => void; // Пропсы для совместимости
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
      {/* Header Block */}
      <div className="flex justify-between items-start bg-card p-6 rounded-xl border border-border shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-foreground truncate">{participant.name}</h2>
          <div className="flex items-center gap-2 mt-1">
            <Award className={cn('w-4 h-4', experienceInfo.colorClassName)} />
            <span className="text-muted-foreground font-medium">{experienceInfo.label}</span>
          </div>
        </div>
        <Button variant="secondary" onClick={onEdit}>
          <Edit className="w-4 h-4 sm:mr-2" />
          <span className="hidden sm:inline">Изменить</span>
        </Button>
      </div>

      <ContentBlock title="Личные данные" icon={User} variant="blue">
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
        {participant.notes && (
          <div className="mt-4 p-4 bg-white/50 dark:bg-black/20 rounded-lg border border-border/50">
            <div className="flex items-center gap-2 mb-2 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              <FileText className="w-3 h-3" /> Заметки
            </div>
            <p className="text-sm text-foreground whitespace-pre-wrap leading-relaxed">
              {participant.notes}
            </p>
          </div>
        )}
      </ContentBlock>

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
              const actions = listItemConfig.actions?.({
                onView: () => navigate(`/trips?selectedId=${trip.id}`), // Исправлено на ?selectedId
                onRemove: () => setTripToRemove(trip),
              });

              return (
                <EntityListItem
                  key={trip.id}
                  title={listItemConfig.title(trip)}
                  // Используем icon только как fallback или декоративный элемент в EntityListItem
                  // (но в новой версии EntityListItem icon prop убран, используем meta)
                  meta={[
                    { icon: Calendar, text: formatDate(trip.startDate) },
                    { icon: Users, text: trip.participants.length },
                  ]}
                  borderColor={tripEntityConfig.getBorderColor(trip)}
                  menuItems={actions}
                  // Убираем onClick, так как навигация через действия
                />
              );
            })
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <MapPin className="w-10 h-10 mx-auto mb-2 opacity-20" />
              <p className="text-sm">Нет активных или планируемых походов</p>
            </div>
          )}
        </div>
      </ContentBlock>

      <ContentBlock
        title={`Снаряжение (${participantEquipment.length})`}
        icon={Backpack}
        variant="purple"
        actionButton={
          <Button
            size="sm"
            variant="ghost"
            onClick={() => navigate('/equipment')}
            title="Перейти к снаряжению"
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
                />
              );
            })
          ) : (
            <div className="text-center py-6 text-muted-foreground">
              <Backpack className="w-10 h-10 mx-auto mb-2 opacity-20" />
              <p className="text-sm">Нет личного снаряжения</p>
            </div>
          )}
        </div>
      </ContentBlock>

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
    </div>
  );
};

export default ParticipantDetail;
