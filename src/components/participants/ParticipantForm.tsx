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
}) => {
  const [formData, setFormData] = useState<ParticipantData>(INITIAL_STATE);
  const [errors, setErrors] = useState<Partial<Record<keyof ParticipantData, string>>>({});

  useEffect(() => {
    if (participant) {
      // Убрано неиспользуемое присваивание _id
      const { id, ...data } = participant;
      setFormData({ ...INITIAL_STATE, ...data });
    } else {
      setFormData(INITIAL_STATE);
    }
    setErrors({});
  }, [participant]);

  const validateForm = (): boolean => {
    const newErrors: typeof errors = {};
    if (!formData.name.trim()) newErrors.name = 'Имя участника обязательно';
    else if (formData.name.trim().length < 2)
      newErrors.name = 'Имя должно содержать минимум 2 символа';
    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = 'Некорректный формат email';
    if (formData.phone && !/^[+]?[0-9\s\-()]{7,}$/.test(formData.phone.trim()))
      newErrors.phone = 'Некорректный формат телефона';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Имя участника *"
        name="name"
        value={formData.name}
        onChange={handleInputChange}
        error={errors.name}
        required
        autoFocus
        disabled={isLoading}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Пол</label>
          <ThemedSelect
            value={PARTICIPANT_CONSTANTS.GENDER_OPTIONS.find(
              (opt) => opt.value === formData.gender
            )}
            onChange={(opt) => handleSelectChange('gender', opt)}
            options={PARTICIPANT_CONSTANTS.GENDER_OPTIONS}
            isDisabled={isLoading}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Возраст</label>
          <ThemedSelect
            value={PARTICIPANT_CONSTANTS.AGE_OPTIONS.find((opt) => opt.value === formData.age)}
            onChange={(opt) => handleSelectChange('age', opt)}
            options={PARTICIPANT_CONSTANTS.AGE_OPTIONS}
            isDisabled={isLoading}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">Опыт</label>
          <ThemedSelect
            value={PARTICIPANT_CONSTANTS.EXPERIENCE_OPTIONS.find(
              (opt) => opt.value === formData.experienceLevel
            )}
            onChange={(opt) => handleSelectChange('experienceLevel', opt)}
            options={PARTICIPANT_CONSTANTS.EXPERIENCE_OPTIONS}
            isDisabled={isLoading}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Телефон"
          name="phone"
          value={formData.phone || ''}
          onChange={handleInputChange}
          error={errors.phone}
          disabled={isLoading}
        />
        <Input
          label="Email"
          name="email"
          type="email"
          value={formData.email || ''}
          onChange={handleInputChange}
          error={errors.email}
          disabled={isLoading}
        />
      </div>

      <Input
        label="Дата рождения"
        name="birthDate"
        type="date"
        value={formData.birthDate || ''}
        onChange={handleInputChange}
        disabled={isLoading}
      />
      <Textarea
        label="Заметки (аллергии, предпочтения)"
        name="notes"
        value={formData.notes}
        onChange={handleInputChange}
        disabled={isLoading}
        rows={3}
      />

      <div className="flex justify-end gap-3 pt-4 border-t">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={isLoading}>
          Отмена
        </Button>
        <Button type="submit" variant="primary" disabled={isLoading}>
          {participant ? 'Сохранить' : 'Добавить'}
        </Button>
      </div>
    </form>
  );
};

export default ParticipantForm;
