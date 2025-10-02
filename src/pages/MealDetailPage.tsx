// src/pages/MealDetailPage.tsx
import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useMealStore } from '../stores/useMealStore';
import MealForm from '../components/meals/MealForm';
import type { MealData } from '../types';
import { ArrowLeft, Utensils } from 'lucide-react';
import Button from '../ui/Button';

const MealDetailPage: React.FC = () => {
  const { mealId } = useParams<{ mealId: string }>();
  const navigate = useNavigate();
  const isNew = mealId === 'new';
  const numericId = isNew ? null : parseInt(mealId!, 10);

  const { getMealById, addMeal, updateMeal } = useMealStore();

  const meal = numericId ? getMealById(numericId) : null;

  if (!isNew && !meal) {
    return (
      <div className="text-center p-8">
        <h2 className="text-xl text-danger">Прием пищи не найден</h2>
        <Button as={Link} to="/meals" className="mt-4">
          Вернуться к списку
        </Button>
      </div>
    );
  }

  const handleSubmit = (data: MealData) => {
    if (isNew) {
      addMeal(data);
    } else if (numericId) {
      updateMeal(numericId, data);
    }
    navigate('/meals');
  };

  return (
    <div className="p-6 bg-background min-h-screen">
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          onClick={() => navigate('/meals')}
          className="mb-6"
          icon={ArrowLeft}
        >
          К списку приемов пищи
        </Button>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
            <Utensils className="w-7 h-7 text-primary" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {isNew ? 'Создание приема пищи' : 'Редактирование приема пищи'}
            </h1>
            <p className="text-muted-foreground">
              {isNew
                ? 'Создайте новый шаблон для быстрого добавления в раскладку.'
                : 'Измените детали существующего шаблона.'}
            </p>
          </div>
        </div>

        <MealForm meal={meal} onSubmit={handleSubmit} onCancel={() => navigate('/meals')} />
      </div>
    </div>
  );
};

export default MealDetailPage;
