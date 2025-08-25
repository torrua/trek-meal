// src/components/trips/TripForm.tsx

import React, { useState, useEffect } from 'react';
import 'react-datepicker/dist/react-datepicker.css';
import { formatISO } from 'date-fns';

import { useTripDates } from '../../hooks/useTripDates';
import useParticipantStore from '../../stores/useParticipantStore';
import Button from '../../ui/Button';
import ThemedDatePicker from '../../ui/ThemedDatePicker';
import type { Trip, TripData, Participant } from '../../types';

interface TripFormProps {
  onSubmit: (formData: TripData) => void;
  onCancel: () => void;
  trip?: Trip | null;
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

const TripForm: React.FC<TripFormProps> = ({ onSubmit, onCancel, trip = null }) => {
  const { participants } = useParticipantStore();
  const [formData, setFormData] = useState<TripData>(INITIAL_STATE);

  const { dateRange, days, handleDateRangeChange, handleDaysChange } = useTripDates(trip);

  const [errors, setErrors] = useState<{ name?: string }>({});

  useEffect(() => {
    if (trip) {
      // --- ИСПРАВЛЕНИЕ: Убираем неиспользуемые переменные из деструктуризации ---
      const { ...rest } = trip;
      setFormData({ ...INITIAL_STATE, ...rest });
    } else {
      setFormData(INITIAL_STATE);
    }
  }, [trip]);

  const handleChange = (field: keyof TripData, value: string | number) => {
    if (field === 'name' && String(value).trim().length > 0) {
      setErrors((prev) => ({ ...prev, name: undefined }));
    }
    setFormData((prev) => ({ ...prev, [field]: value }));
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

  const labelClassName = 'block text-sm font-medium text-secondary mb-1';

  return (
    <div className="bg-secondary p-6 w-full">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <div>
            <label className={labelClassName}>Название похода *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className={`w-full h-10 px-3 ${errors.name ? 'border-red-500' : ''}`}
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>
          <div>
            <label className={labelClassName}>Место (регион)</label>
            <input
              type="text"
              value={formData.destination}
              onChange={(e) => handleChange('destination', e.target.value)}
              placeholder="Например, Кавказ"
              className="w-full h-10 px-3"
            />
          </div>
        </div>

        <div>
          <label className={labelClassName}>Описание</label>
          <textarea
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={3}
            className="w-full px-3 py-2 resize-vertical"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          <div className="md:col-span-6">
            <label className={labelClassName}>Даты похода</label>
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
          <div className="md:col-span-2">
            <label className={labelClassName}>Дней</label>
            <input
              type="number"
              min="1"
              value={days}
              onChange={(e) => handleDaysChange(Number(e.target.value))}
              className="w-full h-10 px-3"
            />
          </div>
          <div className="md:col-span-4">
            <label className={labelClassName}>Сложность</label>
            <select
              value={formData.difficulty}
              onChange={(e) => handleChange('difficulty', e.target.value)}
              className="w-full h-10 px-3"
            >
              <option value="easy">Легкий</option>
              <option value="medium">Средний</option>
              <option value="hard">Сложный</option>
            </select>
          </div>
        </div>

        <div>
          <label className={labelClassName}>Участники</label>
          <div className="max-h-32 overflow-y-auto p-3 border rounded-md space-y-2 bg-muted border-primary">
            {participants.length > 0 ? (
              participants.map((p: Participant) => (
                <label
                  key={p.id}
                  className="flex items-center gap-3 p-2 rounded hover:bg-primary cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={formData.participants.includes(p.id)}
                    onChange={() => handleParticipantToggle(p.id)}
                    className="h-4 w-4 rounded border-primary text-blue-600 focus:ring-blue-500 bg-secondary"
                  />
                  <span className="text-sm text-secondary">{p.name}</span>
                </label>
              ))
            ) : (
              <p className="text-sm text-muted text-center py-4">Сначала добавьте участников.</p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-primary mt-4">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Отмена
          </Button>
          <Button type="submit" variant="primary">
            {trip ? 'Сохранить изменения' : 'Создать поход'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default TripForm;
