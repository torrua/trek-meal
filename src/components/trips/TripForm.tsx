// src/components/trips/TripForm.tsx

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import 'react-datepicker/dist/react-datepicker.css';
import { formatISO, parseISO, isBefore, startOfDay } from 'date-fns';
import { AlertCircle, X, Save, Calendar, MapPin } from 'lucide-react';
import { useTripDates } from '../../hooks/useTripDates';
import Button from '../../ui/Button';
import ThemedDatePicker from '../../ui/ThemedDatePicker';
import Input from '../../ui/Input';
import ThemedSelect from '../../ui/ThemedSelect';
import Textarea from '../../ui/Textarea';
import type { Trip, TripData } from '../../types';
import ConfirmModal from '../../ui/ConfirmModal';

interface TripFormProps {
  onSubmit: (formData: TripData) => void;
  onCancel: () => void;
  trip?: Trip | null;
}

interface FormErrors {
  name?: string;
  destination?: string;
  days?: string;
  startDate?: string;
  endDate?: string;
  mealsPerDay?: string;
}

const INITIAL_STATE: Omit<TripData, 'participants'> = {
  name: '',
  description: '',
  destination: '',
  difficulty: 'easy',
  days: 1,
  mealsPerDay: 3,
  startDate: '',
  endDate: '',
};

