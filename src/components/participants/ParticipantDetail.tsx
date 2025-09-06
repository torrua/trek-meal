// src/components/participants/ParticipantDetail.tsx

import React, { useState, useMemo } from 'react';
import {
  User,
  MapPin,
  Phone,
  Mail,
  Calendar,
  Trash2,
  Backpack,
  Award,
  Edit,
  MapPinPlus,
} from 'lucide-react';
import type { Participant, Trip } from '../../types';
import useTripStore from '../../stores/useTripStore';
import { formatDate, getEffectiveStatus } from '../../utils/index';
import { EXPERIENCE_CONFIG } from '../../constants/participants';
import { DIFFICULTY_CONFIG, STATUS_CONFIG } from '../../constants/trips';
import { useNavigate } from 'react-router-dom';
import { isFuture, parseISO } from 'date-fns';
import ConfirmModal from '../../ui/ConfirmModal';
import DetailPane from '../../ui/DetailPane';
import CompactCard from '../../ui/CompactCard';
import Button from '../../ui/Button';
import InfoField from '../../ui/InfoField'; // <-- Импортируем новый компонент

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
  const navigate = useNavigate();
  const [tripToRemove, setTripToRemove] = useState<Trip | null>(null);

  const participantTrips = useMemo(
    () => (participant ? trips.filter((trip) => trip.participants.includes(participant.id)) : []),
    [trips, participant]
  );

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
          {/* --- ИЗМЕНЕНИЕ: Используем новый компонент InfoField --- */}
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
            sortedTrips.map((trip) => (
              <CompactCard
                key={trip.id}
                title={trip.name}
                icon={DIFFICULTY_CONFIG[trip.difficulty].icon}
                details={`${formatDate(trip.startDate)} - ${trip.destination || 'Без места'}`}
                onClick={() => navigate(`/trips/${trip.id}`)}
                borderColor={STATUS_CONFIG[getEffectiveStatus(trip)].color}
                tag={
                  isFuture(parseISO(trip.startDate))
                    ? { text: 'План', color: STATUS_CONFIG.planning.color }
                    : undefined
                }
                menuItems={[
                  {
                    label: 'Убрать из похода',
                    icon: Trash2,
                    onClick: () => setTripToRemove(trip),
                    className: 'text-danger',
                  },
                ]}
              />
            ))
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
        <Button size="sm" variant="ghost" disabled title="В разработке">
          <Backpack className="w-4 h-4" />
        </Button>
      ),
      content: (
        <p className="text-sm text-center py-4 text-muted-foreground">Раздел в разработке</p>
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
