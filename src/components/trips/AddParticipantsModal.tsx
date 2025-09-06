// src/components/trips/AddParticipantsModal.tsx

import React, { useState, useMemo, useCallback } from 'react';
import { MultiValue } from 'react-select';
import { Users, X, AlertCircle } from 'lucide-react';
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
  isDisabled?: boolean;
};

const AddParticipantsModal: React.FC<AddParticipantsModalProps> = ({ isOpen, onClose, tripId }) => {
  const { trips, addParticipantsToTrip } = useTripStore();
  const { participants: allParticipants } = useParticipantStore();
  const [selectedParticipants, setSelectedParticipants] = useState<MultiValue<ParticipantOption>>(
    []
  );
  const [isSubmitting, setIsSubmitting] = useState(false);

  const trip = useMemo(() => trips.find((t) => t.id === tripId), [trips, tripId]);

  const participantOptions = useMemo(() => {
    if (!trip || !allParticipants.length) return [];

    return allParticipants
      .filter((p) => !trip.participants.includes(p.id))
      .map((p: Participant) => ({
        value: p.id,
        label: p.name,
        isDisabled: false,
      }))
      .sort((a, b) => a.label.localeCompare(b.label, 'ru'));
  }, [allParticipants, trip]);

  const handleSubmit = useCallback(async () => {
    if (!tripId || selectedParticipants.length === 0) return;

    setIsSubmitting(true);
    try {
      const participantIds = selectedParticipants.map((p) => p.value);
      addParticipantsToTrip(tripId, participantIds);

      const participantNames = selectedParticipants.map((p) => p.label).join(', ');
      toast.success(
        `${selectedParticipants.length === 1 ? 'Участник' : 'Участники'} ${participantNames} ${selectedParticipants.length === 1 ? 'добавлен' : 'добавлены'} в поход`
      );

      setSelectedParticipants([]);
      onClose();
    } catch (error) {
      console.error('Error adding participants:', error);
      toast.error('Произошла ошибка при добавлении участников');
    } finally {
      setIsSubmitting(false);
    }
  }, [tripId, selectedParticipants, addParticipantsToTrip, onClose]);

  const handleClose = useCallback(() => {
    if (isSubmitting) return; // Предотвращаем закрытие во время загрузки
    setSelectedParticipants([]);
    onClose();
  }, [onClose, isSubmitting]);

  const handleSelectionChange = useCallback(
    (newValue: MultiValue<ParticipantOption>) => {
      // Ограничиваем количество участников (например, максимум 20)
      const MAX_PARTICIPANTS = 20;
      const currentParticipantsCount = trip?.participants.length || 0;
      const availableSlots = MAX_PARTICIPANTS - currentParticipantsCount;

      if (newValue.length > availableSlots) {
        toast.warning(`Можно добавить не более ${availableSlots} участников`);
        return;
      }

      setSelectedParticipants(newValue);
    },
    [trip]
  );

  // Проверяем, есть ли доступные участники
  const hasAvailableParticipants = participantOptions.length > 0;
  const currentParticipantsCount = trip?.participants.length || 0;
  const maxParticipantsReached = currentParticipantsCount >= 20;

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Добавить участников в "${trip?.name || ''}"`}
      size="md"
    >
      <div className="space-y-6">
        {/* Информация о текущем состоянии */}
        {trip && (
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
            <div className="flex items-center gap-2 text-sm text-blue-700 dark:text-blue-300">
              <Users className="w-4 h-4" />
              <span>
                В походе уже {currentParticipantsCount}{' '}
                {currentParticipantsCount === 1
                  ? 'участник'
                  : currentParticipantsCount < 5
                    ? 'участника'
                    : 'участников'}
              </span>
            </div>
          </div>
        )}

        {/* Предупреждение если достигнут лимит */}
        {maxParticipantsReached && (
          <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
            <div className="flex items-start gap-2 text-sm text-amber-700 dark:text-amber-300">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">Достигнут максимум участников</p>
                <p className="mt-1">
                  Для добавления новых участников сначала удалите существующих.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Селектор участников */}
        {hasAvailableParticipants && !maxParticipantsReached && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Выберите участников для добавления
            </label>
            <ThemedSelect
              isMulti
              options={participantOptions}
              value={selectedParticipants}
              onChange={handleSelectionChange}
              placeholder="Начните вводить имя участника..."
              noOptionsMessage={() => 'Все доступные участники уже в походе'}
              isSearchable
              autoFocus
              menuPortalTarget={document.body}
              closeMenuOnSelect={false}
              isDisabled={isSubmitting}
              classNamePrefix="react-select"
              maxMenuHeight={200}
            />
            {selectedParticipants.length > 0 && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Выбрано: {selectedParticipants.length}{' '}
                {selectedParticipants.length === 1
                  ? 'участник'
                  : selectedParticipants.length < 5
                    ? 'участника'
                    : 'участников'}
              </p>
            )}
          </div>
        )}

        {/* Сообщение если нет доступных участников */}
        {!hasAvailableParticipants && !maxParticipantsReached && (
          <div className="text-center py-8">
            <Users className="w-12 h-12 mx-auto mb-3 text-gray-400" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
              Нет доступных участников
            </h3>
            <p className="text-gray-500 dark:text-gray-400">
              Все участники уже добавлены в этот поход или нет зарегистрированных участников.
            </p>
          </div>
        )}
      </div>

      {/* Кнопки действий */}
      <div className="flex justify-end gap-3 pt-6 mt-6 border-t border-gray-200 dark:border-gray-700">
        <Button variant="secondary" onClick={handleClose} disabled={isSubmitting}>
          <X className="w-4 h-4 mr-2" />
          Отмена
        </Button>
        <Button
          variant="primary"
          onClick={handleSubmit}
          disabled={selectedParticipants.length === 0 || isSubmitting || maxParticipantsReached}
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

export default AddParticipantsModal;
