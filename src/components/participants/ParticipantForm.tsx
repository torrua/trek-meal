// src/components/participants/ParticipantForm.tsx

import React, { useState, useEffect } from 'react';
import { User, Phone, Mail, Calendar, Save, AlertCircle, X, Users, Award } from 'lucide-react';
import type { Participant, ParticipantData } from '../../types';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import DropdownSelect from '../../ui/DropdownSelect';
import Textarea from '../../ui/Textarea';
import ConfirmModal from '../../ui/ConfirmModal';

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
  const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);

  const isDirty = JSON.stringify(formData) !== JSON.stringify(initialData);

  useEffect(() => {
    const dataToSet = participant
      ? { ...participant }
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

    if ('id' in dataToSet) {
      const { id: _id, ...formDataWithoutId } = dataToSet as Participant;
      setFormData(formDataWithoutId);
      setInitialData(formDataWithoutId);
    } else {
      setFormData(dataToSet);
      setInitialData(dataToSet);
    }
    setErrors({});
  }, [participant]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Имя обязательно';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Имя должно содержать минимум 2 символа';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Некорректный формат email';
    }

    if (formData.phone && formData.phone.length < 10) {
      newErrors.phone = 'Телефон должен содержать минимум 10 цифр';
    }

    if (formData.birthDate) {
      const birthDate = new Date(formData.birthDate);
      const today = new Date();
      const maxAge = new Date();
      maxAge.setFullYear(today.getFullYear() - 120);

      if (birthDate > today) {
        newErrors.birthDate = 'Дата рождения не может быть в будущем';
      } else if (birthDate < maxAge) {
        newErrors.birthDate = 'Некорректная дата рождения';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSelectChange = (name: keyof ParticipantData, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value as ParticipantData[keyof ParticipantData] }));
  };

  const handleCancel = () => {
    if (isDirty && !isLoading) {
      setConfirmModalOpen(true);
    } else {
      onCancel();
    }
  };

  const handleConfirmCancel = () => {
    setConfirmModalOpen(false);
    onCancel();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate() && !isLoading) {
      onSubmit(formData);
    }
  };

  const isFormValid =
    formData.name.trim().length > 0 && Object.keys(errors).every((key) => !errors[key]);

  return (
    <div className="max-h-[80vh] overflow-y-auto">
      <form onSubmit={handleSubmit} className="p-1 space-y-6">
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Основная информация
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <Input
                  label="Полное имя"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  error={errors.name}
                  required
                  placeholder="Введите полное имя"
                  icon={User}
                  disabled={isLoading}
                  autoFocus
                />
              </div>

              <DropdownSelect
                label="Пол"
                icon={Users}
                value={formData.gender}
                onChange={(value) => handleSelectChange('gender', value)}
                options={[
                  { value: 'male', label: 'Мужской' },
                  { value: 'female', label: 'Женский' },
                ]}
                disabled={isLoading}
              />

              <DropdownSelect
                label="Возрастная группа"
                icon={Users}
                value={formData.age}
                onChange={(value) => handleSelectChange('age', value)}
                options={[
                  { value: 'adult', label: 'Взрослый' },
                  { value: 'child', label: 'Ребенок' },
                ]}
                disabled={isLoading}
              />

              <Input
                label="Дата рождения"
                name="birthDate"
                type="date"
                value={formData.birthDate}
                onChange={handleChange}
                error={errors.birthDate}
                icon={Calendar}
                disabled={isLoading}
              />

              <DropdownSelect
                label="Уровень опыта"
                icon={Award}
                value={formData.experienceLevel}
                onChange={(value) => handleSelectChange('experienceLevel', value)}
                options={[
                  { value: 'beginner', label: 'Новичок' },
                  { value: 'experienced', label: 'Опытный' },
                  { value: 'professional', label: 'Профессионал' },
                ]}
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Контактная информация
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Телефон"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                error={errors.phone}
                placeholder="+7 (999) 123-45-67"
                icon={Phone}
                disabled={isLoading}
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
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Дополнительная информация
            </h3>
            <Textarea
              label="Заметки"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              error={errors.notes}
              placeholder="Аллергии, медицинские особенности, предпочтения, особые требования..."
              rows={4}
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
          <Button
            type="button"
            variant="secondary"
            onClick={handleCancel}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Отмена
          </Button>
          <Button
            type="submit"
            disabled={!isFormValid || isLoading}
            className="flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {isLoading
              ? 'Сохранение...'
              : participant
                ? 'Сохранить изменения'
                : 'Добавить участника'}
          </Button>
        </div>

        {isDirty && !isLoading && (
          <div className="flex items-center justify-center gap-2 text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg border border-amber-200 dark:border-amber-800">
            <AlertCircle className="w-4 h-4" />У вас есть несохраненные изменения
          </div>
        )}
      </form>

      <ConfirmModal
        isOpen={isConfirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={handleConfirmCancel}
        title="Несохраненные изменения"
        variant="danger"
        confirmText="Уйти"
        cancelText="Остаться"
      >
        <p>Вы уверены, что хотите уйти? Все несохраненные изменения будут потеряны.</p>
      </ConfirmModal>
    </div>
  );
};

export default ParticipantForm;
