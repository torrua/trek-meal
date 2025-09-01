// src/components/participants/SelectTripModal.tsx

import React, { useState, useMemo } from 'react';
import { SingleValue } from 'react-select';
import { MapPin, Calendar, Users } from 'lucide-react';
import useTripStore from '../../stores/useTripStore';
import type { Trip } from '../../types';
import Modal from '../../ui/Modal';
import Button from '../../ui/Button';
import ThemedSelect from '../../ui/ThemedSelect';
import { formatDate } from '../../utils';

interface SelectTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (tripId: number) => void;
  selectedCount: number;
  selectedIds: number[];
}

type TripOption = {
  value: number;
  label: string;
  trip: Trip;
};

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

    // Если выбран только один участник, исключаем походы, где он уже участвует
    if (selectedIds.length === 1) {
      const singleParticipantId = selectedIds[0];
      availableTrips = availableTrips.filter((t) => !t.participants.includes(singleParticipantId));
    }

    return availableTrips.map((trip: Trip) => ({
      value: trip.id,
      label: trip.name,
      trip,
    }));
  }, [trips, selectedIds]);

  const handleSubmit = () => {
    if (!selectedTrip) {
      return;
    }
    onConfirm(selectedTrip.value);
    setSelectedTrip(null);
    onClose();
  };

  const handleClose = () => {
    setSelectedTrip(null);
    onClose();
  };

  const pluralized = useMemo(() => {
    if (selectedCount === 1) return 'участника';
    if (selectedCount > 1 && selectedCount < 5) return 'участника';
    return 'участников';
  }, [selectedCount]);

  const customFormatOptionLabel = (option: TripOption) => (
    <div className="flex items-center justify-between w-full">
      <div className="min-w-0 flex-1">
        <div className="font-medium truncate">{option.trip.name}</div>
        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-1">
          <Calendar className="w-3 h-3" />
          <span>{formatDate(option.trip.startDate)}</span>
          {option.trip.destination && (
            <>
              <span>•</span>
              <MapPin className="w-3 h-3" />
              <span className="truncate">{option.trip.destination}</span>
            </>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 ml-2">
        <Users className="w-3 h-3" />
        <span>{option.trip.participants.length}</span>
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Добавить ${selectedCount} ${pluralized} в поход`}
    >
      <div className="space-y-6">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {tripOptions.length > 0 ? (
            <p>Выберите один из запланированных походов для добавления участников.</p>
          ) : (
            <div className="text-center py-8">
              <MapPin className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p className="font-medium text-gray-900 dark:text-white mb-1">
                Нет доступных походов
              </p>
              <p className="text-sm">
                {selectedIds.length === 1
                  ? 'Участник уже записан во все запланированные походы или походов пока нет.'
                  : 'Пока нет запланированных походов для записи участников.'}
              </p>
            </div>
          )}
        </div>

        {tripOptions.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Выберите поход
            </label>
            <ThemedSelect
              options={tripOptions}
              value={selectedTrip}
              onChange={setSelectedTrip}
              placeholder="Выберите поход..."
              noOptionsMessage={() => 'Нет подходящих походов'}
              formatOptionLabel={customFormatOptionLabel}
              isSearchable
            />
            {selectedTrip && (
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                  Информация о походе
                </h4>
                <div className="space-y-1 text-sm text-blue-800 dark:text-blue-200">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    <span>
                      {formatDate(selectedTrip.trip.startDate)} -{' '}
                      {formatDate(selectedTrip.trip.endDate)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    <span>{selectedTrip.trip.destination || 'Место не указано'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    <span>Текущих участников: {selectedTrip.trip.participants.length}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-200 dark:border-gray-700">
        <Button variant="ghost" onClick={handleClose}>
          Отмена
        </Button>
        <Button variant="primary" onClick={handleSubmit} disabled={!selectedTrip}>
          Добавить в поход
        </Button>
      </div>
    </Modal>
  );
};

export default SelectTripModal;
