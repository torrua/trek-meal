// src/components/trips/TripForm.tsx

import React, { useState, useEffect } from 'react';
import DatePicker, { registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { ru } from 'date-fns/locale';
import { addDays, format } from 'date-fns';

registerLocale('ru', ru);

// Tailwind-friendly input wrapper for react-datepicker
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
      className={`${className} bg-white border border-gray-300 rounded-md px-3 py-2 cursor-pointer`}
      readOnly
      aria-label={placeholder}
    />
  )
);
DateInput.displayName = 'DateInput';
import useParticipantStore from '../../stores/useParticipantStore';
import { handleDateChange } from '../../stores/useTripStore';
import Button from '../../ui/Button';
import type { Trip, TripData, Participant } from '../../types';

// Определяем пропсы компонента
interface TripFormProps {
  onSubmit: (formData: TripData) => void;
  onCancel: () => void;
  trip?: Trip | null; // Поход может быть передан для редактирования
}

// Начальное состояние формы соответствует типу TripData
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
  // Состояние формы строго типизировано
  const [formData, setFormData] = useState<TripData>(INITIAL_STATE);
  const [dateRange, setDateRange] = useState<[Date | null, Date | null]>([
    formData.startDate ? new Date(formData.startDate) : null,
    formData.endDate ? new Date(formData.endDate) : null,
  ]);
  const [errors, setErrors] = useState<{ name?: string; dateRange?: string }>({});

  useEffect(() => {
    if (trip) {
      // При редактировании заполняем форму данными из trip
      const tripData: TripData = {
        name: trip.name,
        description: trip.description,
        destination: trip.destination,
        difficulty: trip.difficulty,
        days: trip.days,
        mealsPerDay: trip.mealsPerDay,
        participants: trip.participants,
        startDate: trip.startDate,
        endDate: trip.endDate,
      };
      setFormData(tripData);
    } else {
      setFormData(INITIAL_STATE);
    }
  }, [trip]);

  const handleChange = (field: keyof TripData, value: string | number) => {
    // Очистка ошибки при вводе названия
    if (field === 'name' && typeof value === 'string' && value.trim().length > 0) {
      setErrors((prev) => ({ ...prev, name: undefined }));
    }
    setFormData((prev) => handleDateChange(prev, field, value));
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
    const nextErrors: { name?: string; dateRange?: string } = {};
    if (!formData.name || formData.name.trim().length === 0) {
      nextErrors.name = 'Пожалуйста, укажите название похода.';
    }
    // Валидация периода: если оба пусты — допустимо (используется только days),
    // если указан только один конец — это ошибка, если оба — стандартная валидация.
    const [start, end] = dateRange;
    if (start && end) {
      if (end.getTime() < start.getTime()) {
        nextErrors.dateRange = 'Дата окончания не может быть раньше даты начала.';
      } else {
        const daysCount = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        const MAX_DAYS = 30; // ограничение длительности похода
        if (daysCount > MAX_DAYS) {
          nextErrors.dateRange = `Максимальная длительность — ${MAX_DAYS} дней.`;
        } else {
          // синхронизируем поле days
          handleChange('days', daysCount);
        }
      }
    } else if (start || end) {
      // если указан только один конец диапазона — ошибка
      nextErrors.dateRange = 'Укажите обе даты начала и окончания или оставьте период пустым.';
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    onSubmit(formData);
  };

  const inputClassName =
    'w-full h-10 px-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500';
  const labelClassName = 'block text-sm font-medium text-gray-700 mb-1';
  return (
    <div className="bg-white rounded-lg shadow-md p-6 w-full">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
          <div>
            <label className={labelClassName}>Название похода *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              required
              className={`${inputClassName} ${errors.name ? 'border-red-500 ring-red-100' : ''}`}
              aria-invalid={errors.name ? 'true' : 'false'}
              aria-describedby={errors.name ? 'trip-name-error' : undefined}
            />
            <div className="mt-1 min-h-[1.5rem]">
              {errors.name && (
                <p id="trip-name-error" className="text-sm text-red-600">
                  {errors.name}
                </p>
              )}
            </div>
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
            <div className="mt-1 min-h-[1.5rem]" />
          </div>
        </div>

        <div>
          <label className={labelClassName}>Описание</label>
          <textarea
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            rows={3}
            className={`${inputClassName} min-h-[96px] py-2 resize-vertical`}
          ></textarea>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
          <div className="md:col-span-6">
            <div>
              <label htmlFor="dateRange" className={labelClassName}>
                Даты похода
              </label>
              <DatePicker
                id="dateRange"
                wrapperClassName="w-full"
                selectsRange
                startDate={dateRange[0]}
                endDate={dateRange[1]}
                locale="ru"
                customInput={<DateInput className={inputClassName} placeholder="Выберите период" />}
                monthsShown={2}
                dateFormat="dd.MM.yyyy"
                onChange={(dates: [Date | null, Date | null]) => {
                  const [start, end] = dates;
                  setDateRange(dates);
                  // очистка ошибок диапазона при изменении
                  setErrors((prev) => ({ ...prev, dateRange: undefined }));

                  // Обновляем formData в формате YYYY-MM-DD и все связанные поля за один раз
                  if (start && end) {
                    const daysCount =
                      Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
                    setFormData((prev) => ({
                      ...prev,
                      startDate: start.toISOString().slice(0, 10),
                      endDate: end.toISOString().slice(0, 10),
                      days: daysCount,
                    }));
                  } else {
                    setFormData((prev) => ({
                      ...prev,
                      startDate: start ? start.toISOString().slice(0, 10) : '',
                      endDate: end ? end.toISOString().slice(0, 10) : '',
                    }));
                  }
                }}
                isClearable={true}
                className={inputClassName}
              />
              <div className="mt-1 min-h-[1.5rem]">
                {errors.dateRange && <p className="text-sm text-red-600">{errors.dateRange}</p>}
              </div>
            </div>
          </div>
          <div className="md:col-span-2">
            <label className={labelClassName}>Дней</label>
            <input
              type="number"
              min="1"
              value={formData.days}
              onChange={(e) => {
                const v = Math.max(1, Math.floor(Number(e.target.value) || 1));
                if (v === formData.days) return;

                // Обновляем количество дней
                setFormData((prev) => ({ ...prev, days: v }));

                // Если есть начальная дата, пересчитываем конечную
                const start = dateRange[0];
                if (start) {
                  const newEnd = addDays(start, v - 1);
                  setDateRange([start, newEnd]);
                  setFormData((prev) => ({
                    ...prev,
                    days: v,
                    endDate: format(newEnd, 'yyyy-MM-dd'),
                  }));
                }
              }}
              className={inputClassName}
            />
            <div className="mt-1 min-h-[1.5rem]" />
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
            <div className="mt-1 min-h-[1.5rem]" />
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
