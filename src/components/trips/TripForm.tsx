// src/components/trips/TripForm.tsx

import React, { useState, useEffect } from 'react';
import 'react-datepicker/dist/react-datepicker.css';
import { formatISO } from 'date-fns';

import { useTripDates } from '../../hooks/useTripDates';
import useParticipantStore from '../../stores/useParticipantStore';
import Button from '../../ui/Button';
import ThemedDatePicker from '../../ui/ThemedDatePicker';
import Input from '../../ui/Input';
import Select from '../../ui/Select';
import Textarea from '../../ui/Textarea';
import type { Trip, TripData, Participant } from '../../types';

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
  const [formData, setFormData] = useState<TripData>({
    ...INITIAL_STATE,
    participants: initialParticipantIds,
  });
  const { dateRange, days, handleDateRangeChange, handleDaysChange } = useTripDates(trip);
  const [errors, setErrors] = useState<{ name?: string }>({});

  useEffect(() => {
    if (trip) {
      const { id: _id, createdAt: _ca, status: _st, selectedMeals: _sm, ...rest } = trip;
      setFormData({ ...INITIAL_STATE, ...rest });
    } else {
      setFormData({ ...INITIAL_STATE, participants: initialParticipantIds });
    }
  }, [trip, initialParticipantIds]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name === 'name' && String(value).trim().length > 0) {
      setErrors((prev) => ({ ...prev, name: undefined }));
    }
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleParticipantToggle = (id: number) => {
    setFormData((prev) => ({
      ...prev,
      participants: prev.participants.includes(id)
        ? prev.participants.filter((pId) => pId !== id)
        : [...prev.participants, id],
    }));
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
    <form onSubmit={handleSubmit} className="p-1 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Название похода *"
          name="name"
          type="text"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
          autoFocus
          required
        />
        <Input
          label="Место (регион)"
          name="destination"
          type="text"
          value={formData.destination}
          onChange={handleChange}
          placeholder="Например, Кавказ"
        />
      </div>

      <Textarea
        label="Описание"
        name="description"
        value={formData.description}
        onChange={handleChange}
        rows={3}
      />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
        <div className="md:col-span-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Даты похода
          </label>
          <ThemedDatePicker
            wrapperClassName="w-full"
            selectsRange
            startDate={dateRange[0]}
            endDate={dateRange[1]}
            monthsShown={2}
            onChange={handleDateRangeChange}
            isClearable={true}
          />
        </div>
        <Input
          containerClassName="md:col-span-2"
          label="Дней"
          name="days"
          type="number"
          min="1"
          value={days}
          onChange={(e) => handleDaysChange(Number(e.target.value))}
          required
        />
        <Select
          containerClassName="md:col-span-4"
          label="Сложность"
          name="difficulty"
          value={formData.difficulty}
          onChange={handleChange}
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
        <Button type="button" variant="secondary" onClick={onCancel}>
          Отмена
        </Button>
        <Button type="submit" variant="primary">
          {trip ? 'Сохранить изменения' : 'Создать поход'}
        </Button>
      </div>
    </form>
  );
};

export default TripForm;
