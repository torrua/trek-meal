// src/config/categoryEntityConfig.tsx

import React from 'react';
import type { Category } from '../types';
import useProductStore from '../stores/useProductStore';
import { Tag, Package, Edit, Copy, Trash2, Share } from 'lucide-react';

interface CardViewConfig<T> {
  title: (entity: T) => string;
  subtitle?: (entity: T, context?: Record<string, unknown>) => string | React.ReactNode;
  details: (entity: T, context?: Record<string, unknown>) => any[];
}

interface ListItemViewConfig<T> {
  title: (entity: T, context?: Record<string, unknown>) => string;
  details?: (entity: T, context?: Record<string, unknown>) => (string | React.ReactNode)[];
  actions?: (handlers: Record<string, (entity: T) => void>) => any[];
}

interface EntityConfig<T> {
  getIcon: (entity: T, context?: Record<string, unknown>) => React.ElementType;
  getIconColor?: (entity: T, context?: Record<string, unknown>) => string;
  getBorderColor: (entity: T, context?: Record<string, unknown>) => string;
  views: {
    card: CardViewConfig<T>;
    listItem: ListItemViewConfig<T>;
  };
  getActions: (handlers: any) => any[];
}

type CategoryActions = {
  onEdit: (entity: Category) => void;
  onClone: (entity: Category) => void;
  onExport: (entity: Category) => void;
  onDelete: (entity: Category) => void;
};

export const categoryEntityConfig: EntityConfig<Category> = {
  getIcon: () => Tag,
  getIconColor: () => 'text-gray-500',
  getBorderColor: (category) => category.color || '#6b7280',
  views: {
    card: {
      title: (category) => category.name,
      subtitle: (category) => {
        const productCount = useProductStore
          .getState()
          .products.filter((p) => p.categoryId === category.id).length;
        return (
          <div className="flex items-center gap-1">
            <Package className="w-4 h-4" />
            <span>{productCount}</span>
          </div>
        );
      },
      details: (category) => {
        const productCount = useProductStore
          .getState()
          .products.filter((p) => p.categoryId === category.id).length;
        return [
          {
            key: 'products',
            icon: Package,
            text: productCount,
            title: 'Продукты',
          },
        ];
      },
    },
    listItem: {
      title: (category) => category.name,
    },
  },
  getActions: (handlers: CategoryActions) => [
    { label: 'Редактировать', icon: Edit, onClick: handlers.onEdit },
    { label: 'Клонировать', icon: Copy, onClick: handlers.onClone },
    { label: 'Экспорт', icon: Share, onClick: handlers.onExport },
    {
      label: 'Удалить',
      icon: Trash2,
      onClick: handlers.onDelete,
      className: 'text-red-600 dark:text-red-400',
    },
  ],
};
