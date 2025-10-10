// src/pages/MealDetailPage.tsx
import React, { useMemo, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useMealStore } from '../stores/useMealStore';
import MealForm from '../components/meals/MealForm';
import type { MealData } from '../types';
import { ArrowLeft, Utensils } from 'lucide-react';
import Button from '../ui/Button';
import MealDetail from '../components/meals/MealDetail';

const MealDetailPage: React.FC = () => {
  const { mealId } = useParams<{ mealId: string }>();
  const navigate = useNavigate();
  const isNew = !mealId || mealId === 'new';
  const numericId = isNew ? null : mealId ? parseInt(mealId, 10) : null;

  const { getMealById, addMeal, updateMeal } = useMealStore();

  const meal = useMemo(() => (numericId ? getMealById(numericId) : null), [numericId, getMealById]);
  const [isEditing, setIsEditing] = useState<boolean>(isNew);
  const [openSections, setOpenSections] = useState<string[]>(['main', 'items']);

  if (!isNew && !meal) {
    return (
      <div className="text-center p-8">
        <h2 className="text-xl text-danger">Прием пищи не найден</h2>
        <Link to="/meals">
          <Button variant="secondary">Вернуться к списку</Button>
        </Link>
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
        <Button variant="ghost" onClick={() => navigate('/meals')} className="mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />К списку приемов пищи
        </Button>

        {isEditing || isNew ? (
          <>
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
            <MealForm
              meal={meal}
              onSubmit={handleSubmit}
              onCancel={() => (isNew ? navigate('/meals') : setIsEditing(false))}
            />
          </>
        ) : (
          <MealDetail
            meal={meal ?? null}
            onEdit={() => setIsEditing(true)}
            openSections={openSections}
            onToggleSection={(id) =>
              setOpenSections((prev) =>
                prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
              )
            }
          />
        )}
      </div>
    </div>
  );
};

export default MealDetailPage;