const TripForm: React.FC<TripFormProps> = ({ onSubmit, onCancel, trip = null }) => {
  const [formData, setFormData] = useState<TripData>({ ...INITIAL_STATE, participants: [] });
  const [initialData, setInitialData] = useState<TripData>({ ...INITIAL_STATE, participants: [] });
  const { dateRange, days, handleDateRangeChange, handleDaysChange } = useTripDates(
    trip || { ...INITIAL_STATE, participants: [], days: 1 }
  );
  const [errors, setErrors] = useState<FormErrors>({});
  const [isConfirmModalOpen, setConfirmModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isDirty = useMemo(() => {
    if (!initialData) return false;

    const initialStartDate = initialData.startDate
      ? formatISO(parseISO(initialData.startDate), { representation: 'date' })
      : '';
    const currentStartDate = dateRange[0]
      ? formatISO(dateRange[0], { representation: 'date' })
      : '';

    if (JSON.stringify(formData) !== JSON.stringify(initialData)) return true;
    if (days !== initialData.days) return true;
    if (initialStartDate !== currentStartDate) return true;

    return false;
  }, [formData, initialData, days, dateRange]);

  useEffect(() => {
    let dataToSet: TripData;
    if (trip) {
      const { id: _id, createdAt: _ca, status: _st, selectedMeals: _sm, ...rest } = trip;
      dataToSet = { ...INITIAL_STATE, ...rest };
    } else {
      dataToSet = { ...INITIAL_STATE, participants: [], days: 1 };
    }
    setFormData(dataToSet);
    setInitialData(dataToSet);
    setErrors({});
  }, [trip]);

  const validateForm = useCallback((): FormErrors => {
    const newErrors: FormErrors = {};

    // Validation logic remains the same
    if (!formData.name.trim()) {
      newErrors.name = 'Пожалуйста, укажите название похода';
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Название должно содержать минимум 2 символа';
    } else if (formData.name.trim().length > 100) {
      newErrors.name = 'Название не должно превышать 100 символов';
    }

    if (formData.destination && formData.destination.length > 50) {
      newErrors.destination = 'Название места не должно превышать 50 символов';
    }

    if (days < 1) {
      newErrors.days = 'Длительность должна быть не менее 1 дня';
    } else if (days > 365) {
      newErrors.days = 'Длительность не должна превышать 365 дней';
    }

    if (formData.mealsPerDay < 1) {
      newErrors.mealsPerDay = 'Минимум 1 прием пищи в день';
    } else if (formData.mealsPerDay > 10) {
      newErrors.mealsPerDay = 'Максимум 10 приемов пищи в день';
    }

    if (dateRange[0] && dateRange[1]) {
      const today = startOfDay(new Date());
      if (!trip && isBefore(dateRange[0], today)) {
        newErrors.startDate = 'Дата начала не может быть в прошлом';
      }
      if (isBefore(dateRange[1], dateRange[0])) {
        newErrors.endDate = 'Дата окончания должна быть после даты начала';
      }
    }

    return newErrors;
  }, [formData, days, dateRange, trip]);

  const handleFieldChange = useCallback(
    (field: keyof TripData, value: string | number) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      if (errors[field as keyof FormErrors]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    },
    [errors]
  );

  const handleCancel = useCallback(() => {
    if (isDirty) {
      setConfirmModalOpen(true);
    } else {
      onCancel();
    }
  }, [isDirty, onCancel]);

  const handleConfirmCancel = useCallback(() => {
    // Close modal first, then navigate on next tick to avoid any interference
    setConfirmModalOpen(false);
    setTimeout(() => {
      // eslint-disable-next-line no-console
      console.debug('[TripForm] Confirm cancel -> onCancel');
      onCancel();
    }, 0);
  }, [onCancel]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      const validationErrors = validateForm();
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        const firstErrorField = Object.keys(validationErrors)[0];
        const errorElement = document.querySelector(`[name="${firstErrorField}"]`);
        errorElement?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      setIsSubmitting(true);
      try {
        const finalFormData: TripData = {
          ...formData,
          name: formData.name.trim(),
          destination: formData.destination?.trim() || '',
          description: formData.description?.trim() || '',
          days,
          startDate: dateRange[0] ? formatISO(dateRange[0], { representation: 'date' }) : '',
          endDate: dateRange[1] ? formatISO(dateRange[1], { representation: 'date' }) : '',
        };

        await onSubmit(finalFormData);
      } catch (error) {
        console.error('Form submission error:', error);
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, days, dateRange, validateForm, onSubmit]
  );

  const difficultyOptions = [
    { value: 'easy', label: 'Легкий' },
    { value: 'medium', label: 'Средний' },
    { value: 'hard', label: 'Сложный' },
  ];

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} noValidate className="space-y-8">
        {/* Basic Information Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 pb-3 border-b notion-border-subtle">
            <MapPin className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground tracking-tight">
              Основная информация
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <Input
                label="Название похода"
                name="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleFieldChange('name', e.target.value)}
                error={errors.name}
                autoFocus
                required
                maxLength={100}
                placeholder="Например, Восхождение на Эльбрус"
                className="text-base font-medium"
              />
            </div>

            <Input
              label="Место (регион)"
              name="destination"
              type="text"
              value={formData.destination}
              onChange={(e) => handleFieldChange('destination', e.target.value)}
              error={errors.destination}
              placeholder="Например, Кавказ"
              maxLength={50}
            />

            <div>
              <label className="block text-sm font-medium text-foreground mb-2 tracking-tight">
                Сложность
              </label>
              <ThemedSelect
                value={difficultyOptions.find((opt) => opt.value === formData.difficulty)}
                onChange={(option) => option && handleFieldChange('difficulty', option.value)}
                options={difficultyOptions}
                menuPortalTarget={document.body}
                placeholder="Выберите сложность"
                isSearchable={false}
              />
            </div>
          </div>

          <Textarea
            label="Описание"
            name="description"
            value={formData.description}
            onChange={(e) => handleFieldChange('description', e.target.value)}
            rows={3}
            maxLength={500}
            placeholder="Краткое описание маршрута, особенности, требования..."
          />
        </div>

        {/* Dates Section */}
        <div className="space-y-6">
          <div className="flex items-center gap-3 pb-3 border-b notion-border-subtle">
            <Calendar className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold text-foreground tracking-tight">
              Даты и параметры
            </h3>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2 tracking-tight">
              Даты похода
            </label>
            <div className="relative">
              <ThemedDatePicker
                selectsRange
                startDate={dateRange[0]}
                endDate={dateRange[1]}
                onChange={handleDateRangeChange}
                isClearable={true}
                monthsShown={1}
                wrapperClassName="w-full"
                placeholderText="Выберите даты похода"
                dateFormat="dd.MM.yyyy"
                minDate={!trip ? new Date() : undefined}
              />
            </div>
            {(errors.startDate || errors.endDate) && (
              <p className="mt-2 text-sm text-danger flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {errors.startDate || errors.endDate}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Input
              label="Длительность (дни)"
              name="days"
              type="number"
              min="1"
              max="365"
              value={days}
              onChange={(e) => handleDaysChange(Number(e.target.value))}
              error={errors.days}
              required
            />

            <Input
              label="Приемов пищи в день"
              name="mealsPerDay"
              type="number"
              min="1"
              max="10"
              value={formData.mealsPerDay}
              onChange={(e) => handleFieldChange('mealsPerDay', Number(e.target.value))}
              error={errors.mealsPerDay}
              required
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-6 border-t notion-border-subtle">
          <Button type="button" variant="ghost" onClick={handleCancel} disabled={isSubmitting}>
            <X className="w-4 h-4 mr-2" />
            Отмена
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={isSubmitting || hasErrors}
            loading={isSubmitting}
          >
            <Save className="w-4 h-4 mr-2" />
            {trip ? 'Сохранить изменения' : 'Создать поход'}
          </Button>
        </div>

        {/* Unsaved Changes Warning */}
        {isDirty && !isSubmitting && (
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
        confirmText="Закрыть без сохранения"
        cancelText="Продолжить редактирование"
      >
        Вы уверены, что хотите закрыть форму? Все несохраненные изменения будут потеряны.
      </ConfirmModal>
    </div>
  );
};

export default TripForm;
