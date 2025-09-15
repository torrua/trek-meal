// src/components/categories/CategoryForm.tsx

import React, { useState } from 'react';
import { Palette } from 'lucide-react';
import type { CategoryData } from '../../types';
import Input from '../../ui/Input';
import Button from '../../ui/Button';
import DynamicIcon from '../../ui/DynamicIcon';

interface CategoryFormProps {
  category: CategoryData | null;
  onSubmit: (data: CategoryData) => void;
  onCancel: () => void;
}

const PRESET_COLORS = [
  '#ef4444',
  '#f97316',
  '#f59e0b',
  '#eab308',
  '#84cc16',
  '#22c55e',
  '#10b981',
  '#14b8a6',
  '#06b6d4',
  '#0ea5e9',
  '#3b82f6',
  '#6366f1',
  '#8b5cf6',
  '#a855f7',
  '#d946ef',
  '#ec4899',
];

const CategoryForm: React.FC<CategoryFormProps> = ({ category, onSubmit, onCancel }) => {
  const [name, setName] = useState(category?.name || '');
  const [color, setColor] = useState(category?.color || '#a855f7');
  const [iconName, setIconName] = useState(category?.iconName || 'Package');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit({ name: name.trim(), color, iconName });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-1 space-y-6">
      <div>
        <label className="block text-sm font-medium text-muted-foreground mb-1.5">
          Предпросмотр
        </label>
        <div className="p-4 rounded-lg border-2" style={{ borderColor: color }}>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-md flex items-center justify-center flex-shrink-0 text-white"
              style={{ backgroundColor: color }}
            >
              <DynamicIcon name={iconName} className="w-6 h-6" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-foreground truncate">
                {name || 'Название категории'}
              </h3>
              <p className="text-sm text-muted-foreground">0 продуктов</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[auto_1fr] gap-4 items-center">
        <Input
          label="Иконка"
          value={iconName}
          onChange={(e) => setIconName(e.target.value)}
          placeholder="Название из Lucide"
          containerClassName="w-32"
          className="text-center"
        />
        <Input
          label="Название категории *"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          autoFocus
          placeholder="Например, Крупы и макароны"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-muted-foreground mb-2">Цвет</label>
        <div className="grid grid-cols-8 gap-2">
          {PRESET_COLORS.map((presetColor) => (
            <button
              key={presetColor}
              type="button"
              className={`w-full h-8 rounded-full transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary ${
                color === presetColor ? 'ring-2 ring-primary ring-offset-2 scale-110' : ''
              }`}
              style={{ backgroundColor: presetColor }}
              onClick={() => setColor(presetColor)}
              title={presetColor}
            />
          ))}
        </div>
        <div className="flex items-center gap-3 mt-3">
          <Palette className="w-5 h-5 text-muted-foreground" />
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-full h-10 border-none p-0 bg-transparent rounded-lg"
          />
        </div>
      </div>
      <div className="flex justify-end gap-3 pt-6 border-t">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Отмена
        </Button>
        <Button type="submit">{category ? 'Сохранить' : 'Добавить'}</Button>
      </div>
    </form>
  );
};

export default CategoryForm;
