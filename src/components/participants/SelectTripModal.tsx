// src/components/participants/SelectTripModal.tsx

import React, { useState, useMemo } from 'react';
import { SingleValue } from 'react-select';
import useTripStore from '../../stores/useTripStore';
import type { Trip } from '../../types';
import Modal from '../../ui/Modal';
import Button from '../../ui/Button';
import ThemedSelect from '../../ui/ThemedSelect';
import { toast } from 'react-hot-toast';

interface SelectTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (tripId: number) => void;
  selectedCount: number;
  selectedIds: number[];
}

type TripOption = { value: number; label: string };

const SelectTripModal: React.FC<SelectTripModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  selectedCount,
  selectedIds,
}) => {
  const { trips } = useTripStore();
  const [selectedTrip, setSelectedTrip] = useState<SingleValue<TripOption>>(null);

  const tripOptions: TripOption[] = useMemo(() => {
    let availableTrips = trips.filter((t) => t.status === 'planning');

    if (selectedIds.length === 1) {
      const singleParticipantId = selectedIds[0];
      availableTrips = availableTrips.filter((t) => !t.participants.includes(singleParticipantId));
    }

    return availableTrips.map((t: Trip) => ({ value: t.id, label: t.name }));
  }, [trips, selectedIds]);

  const handleSubmit = () => {
    if (!selectedTrip) {
      toast.error('Пожалуйста, выберите поход.');
      return;
    }
    onConfirm(selectedTrip.value);
    onClose();
  };

  const pluralized =
    selectedCount === 1
      ? 'участника'
      : selectedCount > 1 && selectedCount < 5
        ? 'участников'
        : 'участников';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Добавить ${selectedCount} ${pluralized} в поход`}
    >
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          Выберите из списка один из запланированных походов.
        </p>
        <ThemedSelect
          options={tripOptions}
          value={selectedTrip}
          onChange={setSelectedTrip}
          placeholder="Выберите поход..."
          noOptionsMessage={() => 'Нет подходящих походов'}
        />
      </div>
      <div className="flex justify-end gap-3 pt-6 mt-4 border-t">
        <Button variant="ghost" onClick={onClose}>
          Отмена
        </Button>
        <Button variant="primary" onClick={handleSubmit}>
          Добавить
        </Button>
      </div>
    </Modal>
  );
};

export default SelectTripModal;
