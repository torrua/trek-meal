// src/pages/MealsPage.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useMealStore } from '../stores/useMealStore';
import { Plus, Utensils } from 'lucide-react';
import Button from '../ui/Button';
import EntityCard from '../ui/EntityCard';

const MealsPage: React.FC = () => {
  const { meals } = useMealStore();

  return (
    <div className="p-6 bg-background min-h-screen">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-foreground">Готовые приемы пищи</h1>
        <Button as={Link} to="/meals/new" icon={Plus}>
          Создать прием пищи
        </Button>
      </div>

      {meals.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {meals.map((meal) => (
            <EntityCard
              key={meal.id}
              linkTo={`/meals/${meal.id}`}
              icon={Utensils}
              title={meal.name}
              description={meal.description || `${meal.items.length} компонентов`}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 px-6 bg-card border notion-border-subtle rounded-lg">
          <Utensils className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium text-foreground">
            Пока нет готовых приемов пищи
          </h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Создайте свой первый шаблон приема пищи, чтобы быстро добавлять его в походы.
          </p>
          <div className="mt-6">
            <Button as={Link} to="/meals/new" icon={Plus}>
              Создать прием пищи
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MealsPage;
