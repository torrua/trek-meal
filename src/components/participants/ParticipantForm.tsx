// src/components/participants/ParticipantForm.tsx

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { User, Phone, Mail, Calendar, Save, AlertCircle, X, FileText } from 'lucide-react';
import type { Participant, ParticipantData } from '../../types';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import FormField from '../../ui/FormField';
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
    equipmentIds: [],
  });
  const [initialData, setInitialData] = useState<ParticipantData>(formData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);

  const isDirty = useMemo(
    () => JSON.stringify(formData) !== JSON.stringify(initialData),
    [formData, initialData]
  );

  useEffect(() => {
    const dataToSet = participant
      ? { ...participant }
      : ({
          name: '',
          gender: 'male',
          age: 'adult',
          experienceLevel: 'beginner',
          phone: '',
          email: '',
          birthDate: '',
          notes: '',
        } as ParticipantData);

    if ('id' in dataToSet) {
      const { id: _id, ...formDataWithoutId } = dataToSet as Participant;
      setFormData(formDataWithoutId);
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

  const handleSelectChange = useCallback((field: keyof ParticipantData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  }, []);

  const handleCancel = () => {
    if (isDirty) {
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
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 pb-3 border-b notion-border-subtle">
            <User className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground tracking-tight">
              Основная информация
            </h3>
          </div>

          <div className="space-y-6">
            <FormField label="Полное имя" error={errors.name} required>
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Введите полное имя"
                icon={User}
                disabled={isLoading}
                autoFocus
                className="text-base font-medium"
              />
            </FormField>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <DropdownSelect
                label="Пол"
                icon={User}
                value={formData.gender}
                onChange={(val) => typeof val === 'string' && handleSelectChange('gender', val)}
                options={[
                  { value: 'male', label: 'Мужской' },
                  { value: 'female', label: 'Женский' },
                ]}
                placeholder="Выберите пол"
                disabled={isLoading}
              />

              <DropdownSelect
                label="Возраст"
                icon={User}
                value={formData.age}
                onChange={(val) => typeof val === 'string' && handleSelectChange('age', val)}
                options={[
                  { value: 'adult', label: 'Взрослый' },
                  { value: 'child', label: 'Ребенок' },
                ]}
                placeholder="Выберите возраст"
                disabled={isLoading}
              />

              <DropdownSelect
                label="Опыт"
                icon={User}
                value={formData.experienceLevel}
                onChange={(val) =>
                  typeof val === 'string' && handleSelectChange('experienceLevel', val)
                }
                options={[
                  { value: 'beginner', label: 'Новичок' },
                  { value: 'experienced', label: 'Опытный' },
                  { value: 'professional', label: 'Профессионал' },
                ]}
                placeholder="Выберите уровень"
                disabled={isLoading}
              />
            </div>

            <FormField label="Дата рождения" error={errors.birthDate}>
              <Input
                name="birthDate"
                type="date"
                value={formData.birthDate}
                onChange={handleChange}
                icon={Calendar}
                disabled={isLoading}
              />
            </FormField>
          </div>
        </div>

        {/* Contact Information Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 pb-3 border-b notion-border-subtle">
            <Phone className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground tracking-tight">
              Контактная информация
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FormField label="Телефон" error={errors.phone}>
              <Input
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+7 (999) 123-45-67"
                icon={Phone}
                disabled={isLoading}
              />
            </FormField>

            <FormField label="Email" error={errors.email}>
              <Input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="example@email.com"
                icon={Mail}
                disabled={isLoading}
              />
            </FormField>
          </div>
        </div>

        {/* Additional Information Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 pb-3 border-b notion-border-subtle">
            <FileText className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground tracking-tight">
              Дополнительная информация
            </h3>
          </div>

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

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-6 border-t notion-border-subtle">
          <Button type="button" variant="ghost" onClick={handleCancel} disabled={isLoading}>
            <X className="w-4 h-4 mr-2" />
            Отмена
          </Button>
          <Button type="submit" disabled={!isFormValid || isLoading} loading={isLoading}>
            <Save className="w-4 h-4 mr-2" />
            {participant ? 'Сохранить изменения' : 'Добавить участника'}
          </Button>
        </div>

        {/* Unsaved Changes Warning */}
        {isDirty && !isLoading && (
          <div className="flex items-center justify-center gap-3 text-sm text-warning bg-warning/10 p-4 rounded-xl border border-warning/20">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span className="font-medium">У вас есть несохраненные изменения</span>
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
        Вы уверены, что хотите уйти? Все несохраненные изменения будут потеряны.
      </ConfirmModal>
    </div>
  );
};

export default ParticipantForm;
