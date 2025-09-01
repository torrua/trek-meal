// src/components/participants/ParticipantForm.tsx

import React, { useState, useEffect } from 'react';
import { User, Phone, Mail, Calendar, Save, AlertCircle, Baby } from 'lucide-react';
import cn from 'classnames';
import type { Participant, ParticipantData } from '../../types';
import Button from '../../ui/Button';

interface InputProps {
  label: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  name: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  icon?: React.ComponentType<{ className?: string }>;
}

const Input: React.FC<InputProps> = ({
  label,
  type = 'text',
  value,
  onChange,
  name,
  placeholder,
  required,
  error,
  icon: Icon,
}) => (
  <div className="space-y-1.5">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <div className="relative">
      {Icon && <Icon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />}
      <input
        type={type}
        name={name}
        value={value || ''}
        onChange={onChange}
        placeholder={placeholder}
        className={cn(
          'w-full px-4 py-3 bg-white dark:bg-gray-700 border rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all',
          Icon ? 'pl-11' : '',
          error
            ? 'border-red-300 dark:border-red-600 focus:ring-red-500 focus:border-red-500'
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
        )}
      />
    </div>
    {error && (
      <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
        <AlertCircle className="w-4 h-4" />
        {error}
      </p>
    )}
  </div>
);

interface SelectProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  name: string;
  options: Array<{ value: string; label: string }>;
  required?: boolean;
  error?: string;
}

const Select: React.FC<SelectProps> = ({
  label,
  value,
  onChange,
  name,
  options,
  required,
  error,
}) => (
  <div className="space-y-1.5">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
      {label}
      {required && <span className="text-red-500 ml-1">*</span>}
    </label>
    <select
      name={name}
      value={value}
      onChange={onChange}
      className={cn(
        'w-full px-4 py-3 bg-white dark:bg-gray-700 border rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all appearance-none cursor-pointer',
        error
          ? 'border-red-300 dark:border-red-600 focus:ring-red-500 focus:border-red-500'
          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
      )}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
    {error && (
      <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
        <AlertCircle className="w-4 h-4" />
        {error}
      </p>
    )}
  </div>
);

interface TextareaProps {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  name: string;
  placeholder?: string;
  rows?: number;
  error?: string;
}

const Textarea: React.FC<TextareaProps> = ({
  label,
  value,
  onChange,
  name,
  placeholder,
  rows = 4,
  error,
}) => (
  <div className="space-y-1.5">
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
    <textarea
      name={name}
      value={value || ''}
      onChange={onChange}
      placeholder={placeholder}
      rows={rows}
      className={cn(
        'w-full px-4 py-3 bg-white dark:bg-gray-700 border rounded-xl shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none',
        error
          ? 'border-red-300 dark:border-red-600 focus:ring-red-500 focus:border-red-500'
          : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
      )}
    />
    {error && (
      <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-1">
        <AlertCircle className="w-4 h-4" />
        {error}
      </p>
    )}
  </div>
);

interface ParticipantFormProps {
  participant: Participant | null;
  onSubmit: (data: ParticipantData) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const ParticipantForm: React.FC<ParticipantFormProps> = ({
  participant,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState<ParticipantData>({
    name: '',
    gender: 'male',
    age: 'adult',
    experienceLevel: 'beginner',
    phone: '',
    email: '',
    birthDate: '',
    notes: '',
  });
  const [initialData, setInitialData] = useState<ParticipantData>(formData);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const dataToSet: ParticipantData = participant
      ? {
          name: participant.name,
          gender: participant.gender,
          age: participant.age,
          experienceLevel: participant.experienceLevel,
          phone: participant.phone || '',
          email: participant.email || '',
          birthDate: participant.birthDate || '',
          notes: participant.notes || '',
        }
      : {
          name: '',
          gender: 'male',
          age: 'adult',
          experienceLevel: 'beginner',
          phone: '',
          email: '',
          birthDate: '',
          notes: '',
        };

    setFormData(dataToSet);
    setInitialData(dataToSet);
    setErrors({});
  }, [participant]);

