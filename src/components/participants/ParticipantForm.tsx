// src/components/participants/ParticipantForm.tsx

import React, { useState, useEffect } from 'react';
import { Baby, User, Award } from 'lucide-react';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import Textarea from '../../ui/Textarea';
import { PARTICIPANT_CONSTANTS } from '../../constants/participants';
import type { Participant, ParticipantData } from '../../types';

interface ParticipantFormProps {
  participant: Participant | null;
  onSubmit: (data: ParticipantData) => Promise<void> | void;
  onCancel: () => void;
  isLoading?: boolean;
}

const INITIAL_STATE: ParticipantData = {
  name: '',
  gender: 'male',
  age: 'adult',
  notes: '',
  experienceLevel: 'beginner',
  phone: '',
  email: '',
  birthDate: '',
};

const EXPERIENCE_OPTIONS = [
  { value: 'beginner' as const, label: 'Новичок' },
  { value: 'experienced' as const, label: 'Опытный' },
  { value: 'professional' as const, label: 'Профессионал' },
];

const ParticipantForm: React.FC<ParticipantFormProps> = ({
  participant,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<ParticipantData>(INITIAL_STATE);
  const [errors, setErrors] = useState<Partial<Record<keyof ParticipantData, string>>>({});

  useEffect(() => {
    if (participant) {
      const { id, ...data } = participant;
      setFormData({ ...INITIAL_STATE, ...data });
    } else {
      setFormData(INITIAL_STATE);
    }
    setErrors({});
  }, [participant]);

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Имя участника обязательно';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Имя должно содержать минимум 2 символа';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Некорректный формат email';
    }

    if (
      formData.phone &&
      formData.phone.trim() &&
      !/^[+]?[0-9\s\-()]{7,}$/.test(formData.phone.trim())
    ) {
      newErrors.phone = 'Некорректный формат телефона';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Очищаем ошибку при изменении поля
    if (errors[name as keyof ParticipantData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Ошибка при сохранении участника:', error);
      // Здесь можно добавить toast уведомление
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Имя участника *"
        name="name"
        value={formData.name}
        onChange={handleChange}
        error={errors.name}
        required
        autoFocus
        disabled={isLoading}
        placeholder="Введите имя участника"
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label htmlFor="gender" className="block text-sm font-medium text-foreground mb-1.5">
            Пол
          </label>
          <select
            id="gender"
            name="gender"
            value={formData.gender}
            onChange={handleChange}
            disabled={isLoading}
            className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {PARTICIPANT_CONSTANTS.GENDER_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="age" className="block text-sm font-medium text-foreground mb-1.5">
            Возраст
          </label>
          <select
            id="age"
            name="age"
            value={formData.age}
            onChange={handleChange}
            disabled={isLoading}
            className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {PARTICIPANT_CONSTANTS.AGE_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="experienceLevel"
            className="block text-sm font-medium text-foreground mb-1.5"
          >
            Опыт
          </label>
          <select
            id="experienceLevel"
            name="experienceLevel"
            value={formData.experienceLevel}
            onChange={handleChange}
            disabled={isLoading}
            className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {EXPERIENCE_OPTIONS.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Телефон"
          name="phone"
          value={formData.phone || ''}
          onChange={handleChange}
          error={errors.phone}
          disabled={isLoading}
          placeholder="+7 (999) 123-45-67"
        />

        <Input
          label="Email"
          name="email"
          type="email"
          value={formData.email || ''}
          onChange={handleChange}
          error={errors.email}
          disabled={isLoading}
          placeholder="example@mail.com"
        />
      </div>

      <Input
        label="Дата рождения"
        name="birthDate"
        type="date"
        value={formData.birthDate || ''}
        onChange={handleChange}
        disabled={isLoading}
      />

      <Textarea
        label="Заметки (аллергии, предпочтения)"
        name="notes"
        value={formData.notes}
        onChange={handleChange}
        disabled={isLoading}
        rows={3}
        placeholder="Дополнительная информация об участнике..."
      />

      <div className="flex justify-end gap-3 pt-4 border-t border-border">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={isLoading}>
          Отмена
        </Button>
        <Button type="submit" variant="primary" disabled={isLoading} loading={isLoading}>
          {participant ? 'Сохранить' : 'Добавить'}
        </Button>
      </div>
    </form>
  );
};

export default ParticipantForm;
