// src/config/mealEntityConfig.tsx
import { Utensils, Edit, Trash2 } from 'lucide-react';
import type { Meal } from '../types';

// Lightweight config object shaped like other entity configs
export const mealEntityConfig = {
  getIcon: (_meal: Meal) => Utensils,
  getBorderColor: (_meal: Meal) => '#6b7280', // gray-500
  views: {
    card: {
      title: (meal: Meal) => meal.name,
      subtitle: (_meal: Meal, ctx: any) => ctx?.mealType?.name || 'Без типа',
      details: (meal: Meal, ctx: any) => [
        {
          key: 'items',
          icon: Utensils,
          text: meal.items.length,
          title: 'Компоненты',
        },
      ],
    },
    listItem: {
      title: (meal: Meal) => meal.name,
    },
  },
  getActions: (handlers: { onEdit: (meal: Meal) => void; onDelete: (meal: Meal) => void }) => [
    { label: 'Редактировать', icon: Edit, onClick: handlers.onEdit },
    {
      label: 'Удалить',
      icon: Trash2,
      onClick: handlers.onDelete,
      className: 'text-red-600 dark:text-red-400',
    },
  ],
};
