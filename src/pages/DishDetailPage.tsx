// src/pages/DishDetailPage.tsx
import React, { useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import useDishStore from '../stores/useDishStore';
import DishForm from '../components/dishes/DishForm';
import type { DishData, SubmitDishAction } from '../types';
import { ArrowLeft, Soup } from 'lucide-react';
import Button from '../ui/Button';

const DishDetailPage: React.FC = () => {
  const { dishId } = useParams<{ dishId: string }>();
  const navigate = useNavigate();
  const isNew = !dishId || dishId === 'new';
  const numericId = !isNew && dishId ? parseInt(dishId, 10) : null;

  const { dishes, addDish, updateDish } = useDishStore();
  const dish = useMemo(
    () => (numericId ? dishes.find((d) => d.id === numericId) || null : null),
    [numericId, dishes]
  );

  if (!isNew && !dish) {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-xl text-danger">Блюдо не найдено</h2>
          <Link to="/dishes" className="inline-block mt-4">
            <Button variant="secondary">Вернуться к списку</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = (data: DishData, action: SubmitDishAction) => {
    if (action === 'create_or_update') {
      if (isNew) {
        addDish(data);
      } else if (numericId) {
        updateDish(numericId, data);
      }
    }
    navigate('/dishes');
  };

  return (
    <div className="p-6 bg-background min-h-screen">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" onClick={() => navigate('/dishes')} className="mr-1">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Soup className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {isNew ? 'Новое блюдо' : 'Редактирование блюда'}
            </h1>
            <p className="text-muted-foreground">
              {isNew ? 'Заполните данные нового блюда.' : 'Обновите данные блюда.'}
            </p>
          </div>
        </div>

        <DishForm
          dish={dish ?? null}
          onSubmit={handleSubmit}
          onCancel={() => navigate('/dishes')}
        />
      </div>
    </div>
  );
};

export default DishDetailPage;
