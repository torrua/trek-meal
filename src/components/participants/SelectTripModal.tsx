// src/components/participants/SelectTripModal.tsx

import React, { useState, useMemo } from 'react';
import { MapPin, Calendar, Users, Info, X } from 'lucide-react';
import useTripStore from '../../stores/useTripStore';
import type { Trip } from '../../types';
import Modal from '../../ui/Modal';
import Button from '../../ui/Button';
import DropdownSelect from '../../ui/DropdownSelect';
import FormField from '../../ui/FormField';
import { formatDate } from '../../utils';

interface SelectTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (tripId: number) => void;
  selectedCount: number;
  selectedIds: number[];
}

type TripOption = {
  value: string;
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
  const [selectedTrip, setSelectedTrip] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const tripOptions: TripOption[] = useMemo(() => {
    let availableTrips = trips.filter((t) => t.status === 'planning');

    if (selectedIds.length === 1) {
      const singleParticipantId = selectedIds[0];
      availableTrips = availableTrips.filter((t) => !t.participants.includes(singleParticipantId));
    }

    return availableTrips.map((trip: Trip) => ({
      value: String(trip.id),
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
      await onConfirm(Number(selectedTrip));
      handleClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setSelectedTrip('');
      onClose();
    }
  };

  const pluralized = useMemo(() => {
    if (selectedCount === 1) return 'участника';
    if (selectedCount > 1 && selectedCount < 5) return 'участника';
    return 'участников';
  }, [selectedCount]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Добавить ${selectedCount} ${pluralized} в поход`}
      size="lg"
    >
      <div className="space-y-6">
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
            <div className="text-sm text-foreground">
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

        {tripOptions.length > 0 && (
          <div>
            <FormField label="Выберите поход *">
              <DropdownSelect
                icon={MapPin}
                options={tripOptions}
                value={selectedTrip}
                onChange={(val) => typeof val === 'string' && setSelectedTrip(val)}
                placeholder="Выберите поход из списка..."
                disabled={isSubmitting}
              />
            </FormField>

            {selectedTrip && (
              <div className="mt-4 p-4 bg-muted/30 rounded-lg border border-border">
                <h4 className="font-medium text-foreground mb-3">Информация о походе</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <div>
                      <div className="font-medium">Даты</div>
                      <div>
                        {formatDate(
                          tripOptions.find((o) => o.value === selectedTrip)!.trip.startDate
                        )}{' '}
                        -{' '}
                        {formatDate(
                          tripOptions.find((o) => o.value === selectedTrip)!.trip.endDate
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <div>
                      <div className="font-medium">Место</div>
                      <div className="truncate">
                        {tripOptions.find((o) => o.value === selectedTrip)!.trip.destination ||
                          'Место не указано'}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="w-4 h-4 text-gray-400" />
                    <div>
                      <div className="font-medium">Участники</div>
                      <div>
                        Текущих:{' '}
                        {
                          tripOptions.find((o) => o.value === selectedTrip)!.trip.participants
                            .length
                        }
                      </div>
                    </div>
                  </div>
                  {tripOptions.find((o) => o.value === selectedTrip)!.trip.description && (
                    <div className="sm:col-span-2 text-sm text-muted-foreground">
                      <div className="font-medium mb-1">Описание</div>
                      <p className="line-clamp-2">
                        {tripOptions.find((o) => o.value === selectedTrip)!.trip.description}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-border">
        <Button
          variant="secondary"
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
