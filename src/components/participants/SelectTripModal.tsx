// src/components/participants/SelectTripModal.tsx

import React, { useState, useMemo } from 'react';
import { SingleValue } from 'react-select';
import { MapPin, Calendar, Users, Info, X } from 'lucide-react';
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
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmit = async () => {
    if (!selectedTrip || isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    try {
      await onConfirm(selectedTrip.value);
      handleClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setSelectedTrip(null);
      onClose();
    }
  };

  const pluralized = useMemo(() => {
    if (selectedCount === 1) return 'участника';
    if (selectedCount > 1 && selectedCount < 5) return 'участника';
    return 'участников';
  }, [selectedCount]);

  const customFormatOptionLabel = (option: TripOption) => (
    <div className="flex items-center justify-between w-full py-1">
      <div className="min-w-0 flex-1">
        <div className="font-medium truncate text-gray-900 dark:text-white">{option.trip.name}</div>
        <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400 mt-1">
          <div className="flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            <span>{formatDate(option.trip.startDate)}</span>
          </div>
          {option.trip.destination && (
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              <span className="truncate max-w-[120px]">{option.trip.destination}</span>
            </div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 ml-3 flex-shrink-0">
        <Users className="w-3 h-3" />
        <span>{option.trip.participants.length}</span>
      </div>
    </div>
  );

  // Сброс состояния при открытии/закрытии модального окна
  React.useEffect(() => {
    if (!isOpen) {
      setSelectedTrip(null);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Добавить ${selectedCount} ${pluralized} в поход`}
      size="lg"
    >
      <div className="space-y-6">
        {/* Информационное сообщение */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800 dark:text-blue-200">
              {tripOptions.length > 0 ? (
                <>
                  <p className="font-medium mb-1">Выберите поход для добавления участников</p>
                  <p>
                    Отображаются только походы в стадии планирования.
                    {selectedIds.length === 1 && ' Исключены походы, где участник уже записан.'}
                  </p>
                </>
              ) : (
                <>
                  <p className="font-medium mb-1">Нет доступных походов</p>
                  <p>
                    {selectedIds.length === 1
                      ? 'Участник уже записан во все запланированные походы или походов пока нет.'
                      : 'Пока нет запланированных походов для записи участников.'}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Селектор походов */}
        {tripOptions.length > 0 && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Выберите поход *
            </label>
            <ThemedSelect
              options={tripOptions}
              value={selectedTrip}
              onChange={setSelectedTrip}
              placeholder="Выберите поход из списка..."
              noOptionsMessage={() => 'Нет подходящих походов'}
              formatOptionLabel={customFormatOptionLabel}
              isSearchable
              isDisabled={isSubmitting}
              menuPortalTarget={document.body}
              styles={{
                menuPortal: (base) => ({ ...base, zIndex: 9999 }),
              }}
            />

            {/* Детали выбранного похода */}
            {selectedTrip && (
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
                <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                  Информация о походе
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <div>
                      <div className="font-medium">Даты</div>
                      <div>
                        {formatDate(selectedTrip.trip.startDate)} -{' '}
                        {formatDate(selectedTrip.trip.endDate)}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <div>
                      <div className="font-medium">Место</div>
                      <div className="truncate">
                        {selectedTrip.trip.destination || 'Место не указано'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                    <Users className="w-4 h-4 text-gray-400" />
                    <div>
                      <div className="font-medium">Участники</div>
                      <div>
                        Текущих: {selectedTrip.trip.participants.length}
                        {selectedTrip.trip.maxParticipants &&
                          ` / ${selectedTrip.trip.maxParticipants} макс.`}
                      </div>
                    </div>
                  </div>
                  {selectedTrip.trip.description && (
                    <div className="sm:col-span-2 text-sm text-gray-600 dark:text-gray-300">
                      <div className="font-medium mb-1">Описание</div>
                      <p className="line-clamp-2">{selectedTrip.trip.description}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Кнопки управления */}
      <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-200 dark:border-gray-700">
        <Button
          variant="ghost"
          onClick={handleClose}
          disabled={isSubmitting}
          className="flex items-center gap-2"
        >
          <X className="w-4 h-4" />
          Отмена
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={!selectedTrip || isSubmitting}
          className="flex items-center gap-2 min-w-[140px]"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Добавление...
            </>
          ) : (
            <>
              <Users className="w-4 h-4" />
              Добавить в поход
            </>
          )}
        </Button>
      </div>
    </Modal>
  );
};

export default SelectTripModal;
