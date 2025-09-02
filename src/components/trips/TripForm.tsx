// src/components/trips/TripForm.tsx

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import 'react-datepicker/dist/react-datepicker.css';
import { formatISO, parseISO } from 'date-fns';
import { Flame, AlertCircle, X, Save } from 'lucide-react';
import { useTripDates } from '../../hooks/useTripDates';
import useParticipantStore from '../../stores/useParticipantStore';
import Button from '../../ui/Button';
import ThemedDatePicker from '../../ui/ThemedDatePicker';
import Input from '../../ui/Input';
import DropdownSelect from '../../ui/DropdownSelect';
import Textarea from '../../ui/Textarea';
import type { Trip, TripData, Participant } from '../../types';
import ConfirmModal from '../../ui/ConfirmModal';

interface TripFormProps {
  onSubmit: (formData: TripData) => void;
  onCancel: () => void;
  trip?: Trip | null;
  initialParticipantIds?: number[];
}

const INITIAL_STATE: TripData = {
  name: '',
  description: '',
  destination: '',
  difficulty: 'easy',
  days: 1,
  mealsPerDay: 3,
  participants: [],
  startDate: '',
  endDate: '',
};

const TripForm: React.FC<TripFormProps> = ({
  onSubmit,
  onCancel,
  trip = null,
  initialParticipantIds = [],
}) => {
  const { participants } = useParticipantStore();
  const [formData, setFormData] = useState<TripData>(INITIAL_STATE);
  const [initialData, setInitialData] = useState<TripData>(INITIAL_STATE);
  const { dateRange, days, handleDateRangeChange, handleDaysChange } = useTripDates(
    trip || { ...INITIAL_STATE, days: 1 }
  );
  const [errors, setErrors] = useState<{ name?: string }>({});
  const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);

  const isDirty = useMemo(() => {
    const initialStartDate = initialData.startDate
      ? formatISO(parseISO(initialData.startDate), { representation: 'date' })
      : '';
    const currentStartDate = dateRange[0]
      ? formatISO(dateRange[0], { representation: 'date' })
      : '';

    if (JSON.stringify(formData) !== JSON.stringify(initialData)) return true;
    if (days !== initialData.days) return true;
    if (initialStartDate !== currentStartDate) return true;

    return false;
  }, [formData, initialData, days, dateRange]);

  useEffect(() => {
    let dataToSet: TripData;
    if (trip) {
      const { id: _id, createdAt: _ca, status: _st, selectedMeals: _sm, ...rest } = trip;
      dataToSet = { ...INITIAL_STATE, ...rest };
    } else {
      dataToSet = { ...INITIAL_STATE, participants: initialParticipantIds, days: 1 };
    }
    setFormData(dataToSet);
    setInitialData(dataToSet);
  }, [trip, initialParticipantIds]);

  const handleFieldChange = useCallback((field: keyof TripData, value: any) => {
    if (field === 'name' && String(value).trim().length > 0) {
      setErrors((prev) => ({ ...prev, name: undefined }));
    }
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleParticipantToggle = (id: number) => {
    const newParticipants = formData.participants.includes(id)
      ? formData.participants.filter((pId) => pId !== id)
      : [...formData.participants, id];
    handleFieldChange('participants', newParticipants);
  };

  const handleCancel = () => {
    if (isDirty) {
      setConfirmModalOpen(true);
    } else {
      onCancel();
    }
  };

  const handleConfirmCancel = () => {
    setConfirmModalOpen(false);
    onCancel();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setErrors({ name: 'Пожалуйста, укажите название похода.' });
      return;
    }
    const finalFormData: TripData = {
      ...formData,
      days,
      startDate: dateRange[0] ? formatISO(dateRange[0], { representation: 'date' }) : '',
      endDate: dateRange[1] ? formatISO(dateRange[1], { representation: 'date' }) : '',
    };
    onSubmit(finalFormData);
  };

  return (
    <>
      <form onSubmit={handleSubmit} className="p-1 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Название похода *"
            name="name"
            type="text"
            value={formData.name}
            onChange={(e) => handleFieldChange('name', e.target.value)}
            error={errors.name}
            autoFocus
            required
          />
          <Input
            label="Место (регион)"
            name="destination"
            type="text"
            value={formData.destination}
            onChange={(e) => handleFieldChange('destination', e.target.value)}
            placeholder="Например, Кавказ"
          />
        </div>

        <Textarea
          label="Описание"
          name="description"
          value={formData.description}
          onChange={(e) => handleFieldChange('description', e.target.value)}
          rows={3}
        />

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          <div className="md:col-span-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Даты похода
            </label>
            <ThemedDatePicker
              selectsRange
              startDate={dateRange[0]}
              endDate={dateRange[1]}
              onChange={handleDateRangeChange}
              isClearable={true}
              monthsShown={2}
            />
          </div>
          <Input
            containerClassName="md:col-span-3"
            label="Длительность"
            name="days"
            type="number"
            min="1"
            value={days}
            onChange={(e) => handleDaysChange(Number(e.target.value))}
            required
          />
          <DropdownSelect
            containerClassName="md:col-span-3"
            label="Сложность"
            icon={Flame}
            value={formData.difficulty}
            onChange={(value) => handleFieldChange('difficulty', value)}
            options={[
              { value: 'easy', label: 'Легкий' },
              { value: 'medium', label: 'Средний' },
              { value: 'hard', label: 'Сложный' },
            ]}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Участники
          </label>
          <div className="max-h-40 overflow-y-auto p-3 border border-gray-300 dark:border-gray-600 rounded-xl space-y-2 bg-white dark:bg-gray-700">
            {participants.length > 0 ? (
              participants.map((p: Participant) => (
                <label
                  key={p.id}
                  className="flex items-center gap-3 p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={formData.participants.includes(p.id)}
                    onChange={() => handleParticipantToggle(p.id)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 bg-white dark:bg-gray-700"
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{p.name}</span>
                </label>
              ))
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                Сначала добавьте участников.
              </p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
          <Button type="button" variant="secondary" onClick={handleCancel}>
            <X className="w-4 h-4 mr-2" />
            Отмена
          </Button>
          <Button type="submit" variant="primary">
            <Save className="w-4 h-4 mr-2" />
            {trip ? 'Сохранить изменения' : 'Создать поход'}
          </Button>
        </div>

        {isDirty && (
          <div className="flex items-center justify-center gap-2 text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
            <AlertCircle className="w-4 h-4" />У вас есть несохраненные изменения
          </div>
        )}
      </form>

      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={handleConfirmCancel}
        title="Несохраненные изменения"
        variant="danger"
        confirmText="Уйти"
        cancelText="Остаться"
      >
        <p>Вы уверены, что хотите уйти? Все несохраненные изменения будут потеряны.</p>
      </ConfirmModal>
    </>
  );
};

export default TripForm;
