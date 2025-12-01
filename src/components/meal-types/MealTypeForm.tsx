// src/components/meal-types/MealTypeForm.tsx
import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Check, X } from 'lucide-react';
import Button from '../../ui/Button';
import Input from '../../ui/Input';
import { MealType } from '../../types';

const validationSchema = z.object({
  name: z.string().min(1, 'Название обязательно'),
  description: z.string().optional(),
});

type MealTypeFormData = {
  name: string;
  description?: string;
};

interface MealTypeFormProps {
  mealType?: MealType | null;
  onSubmit: (data: MealTypeFormData) => void;
  onCancel: () => void;
  isSubmitting?: boolean;
}

const MealTypeForm: React.FC<MealTypeFormProps> = ({
  mealType,
  onSubmit,
  onCancel,
  isSubmitting = false,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<MealTypeFormData>({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      name: mealType?.name || '',
      description: mealType?.description || '',
    },
  });

  const submitHandler = (data: MealTypeFormData) => {
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(submitHandler)} className="space-y-6">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-foreground mb-1">
          Название типа приёма пищи
        </label>
        <Input
          id="name"
          {...register('name')}
          placeholder="Например, Завтрак или Перекус"
          error={errors.name?.message}
          autoFocus
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-foreground mb-1">
          Описание (необязательно)
        </label>
        <Input
          id="description"
          {...register('description')}
          placeholder="Краткое описание типа приёма пищи"
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isSubmitting}>
          <X className="w-4 h-4 mr-2" />
          Отмена
        </Button>
        <Button type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? (
            'Сохранение...'
          ) : (
            <>
              <Check className="w-4 h-4 mr-2" />
              {mealType ? 'Сохранить изменения' : 'Создать тип'}
            </>
          )}
        </Button>
      </div>
    </form>
  );
};

export default MealTypeForm;
