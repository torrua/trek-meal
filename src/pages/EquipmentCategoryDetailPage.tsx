// src/pages/EquipmentCategoryDetailPage.tsx
import React, { useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import useEquipmentCategoryStore from '../stores/useEquipmentCategoryStore';
import EquipmentCategoryForm from '../components/equipment/EquipmentCategoryForm';
import type { EquipmentCategoryData } from '../types';
import { ArrowLeft, Tag } from 'lucide-react';
import Button from '../ui/Button';

const EquipmentCategoryDetailPage: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const isNew = !categoryId || categoryId === 'new';
  const numericId = !isNew && categoryId ? parseInt(categoryId, 10) : null;

  const { categories, addCategory, updateCategory } = useEquipmentCategoryStore();
  const category = useMemo(
    () => (numericId ? categories.find((c) => c.id === numericId) || null : null),
    [numericId, categories]
  );

  if (!isNew && !category) {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-xl text-danger">Категория снаряжения не найдена</h2>
          <Link to="/equipment-categories" className="inline-block mt-4">
            <Button variant="secondary">Вернуться к списку</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = (data: EquipmentCategoryData) => {
    if (isNew) {
      addCategory(data);
    } else if (numericId) {
      updateCategory(numericId, data);
    }
    navigate('/equipment-categories');
  };

  return (
    <div className="p-6 bg-background min-h-screen">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Button
            variant="ghost"
            onClick={() => navigate('/equipment-categories')}
            className="mr-1"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Tag className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {isNew ? 'Новая категория снаряжения' : 'Редактирование категории снаряжения'}
            </h1>
            <p className="text-muted-foreground">
              {isNew
                ? 'Создайте новую категорию для организации снаряжения.'
                : 'Обновите данные существующей категории.'}
            </p>
          </div>
        </div>

        <EquipmentCategoryForm
          category={category ?? null}
          onSubmit={handleSubmit}
          onCancel={() => navigate('/equipment-categories')}
        />
      </div>
    </div>
  );
};

export default EquipmentCategoryDetailPage;