  const isDirty = JSON.stringify(formData) !== JSON.stringify(initialData);

  const validate = () => {
    const newErrors: Record<string, string> = {};

    // Имя обязательно
    if (!formData.name.trim()) {
      newErrors.name = 'Имя обязательно';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Имя должно содержать минимум 2 символа';
    }

    // Валидация email
    if (formData.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        newErrors.email = 'Некорректный формат email';
      }
    }

    // Валидация телефона
    if (formData.phone) {
      const phoneRegex = /^[+]?[\d\s()-]{10,}$/;
      if (!phoneRegex.test(formData.phone.replace(/\s/g, ''))) {
        newErrors.phone = 'Некорректный формат телефона';
      }
    }

    // Валидация даты рождения
    if (formData.birthDate) {
      const birthDate = new Date(formData.birthDate);
      const today = new Date();
      if (birthDate > today) {
        newErrors.birthDate = 'Дата рождения не может быть в будущем';
      }
      if (birthDate.getFullYear() < 1900) {
        newErrors.birthDate = 'Некорректная дата рождения';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Очистить ошибку при изменении поля
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleCancel = () => {
    if (isDirty) {
      if (window.confirm('У вас есть несохраненные изменения. Вы уверены, что хотите уйти?')) {
        onCancel();
      }
    } else {
      onCancel();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate() && !isLoading) {
      onSubmit(formData);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Имя - на всю ширину */}
        <div className="md:col-span-2">
          <Input
            label="Полное имя"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={errors.name}
            required
            placeholder="Введите имя"
            icon={User}
          />
        </div>

        {/* Пол и возраст */}
        <Select
          label="Пол"
          name="gender"
          value={formData.gender}
          onChange={handleChange}
          options={[
            { value: 'male', label: 'Мужской' },
            { value: 'female', label: 'Женский' },
          ]}
          required
          error={errors.gender}
        />
        <Select
          label="Возрастная группа"
          name="age"
          value={formData.age}
          onChange={handleChange}
          options={[
            { value: 'adult', label: 'Взрослый' },
            { value: 'child', label: 'Ребенок' },
          ]}
          required
          error={errors.age}
        />

        {/* Дата рождения и опыт */}
        <Input
          label="Дата рождения"
          name="birthDate"
          type="date"
          value={formData.birthDate}
          onChange={handleChange}
          error={errors.birthDate}
          icon={Calendar}
        />
        <Select
          label="Уровень опыта"
          name="experienceLevel"
          value={formData.experienceLevel}
          onChange={handleChange}
          options={[
            { value: 'beginner', label: 'Новичок' },
            { value: 'experienced', label: 'Опытный' },
            { value: 'professional', label: 'Профессионал' },
          ]}
          required
          error={errors.experienceLevel}
        />

        {/* Контактная информация */}
        <Input
          label="Телефон"
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handleChange}
          error={errors.phone}
          placeholder="+7 (999) 123-45-67"
          icon={Phone}
        />
        <Input
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          placeholder="example@email.com"
          icon={Mail}
        />
      </div>

      {/* Заметки */}
      <Textarea
        label="Заметки"
        name="notes"
        value={formData.notes}
        onChange={handleChange}
        error={errors.notes}
        placeholder="Аллергии, медицинские особенности, предпочтения в питании..."
        rows={3}
      />

      {/* Кнопки */}
      <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
        <Button type="button" variant="secondary" onClick={handleCancel} disabled={isLoading}>
          Отмена
        </Button>
        <Button
          type="submit"
          disabled={isLoading || !formData.name.trim()}
          className="flex items-center gap-2"
        >
          <Save className="w-4 h-4" />
          {isLoading ? 'Сохранение...' : participant ? 'Сохранить' : 'Добавить'}
        </Button>
      </div>

      {/* Индикатор несохраненных изменений */}
      {isDirty && (
        <div className="flex items-center justify-center gap-2 text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 rounded-lg p-3 border border-amber-200 dark:border-amber-800">
          <AlertCircle className="w-4 h-4" />У вас есть несохраненные изменения
        </div>
      )}
    </form>
  );
};

export default ParticipantForm;
