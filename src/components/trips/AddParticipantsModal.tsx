// src/components/trips/AddParticipantsModal.tsx

import React, { useState, useMemo } from 'react';
import { MultiValue } from 'react-select';
import { Users, X } from 'lucide-react';
import useTripStore from '../../stores/useTripStore';
import useParticipantStore from '../../stores/useParticipantStore';
import type { Participant } from '../../types';
import Modal from '../../ui/Modal';
import Button from '../../ui/Button';
import ThemedSelect from '../../ui/ThemedSelect';
import { toast } from 'react-hot-toast';

interface AddParticipantsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tripId: number | null;
}

type ParticipantOption = {
  value: number;
  label: string;
};

const AddParticipantsModal: React.FC<AddParticipantsModalProps> = ({ isOpen, onClose, tripId }) => {
  const { trips, addParticipantsToTrip } = useTripStore();
  const { participants: allParticipants } = useParticipantStore();
  const [selectedParticipants, setSelectedParticipants] = useState<MultiValue<ParticipantOption>>(
    []
  );

  const trip = useMemo(() => trips.find((t) => t.id === tripId), [trips, tripId]);

  const participantOptions = useMemo(() => {
    if (!trip) return [];
    return allParticipants
      .filter((p) => !trip.participants.includes(p.id))
      .map((p: Participant) => ({
        value: p.id,
        label: p.name,
      }));
  }, [allParticipants, trip]);

  const handleSubmit = () => {
    if (!tripId || selectedParticipants.length === 0) return;
    const participantIds = selectedParticipants.map((p) => p.value);
    addParticipantsToTrip(tripId, participantIds);
    // --- ИЗМЕНЕНИЕ: Не закрываем окно, а сбрасываем состояние ---
    setSelectedParticipants([]);
    // toast.success('Участники добавлены!'); // Уведомление теперь в сторе
  };

  const handleClose = () => {
    setSelectedParticipants([]);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Добавить участников в "${trip?.name || ''}"`}
    >
      <div className="space-y-6">
        <ThemedSelect
          isMulti
          options={participantOptions}
          value={selectedParticipants}
          onChange={setSelectedParticipants}
          placeholder="Выберите одного или нескольких участников..."
          noOptionsMessage={() => 'Все доступные участники уже в походе'}
          isSearchable
          autoFocus
          menuPortalTarget={document.body}
          closeMenuOnSelect={false} // --- ИЗМЕНЕНИЕ: Позволяет выбрать несколько, не закрывая меню
        />
      </div>

      <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-200 dark:border-gray-700">
        <Button variant="secondary" onClick={handleClose}>
          <X className="w-4 h-4 mr-2" />
          Закрыть
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={selectedParticipants.length === 0}
          className="flex items-center gap-2 min-w-[140px]"
        >
          <Users className="w-4 h-4" />
          Добавить в поход
        </Button>
      </div>
    </Modal>
  );
};

export default AddParticipantsModal;
