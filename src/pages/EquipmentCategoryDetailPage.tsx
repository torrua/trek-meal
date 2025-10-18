// src/pages/EquipmentCategoryDetailPage.tsx
import React, { useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import useEquipmentCategoryStore from '../stores/useEquipmentCategoryStore';
import type { EquipmentCategoryData } from '../types';
import { ArrowLeft, Layers } from 'lucide-react';
import Button from '../ui/Button';

// Simple form component for equipment category
const EquipmentCategoryForm: React.FC<{
  category: EquipmentCategoryData | null;
  onSubmit: (data: EquipmentCategoryData) => void;
  onCancel: () => void;
}> = ({ category, onSubmit, onCancel }) => {
  const [name, setName] = React.useState(category?.name || '');
  const [color, setColor] = React.useState(category?.color || '#a855f7');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit({ name: name.trim(), color });
    }
  };

  return (
    <div className="space-y-8">
      {/* Preview Section */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-3 tracking-tight">
          Предварительный просмотр
        </label>
        <div
          className="p-6 rounded-2xl border-2 bg-card transition-all duration-200"
          style={{ borderColor: color }}
        >
          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-white notion-shadow-sm"
              style={{ backgroundColor: color }}
            >
              <Layers className="w-6 h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-foreground text-lg tracking-tight truncate">
                {name || 'Название категории'}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">0 единиц снаряжения</p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name Section */}
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2 tracking-tight">
              Название категории <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              placeholder="Например, Палатки и тенты"
              className="w-full px-3 py-2 text-base bg-background border notion-border-subtle rounded-lg notion-focus-ring"
            />
          </div>
        </div>

        {/* Color Selection */}
        <div className="space-y-4">
          <label className="block text-sm font-medium text-foreground tracking-tight">
            Цвет категории
          </label>

          {/* Custom Color Picker */}
          <div className="flex items-center gap-4 p-4 bg-muted/30 rounded-xl border notion-border-subtle">
            <div className="flex items-center gap-3">
              <Layers className="w-5 h-5 text-muted-foreground" />
              <span className="text-sm font-medium text-foreground">Цвет:</span>
            </div>
            <div className="flex-1 flex items-center gap-3">
              <input
                type="color"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-10 h-10 rounded-lg border notion-border-subtle cursor-pointer notion-focus-ring"
              />
              <input
                type="text"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="flex-1 px-3 py-2 text-sm bg-background border notion-border-subtle rounded-lg notion-focus-ring font-mono"
                placeholder="#000000"
              />
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-6 border-t notion-border-subtle">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Отмена
          </Button>
          <Button type="submit" variant="primary">
            {category ? 'Сохранить' : 'Добавить'}
          </Button>
        </div>
      </form>
    </div>
  );
};

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
          <h2 className="text-xl text-danger">Категория не найдена</h2>
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
            <Layers className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">
              {isNew ? 'Новая категория снаряжения' : 'Редактирование категории снаряжения'}
            </h1>
            <p className="text-muted-foreground">
              {isNew
                ? 'Заполните данные новой категории снаряжения.'
                : 'Обновите данные категории снаряжения.'}
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
