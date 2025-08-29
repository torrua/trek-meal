// src/components/participants/ParticipantForm.tsx

import React, { useState, useEffect } from 'react';
import { SingleValue } from 'react-select';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import Textarea from '../../ui/Textarea';
import ThemedSelect from '../../ui/ThemedSelect';
import { PARTICIPANT_CONSTANTS } from '../../constants/participants';
import type { Participant, ParticipantData } from '../../types';

interface ParticipantFormProps {
  participant: Participant | null;
  onSubmit: (data: ParticipantData) => Promise<void> | void;
  onCancel: () => void;
  isLoading?: boolean;
  onDirtyChange?: (isDirty: boolean) => void;
}

type SelectOption<T> = { value: T; label: string };

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
  onDirtyChange,
}) => {
  const [formData, setFormData] = useState<ParticipantData>(INITIAL_STATE);
  const [errors, setErrors] = useState<Partial<Record<keyof ParticipantData, string>>>({});
  const [initialData, setInitialData] = useState<ParticipantData>(INITIAL_STATE);

  useEffect(() => {
    let data: ParticipantData;
    if (participant) {
      const { id, ...participantData } = participant;
      data = { ...INITIAL_STATE, ...participantData };
    } else {
      data = INITIAL_STATE;
    }
    setFormData(data);
    setInitialData(data);
    setErrors({});
    onDirtyChange?.(false);
  }, [participant, onDirtyChange]);

  useEffect(() => {
    const isDirty = JSON.stringify(formData) !== JSON.stringify(initialData);
    onDirtyChange?.(isDirty);
  }, [formData, initialData, onDirtyChange]);

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
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Некорректный формат email';
    }

    // Валидация телефона
    if (
      formData.phone &&
      formData.phone.trim() &&
      !/^[+]?[0-9\s\-()]{7,}$/.test(formData.phone.trim())
    ) {
      newErrors.phone = 'Некорректный формат телефона';
    }

    // Валидация даты рождения
    if (formData.birthDate) {
      const birthDate = new Date(formData.birthDate);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();

      if (birthDate > today) {
        newErrors.birthDate = 'Дата рождения не может быть в будущем';
      } else if (age > 120) {
        newErrors.birthDate = 'Проверьте корректность даты рождения';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Очистка ошибки при изменении поля
    if (errors[name as keyof ParticipantData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSelectChange = <T extends string>(
    name: keyof ParticipantData,
    option: SingleValue<SelectOption<T>>
  ) => {
    if (option) {
      setFormData((prev) => ({ ...prev, [name]: option.value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Ошибка при сохранении формы участника:', error);
    }
  };

  const handleCancel = () => {
    // Проверка на несохраненные изменения
    const isDirty = JSON.stringify(formData) !== JSON.stringify(initialData);
    if (isDirty) {
      const confirmCancel = window.confirm(
        'У вас есть несохраненные изменения. Отменить редактирование?'
      );
      if (!confirmCancel) return;
    }
    onCancel();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Основная информация */}
      <div className="space-y-4">
        <div>
          <Input
            label="Имя участника *"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            error={errors.name}
            required
            autoFocus
            disabled={isLoading}
            placeholder="Введите полное имя"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">Пол *</label>
            <ThemedSelect
              value={PARTICIPANT_CONSTANTS.GENDER_OPTIONS.find(
                (opt) => opt.value === formData.gender
              )}
              onChange={(opt) => handleSelectChange('gender', opt)}
              options={PARTICIPANT_CONSTANTS.GENDER_OPTIONS}
              isDisabled={isLoading}
              placeholder="Выберите пол"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Возрастная группа *
            </label>
            <ThemedSelect
              value={PARTICIPANT_CONSTANTS.AGE_OPTIONS.find((opt) => opt.value === formData.age)}
              onChange={(opt) => handleSelectChange('age', opt)}
              options={PARTICIPANT_CONSTANTS.AGE_OPTIONS}
              isDisabled={isLoading}
              placeholder="Выберите группу"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Уровень опыта *
            </label>
            <ThemedSelect
              value={PARTICIPANT_CONSTANTS.EXPERIENCE_OPTIONS.find(
                (opt) => opt.value === formData.experienceLevel
              )}
              onChange={(opt) => handleSelectChange('experienceLevel', opt)}
              options={PARTICIPANT_CONSTANTS.EXPERIENCE_OPTIONS}
              isDisabled={isLoading}
              placeholder="Выберите уровень"
            />
          </div>
        </div>
      </div>

      {/* Контактная информация */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground border-b pb-2">
          Контактная информация
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Телефон"
            name="phone"
            value={formData.phone || ''}
            onChange={handleInputChange}
            error={errors.phone}
            disabled={isLoading}
            placeholder="+7 (999) 123-45-67"
          />

          <Input
            label="Email"
            name="email"
            type="email"
            value={formData.email || ''}
            onChange={handleInputChange}
            error={errors.email}
            disabled={isLoading}
            placeholder="example@email.com"
          />
        </div>

        <Input
          label="Дата рождения"
          name="birthDate"
          type="date"
          value={formData.birthDate || ''}
          onChange={handleInputChange}
          error={errors.birthDate}
          disabled={isLoading}
          max={new Date().toISOString().split('T')[0]}
        />
      </div>

      {/* Дополнительная информация */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground border-b pb-2">
          Дополнительная информация
        </h3>

        <Textarea
          label="Заметки"
          name="notes"
          value={formData.notes}
          onChange={handleInputChange}
          disabled={isLoading}
          rows={4}
          placeholder="Аллергии, медицинские особенности, предпочтения..."
          maxLength={500}
        />

        {formData.notes && (
          <div className="text-xs text-muted-foreground text-right">
            {formData.notes.length}/500 символов
          </div>
        )}
      </div>

      {/* Кнопки управления */}
      <div className="flex justify-end gap-3 pt-6 border-t">
        <Button type="button" variant="ghost" onClick={handleCancel} disabled={isLoading}>
          Отмена
        </Button>

        <Button type="submit" variant="primary" disabled={isLoading} className="min-w-[100px]">
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Сохранение...
            </div>
          ) : participant?.id ? (
            'Сохранить'
          ) : (
            'Добавить'
          )}
        </Button>
      </div>
    </form>
  );
};

export default ParticipantForm;
