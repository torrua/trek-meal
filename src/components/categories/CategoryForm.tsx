// src/components/categories/CategoryForm.tsx

import React, { useState } from 'react';
import type { CategoryData } from '../../types';
import Input from '../../ui/Input';
import Button from '../../ui/Button';
import FormField from '../../ui/FormField';

interface CategoryFormProps {
  category: CategoryData | null;
  onSubmit: (data: CategoryData) => void;
  onCancel: () => void;
}

// Функция для проверки, является ли символ эмодзи
const _isValidEmoji = (str: string): boolean => {
  // Простое регулярное выражение для эмодзи
  const emojiRegex =
    /[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F900}-\u{1F9FF}]/u;

  // Проверяем каждый символ в строке
  return str.split('').every((char) => emojiRegex.test(char));
};

const CategoryForm: React.FC<CategoryFormProps> = ({ category, onSubmit, onCancel }) => {
  const [name, setName] = useState(category?.name || '');
  const [emoji, setEmoji] = useState(category?.emoji || '📦');

  const handleEmojiChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only emoji characters, max 2 characters
    if (value.length <= 2 && (value === '' || _isValidEmoji(value))) {
      setEmoji(value);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onSubmit({ name: name.trim(), emoji });
    }
  };

  return (
    <div className="space-y-8">
      {/* Preview Section */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-3 tracking-tight">
          Предварительный просмотр
        </label>
        <div className="p-6 rounded-2xl border-2 bg-card transition-all duration-200 border-primary">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 text-white notion-shadow-sm bg-primary">
              <span className="text-xl">{emoji || '📦'}</span>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-foreground text-lg tracking-tight truncate">
                {name || 'Название категории'}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">0 продуктов</p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name and Icon Section */}
        <div className="space-y-6">
          <FormField label="Название категории" required>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
              placeholder="Например, Крупы и макароны"
            />
          </FormField>

          <FormField label="Эмодзи">
            <Input value={emoji} onChange={handleEmojiChange} placeholder="Например, 🌾" />
          </FormField>
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

export default CategoryForm;
