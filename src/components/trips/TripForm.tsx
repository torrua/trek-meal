// src/components/trips/TripForm.tsx

import React, { useState, useEffect } from 'react';
import DatePicker, { registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ru } from 'date-fns/locale';
import { formatISO } from 'date-fns';

// Импортируем наш новый хук
import { useTripDates } from '../../hooks/useTripDates';

import useParticipantStore from '../../stores/useParticipantStore';
import Button from '../../ui/Button';
import type { Trip, TripData, Participant } from '../../types';

registerLocale('ru', ru);

// Компонент для кастомного инпута DatePicker'а (без изменений)
type DateInputProps = {
  value?: string;
  onClick?: () => void;
  className?: string;
  placeholder?: string;
};
const DateInput = React.forwardRef<HTMLInputElement, DateInputProps>(
  ({ value, onClick, className, placeholder }, ref) => (
    <input
      ref={ref}
      value={value}
      onClick={onClick}
      placeholder={placeholder}
      className={`${className} cursor-pointer`}
      readOnly
      aria-label={placeholder}
    />
  )
);
DateInput.displayName = 'DateInput';

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

  // --- ГЛАВНОЕ ИЗМЕНЕНИЕ: Используем наш кастомный хук ---
  const { dateRange, days, handleDateRangeChange, handleDaysChange } = useTripDates(trip);

  const [errors, setErrors] = useState<{ name?: string }>({});

  // Синхронизируем состояние формы с внешними и внутренними данными
  useEffect(() => {
    if (trip) {
      setFormData({ ...trip });
    } else {
      setFormData(INITIAL_STATE);
    }
  }, [trip]);

  // Общий обработчик для простых полей
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

    // Перед отправкой, синхронизируем данные из хука дат в итоговый объект
    const finalFormData: TripData = {
      ...formData,
      days,
      startDate: dateRange[0] ? formatISO(dateRange[0], { representation: 'date' }) : '',
      endDate: dateRange[1] ? formatISO(dateRange[1], { representation: 'date' }) : '',
    };

    onSubmit(finalFormData);
  };

  const inputClassName =
    'w-full h-10 px-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500';
  const labelClassName = 'block text-sm font-medium text-gray-700 mb-1';

  return (
    <div className="bg-white rounded-lg p-6 w-full">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <div>
            <label className={labelClassName}>Название похода *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              className={`${inputClassName} ${errors.name ? 'border-red-500' : ''}`}
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
              className={inputClassName}
            />
          </div>
        </div>

        <div>
          <label className={labelClassName}>Описание</label>
          <textarea
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={3}
            className={`${inputClassName} py-2 resize-vertical`}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
          <div className="md:col-span-6">
            <label className={labelClassName}>Даты похода</label>
            <DatePicker
              wrapperClassName="w-full"
              selectsRange
              startDate={dateRange[0]}
              endDate={dateRange[1]}
              locale="ru"
              customInput={<DateInput className={inputClassName} placeholder="Выберите период" />}
              monthsShown={2}
              dateFormat="dd.MM.yyyy"
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
              className={inputClassName}
            />
          </div>
          <div className="md:col-span-4">
            <label className={labelClassName}>Сложность</label>
            <select
              value={formData.difficulty}
              onChange={(e) => handleChange('difficulty', e.target.value)}
              className={inputClassName}
            >
              <option value="easy">Легкий</option>
              <option value="medium">Средний</option>
              <option value="hard">Сложный</option>
            </select>
          </div>
        </div>

        <div>
          <label className={labelClassName}>Участники</label>
          <div className="max-h-32 overflow-y-auto p-3 border rounded-md space-y-2 bg-gray-50">
            {participants.length > 0 ? (
              participants.map((p: Participant) => (
                <label
                  key={p.id}
                  className="flex items-center gap-3 p-2 rounded hover:bg-gray-100 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={formData.participants.includes(p.id)}
                    onChange={() => handleParticipantToggle(p.id)}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm">{p.name}</span>
                </label>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">Сначала добавьте участников.</p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200 mt-4">
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
