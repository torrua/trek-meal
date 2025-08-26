// src/components/participants/ParticipantForm.tsx

import React, { useState, useEffect } from 'react';
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
      const { name, gender, age, notes, experienceLevel, phone, email, birthDate } = participant;
      setFormData({
        name,
        gender,
        age,
        notes,
        experienceLevel: experienceLevel || 'beginner',
        phone: phone || '',
        email: email || '',
        birthDate: birthDate || '',
      });
    } else {
      setFormData(INITIAL_STATE);
    }
    setErrors({});
  }, [participant]);

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};

    // Валидация имени
    if (!formData.name.trim()) {
      newErrors.name = 'Имя участника обязательно';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Имя должно содержать минимум 2 символа';
    } else if (formData.name.trim().length > 50) {
      newErrors.name = 'Имя не должно превышать 50 символов';
    }

    // Валидация email
    if (formData.email && formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email.trim())) {
        newErrors.email = 'Введите корректный email адрес';
      }
    }

    // Валидация телефона
    if (formData.phone && formData.phone.trim()) {
      const phoneRegex = /^[+]?[1-9][\d]{0,15}$/;
      const cleanPhone = formData.phone.replace(/[\s\-()]/g, '');
      if (!phoneRegex.test(cleanPhone)) {
        newErrors.phone = 'Введите корректный номер телефона';
      }
    }

    // Валидация даты рождения
    if (formData.birthDate) {
      const birthDate = new Date(formData.birthDate);
      const today = new Date();
      const minDate = new Date(today.getFullYear() - 100, today.getMonth(), today.getDate());

      if (isNaN(birthDate.getTime())) {
        newErrors.birthDate = 'Введите корректную дату';
      } else if (birthDate > today) {
        newErrors.birthDate = 'Дата рождения не может быть в будущем';
      } else if (birthDate < minDate) {
        newErrors.birthDate = 'Проверьте правильность даты рождения';
      }
    }

    // Валидация заметок
    if (formData.notes && formData.notes.length > 500) {
      newErrors.notes = 'Заметки не должны превышать 500 символов';
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
      await onSubmit({
        ...formData,
        name: formData.name.trim(),
        notes: formData.notes?.trim() || '',
        phone: formData.phone?.trim() || '',
        email: formData.email?.trim() || '',
      });
    } catch (error) {
      console.error('Ошибка при сохранении участника:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Основная информация */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
          Основная информация
        </h3>

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
          maxLength={50}
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
              Опыт походов
            </label>
            <select
              id="experienceLevel"
              name="experienceLevel"
              value={formData.experienceLevel}
              onChange={handleChange}
              disabled={isLoading}
              className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {PARTICIPANT_CONSTANTS.EXPERIENCE_OPTIONS.map(({ value, label }) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <Input
          label="Дата рождения"
          name="birthDate"
          type="date"
          value={formData.birthDate}
          onChange={handleChange}
          error={errors.birthDate}
          disabled={isLoading}
          max={new Date().toISOString().split('T')[0]}
        />
      </div>

      {/* Контактная информация */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
          Контактная информация
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Телефон"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            error={errors.phone}
            disabled={isLoading}
            placeholder="+7 (999) 123-45-67"
          />

          <Input
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            error={errors.email}
            disabled={isLoading}
            placeholder="example@email.com"
          />
        </div>
      </div>

      {/* Дополнительная информация */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground border-b border-border pb-2">
          Дополнительная информация
        </h3>

        <Textarea
          label="Заметки (аллергии, предпочтения, ограничения)"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          error={errors.notes}
          disabled={isLoading}
          rows={3}
          placeholder="Дополнительная информация об участнике..."
          maxLength={500}
        />
      </div>

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
