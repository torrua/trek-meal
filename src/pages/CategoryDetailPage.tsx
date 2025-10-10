// src/pages/CategoryDetailPage.tsx
import React, { useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import useCategoryStore from '../stores/useCategoryStore';
import CategoryForm from '../components/categories/CategoryForm';
import type { CategoryData } from '../types';
import { ArrowLeft, Tag } from 'lucide-react';
import Button from '../ui/Button';

const CategoryDetailPage: React.FC = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const navigate = useNavigate();
  const isNew = !categoryId || categoryId === 'new';
  const numericId = !isNew && categoryId ? parseInt(categoryId, 10) : null;

  const { categories, addCategory, updateCategory } = useCategoryStore();
  const category = useMemo(
    () => (numericId ? categories.find((c) => c.id === numericId) || null : null),
    [numericId, categories]
  );

  if (!isNew && !category) {
    return (
      <div className="p-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-xl text-danger">Категория не найдена</h2>
          <Link to="/categories" className="inline-block mt-4">
            <Button variant="secondary">Вернуться к списку</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleSubmit = (data: CategoryData) => {
    if (isNew) {
      addCategory(data);
    } else if (numericId) {
      updateCategory(numericId, data);
    }
    navigate('/categories');
  };

  return (
    <div className="p-6 bg-background min-h-screen">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" onClick={() => navigate('/categories')} className="mr-1">
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Tag className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {isNew ? 'Новая категория' : 'Редактирование категории'}
            </h1>
            <p className="text-muted-foreground">
              {isNew ? 'Заполните данные новой категории.' : 'Обновите данные категории.'}
            </p>
          </div>
        </div>

        <CategoryForm
          category={category ?? null}
          onSubmit={handleSubmit}
          onCancel={() => navigate('/categories')}
        />
      </div>
    </div>
  );
};

export default CategoryDetailPage;
