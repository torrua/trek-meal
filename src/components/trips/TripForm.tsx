// src/components/trips/TripForm.tsx

import React, { useState, useEffect } from 'react';
import 'react-datepicker/dist/react-datepicker.css';
import { formatISO } from 'date-fns';

import { useTripDates } from '../../hooks/useTripDates';
import useParticipantStore from '../../stores/useParticipantStore';
import Button from '../../ui/Button';
import ThemedDatePicker from '../../ui/ThemedDatePicker';
import Input from '../../ui/Input';
import Textarea from '../../ui/Textarea';
import type { Trip, TripData, Participant } from '../../types';

interface TripFormProps {
  onSubmit: (formData: TripData) => void;
  onCancel: () => void;
  trip?: Trip | null;
  initialParticipantIds?: number[]; // Новый проп
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
    participants: initialParticipantIds, // Используем initialParticipantIds
  });
  const { dateRange, days, handleDateRangeChange, handleDaysChange } = useTripDates(trip);
  const [errors, setErrors] = useState<{ name?: string }>({});

  useEffect(() => {
    if (trip) {
      const { ...rest } = trip;
      setFormData({ ...INITIAL_STATE, ...rest });
    } else {
      // Сбрасываем состояние, но сохраняем предустановленных участников
      setFormData({ ...INITIAL_STATE, participants: initialParticipantIds });
    }
  }, [trip, initialParticipantIds]);

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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Название похода *"
          type="text"
          value={formData.name}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            handleChange('name', e.target.value)
          }
          error={errors.name}
          autoFocus
        />
        <Input
          label="Место (регион)"
          type="text"
          value={formData.destination}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            handleChange('destination', e.target.value)
          }
          placeholder="Например, Кавказ"
        />
      </div>

      <Textarea
        label="Описание"
        value={formData.description}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
          handleChange('description', e.target.value)
        }
        rows={3}
      />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
        <div className="md:col-span-6">
          <label className="block text-sm font-medium text-foreground mb-1.5">Даты похода</label>
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
          type="number"
          min="1"
          value={days}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
            handleDaysChange(Number(e.target.value))
          }
        />
        <div className="md:col-span-4">
          <label className="block text-sm font-medium text-foreground mb-1.5">Сложность</label>
          <select
            value={formData.difficulty}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              handleChange('difficulty', e.target.value)
            }
          >
            <option value="easy">Легкий</option>
            <option value="medium">Средний</option>
            <option value="hard">Сложный</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-foreground mb-1.5">Участники</label>
        <div className="max-h-32 overflow-y-auto p-3 border border-input rounded-md space-y-2 bg-background">
          {participants.length > 0 ? (
            participants.map((p: Participant) => (
              <label
                key={p.id}
                className="flex items-center gap-3 p-2 rounded-md hover:bg-muted cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={formData.participants.includes(p.id)}
                  onChange={() => handleParticipantToggle(p.id)}
                  className="h-4 w-4 rounded border-input text-primary focus:ring-ring bg-background"
                />
                <span className="text-sm text-foreground">{p.name}</span>
              </label>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              Сначала добавьте участников.
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-border">
        <Button type="button" variant="ghost" onClick={onCancel}>
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
