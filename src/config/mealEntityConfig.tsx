// src/config/mealEntityConfig.tsx
import { Utensils, Edit, Trash2 } from 'lucide-react';
import type { Meal, MealType } from '../types';

// Lightweight config object shaped like other entity configs
export const mealEntityConfig = {
  getIcon: (_meal: Meal) => Utensils,
  getIconColor: () => 'text-[#388E3C]',
  views: {
    card: {
      title: (meal: Meal) => meal.name,
      subtitle: (_meal: Meal, ctx?: { mealType?: MealType }) => ctx?.mealType?.name || 'Без типа',
      details: (meal: Meal, _ctx?: { mealType?: MealType }) => [
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
