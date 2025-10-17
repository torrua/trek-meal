// src/pages/MealTypeDetailPage.tsx
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useMealTypesStore, { MealType } from '../stores/useMealTypesStore';
import { ArrowLeft, Utensils } from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import FormField from '../ui/FormField';

const MealTypeDetailPage: React.FC = () => {
  const { mealTypeId } = useParams<{ mealTypeId: string }>();
  const navigate = useNavigate();
  const isNew = !mealTypeId || mealTypeId === 'new';
  const numericId = !isNew && mealTypeId ? parseInt(mealTypeId, 10) : null;

  const { mealTypes, addMealType, updateMealType } = useMealTypesStore();
  const mealType = numericId ? mealTypes.find((mt) => mt.id === numericId) || null : null;

  const [name, setName] = useState(mealType?.name || '');
  const [repeatable, setRepeatable] = useState(mealType?.repeatable || false);
  const [errors, setErrors] = useState<{ name?: string }>({});

  if (!isNew && !mealType) {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-xl text-danger">Тип приема пищи не найден</h2>
          <Button onClick={() => navigate('/meal-types')} variant="secondary" className="mt-4">
            Вернуться к списку
          </Button>
        </div>
      </div>
    );
  }

  const validateForm = () => {
    const newErrors: { name?: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Название обязательно для заполнения';
    } else if (name.trim().length < 2) {
      newErrors.name = 'Название должно содержать минимум 2 символа';
    } else if (name.trim().length > 50) {
      newErrors.name = 'Название не должно превышать 50 символов';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    if (isNew) {
      addMealType(name.trim(), repeatable);
    } else if (numericId) {
      updateMealType(numericId, name.trim(), repeatable);
    }

    navigate('/meal-types');
  };

  return (
    <div className="p-6 bg-background min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" onClick={() => navigate('/meal-types')}>
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Utensils className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {isNew ? 'Новый тип приема пищи' : 'Редактирование типа приема пищи'}
            </h1>
            <p className="text-muted-foreground">
              {isNew
                ? 'Создайте новый тип для организации приемов пищи.'
                : 'Обновите данные существующего типа.'}
            </p>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <FormField label="Название типа" error={errors.name} required>
              <Input
                name="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                maxLength={50}
                placeholder="Например, Завтрак"
                className="text-base font-medium"
              />
            </FormField>

            <div>
              <label className="block text-sm font-medium text-foreground mb-3">
                Повторяемость
              </label>
              <div className="flex items-center">
                <label className="flex items-center cursor-pointer">
                  <div className="relative">
                    <input
                      type="checkbox"
                      id="repeatable"
                      checked={repeatable}
                      onChange={(e) => setRepeatable(e.target.checked)}
                      className="sr-only"
                    />
                    <div
                      className={`block w-10 h-6 rounded-full transition-colors ${repeatable ? 'bg-primary' : 'bg-muted'}`}
                    ></div>
                    <div
                      className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${
                        repeatable ? 'transform translate-x-4' : ''
                      }`}
                    ></div>
                  </div>
                  <span className="ml-3 text-sm font-medium text-foreground">
                    Можно добавлять несколько раз в день
                  </span>
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t border-border">
              <Button type="button" variant="ghost" onClick={() => navigate('/meal-types')}>
                Отмена
              </Button>
              <Button type="submit">{isNew ? 'Создать тип' : 'Сохранить изменения'}</Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default MealTypeDetailPage;
