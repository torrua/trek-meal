// src/components/trips/TripForm.tsx

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import 'react-datepicker/dist/react-datepicker.css';
import { formatISO, parseISO } from 'date-fns';
import { AlertCircle, X, Save } from 'lucide-react';
import { useTripDates } from '../../hooks/useTripDates';
import Button from '../../ui/Button';
import ThemedDatePicker from '../../ui/ThemedDatePicker';
import Input from '../../ui/Input';
import ThemedSelect from '../../ui/ThemedSelect';
import Textarea from '../../ui/Textarea';
import type { Trip, TripData } from '../../types';
import ConfirmModal from '../../ui/ConfirmModal';

interface TripFormProps {
  onSubmit: (formData: TripData) => void;
  onCancel: () => void;
  trip?: Trip | null;
}

const INITIAL_STATE: Omit<TripData, 'participants'> = {
  name: '',
  description: '',
  destination: '',
  difficulty: 'easy',
  days: 1,
  mealsPerDay: 3,
  startDate: '',
  endDate: '',
};

const TripForm: React.FC<TripFormProps> = ({ onSubmit, onCancel, trip = null }) => {
  const [formData, setFormData] = useState<TripData>({ ...INITIAL_STATE, participants: [] });
  const [initialData, setInitialData] = useState<TripData>({ ...INITIAL_STATE, participants: [] });
  const { dateRange, days, handleDateRangeChange, handleDaysChange } = useTripDates(
    trip || { ...INITIAL_STATE, participants: [], days: 1 }
  );
  const [errors, setErrors] = useState<{ name?: string }>({});
  const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);

  const isDirty = useMemo(() => {
    if (!initialData) return false;

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
      dataToSet = { ...INITIAL_STATE, participants: [], days: 1 };
    }
    setFormData(dataToSet);
    setInitialData(dataToSet);
  }, [trip]);

  const handleFieldChange = useCallback((field: keyof TripData, value: string | number) => {
    if (field === 'name' && String(value).trim().length > 0) {
      setErrors((prev) => ({ ...prev, name: undefined }));
    }
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

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

  const difficultyOptions = [
    { value: 'easy', label: 'Легкий' },
    { value: 'medium', label: 'Средний' },
    { value: 'hard', label: 'Сложный' },
  ];

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

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Даты похода
          </label>
          <ThemedDatePicker
            selectsRange
            startDate={dateRange[0]}
            endDate={dateRange[1]}
            onChange={handleDateRangeChange}
            isClearable={true}
            monthsShown={1}
            wrapperClassName="w-full"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Длительность"
            name="days"
            type="number"
            min="1"
            value={days}
            onChange={(e) => handleDaysChange(Number(e.target.value))}
            required
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
              Сложность
            </label>
            <ThemedSelect
              value={difficultyOptions.find((opt) => opt.value === formData.difficulty)}
              onChange={(option) => option && handleFieldChange('difficulty', option.value)}
              options={difficultyOptions}
              menuPortalTarget={document.body}
            />
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
