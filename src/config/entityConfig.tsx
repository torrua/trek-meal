// src/config/entityConfig.tsx

import React from 'react';
import type {
  Trip,
  Participant,
  Product,
  Dish,
  Equipment,
  DishProduct,
  Category,
  MealType,
  EquipmentCategory,
} from '../types';
import { formatDate, getEffectiveStatus, calculateAge } from '../utils/index';
import { DIFFICULTY_CONFIG, STATUS_CONFIG } from '../constants/trips';
import { EXPERIENCE_CONFIG, GENDER_CONFIG } from '../constants/participants';
import {
  MapPin,
  Users,
  Calendar,
  Edit,
  Copy,
  Trash2,
  Share,
  Backpack,
  MapPinPlus,
  Component,
  Flame,
  Soup,
  Weight,
  User,
  Scale,
  ExternalLink,
  Tag,
  Utensils,
  Layers,
} from 'lucide-react';

// Типизация хендлеров для каждой сущности
type TripActions = {
  onEdit: (entity: Trip) => void;
  onClone: (entity: Trip) => void;
  onExport: (entity: Trip) => void;
  onDelete: (entity: Trip) => void;
};
type ParticipantActions = {
  onEdit: (entity: Participant) => void;
  onAddToTrip: (entity: Participant) => void;
  onClone: (entity: Participant) => void;
  onExport: (entity: Participant) => void;
  onDelete: (entity: Participant) => void;
};
type ProductActions = {
  onEdit: (entity: Product) => void;
  onClone: (entity: Product) => void;
  onExport: (entity: Product) => void;
  onDelete: (entity: Product) => void;
};
type DishActions = {
  onEdit: (entity: Dish) => void;
  onClone: (entity: Dish) => void;
  onExport: (entity: Dish) => void;
  onDelete: (entity: Dish) => void;
};
type EquipmentActions = {
  onEdit: (entity: Equipment) => void;
  onClone: (entity: Equipment) => void;
  onExport: (entity: Equipment) => void;
  onDelete: (entity: Equipment) => void;
};
type CategoryActions = {
  onEdit: (entity: Category) => void;
  onClone: (entity: Category) => void;
  onExport: (entity: Category) => void;
  onDelete: (entity: Category) => void;
};

interface CustomMealType extends MealType {
  repeatable?: boolean;
}

type MealTypeActions = {
  onEdit: (entity: CustomMealType) => void;
  onClone: (entity: CustomMealType) => void;
  onExport: (entity: CustomMealType) => void;
  onDelete: (entity: CustomMealType) => void;
};

type EquipmentCategoryActions = {
  onEdit: (entity: EquipmentCategory) => void;
  onClone: (entity: EquipmentCategory) => void;
  onExport: (entity: EquipmentCategory) => void;
  onDelete: (entity: EquipmentCategory) => void;
};

// Общий тип для всех хендлеров, чтобы избежать 'any'
type EntityActions =
  | TripActions
  | ParticipantActions
  | ProductActions
  | DishActions
  | EquipmentActions
  | CategoryActions
  | MealTypeActions
  | EquipmentCategoryActions;

interface CardViewConfig<T> {
  title: (entity: T) => string;
  subtitle?: (entity: T, context?: Record<string, unknown>) => string | React.ReactNode;
  details: (
    entity: T,
    context?: Record<string, unknown>
  ) => Array<{
    icon: React.ElementType;
    text: string | number;
    title?: string;
    className?: string;
  }>;
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

// --- Конфигурация для "Похода" (Trip) ---
export const tripEntityConfig: EntityConfig<Trip> = {
  getIcon: (trip) => DIFFICULTY_CONFIG[trip.difficulty].icon,
  getIconColor: (trip) => DIFFICULTY_CONFIG[trip.difficulty].colorClassName,
  getBorderColor: (trip) => {
    const status = getEffectiveStatus(trip);
    if (status === 'planning') return '#f97316';
    if (status === 'active') return '#8b5cf6';
    return '#6b7280';
  },
  views: {
    card: {
      title: (trip) => trip.name,
      subtitle: (trip) => {
        const status = getEffectiveStatus(trip);
        const config = STATUS_CONFIG[status];
        return (
          <div className="flex items-center gap-1.5">
            <config.icon className="w-4 h-4" />
            <span>{config.label}</span>
          </div>
        );
      },
      details: (trip) => [
        { key: 'participants', icon: Users, text: trip.participants.length, title: 'Участники' },
        ...(trip.destination
          ? [{ key: 'destination', icon: MapPin, text: trip.destination, title: 'Место' }]
          : []),
        ...(trip.startDate
          ? [{ key: 'startDate', icon: Calendar, text: formatDate(trip.startDate), title: 'Дата' }]
          : []),
      ],
    },
    listItem: {
      title: (trip) => trip.name,
      details: (trip) => [
        <div key="date" className="flex items-center gap-1.5" title="Дата начала">
          <Calendar className="w-4 h-4" />
          <span className="font-medium">{formatDate(trip.startDate)}</span>
        </div>,
        <div key="participants" className="flex items-center gap-1.5" title="Участники">
          <Users className="w-4 h-4" />
          <span className="font-medium">{trip.participants.length}</span>
        </div>,
      ],
      actions: (handlers) => [
        { label: 'Открыть поход', icon: ExternalLink, onClick: handlers.onView },
        {
          label: 'Убрать из похода',
          icon: Trash2,
          onClick: handlers.onRemove,
          className: 'text-red-600 dark:text-red-400',
        },
      ],
    },
  },
  getActions: (handlers: TripActions) => [
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

// --- Конфигурация для "Участника" (Participant) ---
export const participantEntityConfig: EntityConfig<Participant> = {
  getIcon: (participant) => EXPERIENCE_CONFIG[participant.experienceLevel].icon,
  getIconColor: (participant) => EXPERIENCE_CONFIG[participant.experienceLevel].colorClassName,
  getBorderColor: (participant) => GENDER_CONFIG[participant.gender].color,
  views: {
    card: {
      title: (participant) => participant.name,
      subtitle: (participant) => {
        const age = calculateAge(participant.birthDate);
        return age ? `${age} лет` : participant.age === 'child' ? 'Ребенок' : 'Взрослый';
      },
      details: (participant, context) => [
        { key: 'trips', icon: MapPin, text: context?.tripCount as number, title: 'Походы' },
        {
          key: 'equipment',
          icon: Backpack,
          text: context?.equipmentCount as number,
          title: 'Снаряжение',
        },
      ],
    },
    listItem: {
      title: (p) => p.name,
      details: (p) => {
        const age = calculateAge(p.birthDate);
        return [age ? `${age} лет` : p.age === 'child' ? 'Ребенок' : 'Взрослый'];
      },
      actions: (handlers) => [
        { label: 'Открыть профиль', icon: ExternalLink, onClick: handlers.onView },
        {
          label: 'Удалить из похода',
          icon: Trash2,
          onClick: handlers.onRemove,
          className: 'text-red-600 dark:text-red-400',
        },
      ],
    },
  },
  getActions: (handlers: ParticipantActions) => [
    { label: 'Редактировать', icon: Edit, onClick: handlers.onEdit },
    { label: 'Добавить в поход', icon: MapPinPlus, onClick: handlers.onAddToTrip },
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

// --- Конфигурация для "Продукта" (Product) ---
export const productEntityConfig: EntityConfig<Product> = {
  getIcon: () => Component,
  getIconColor: (_product, context) => (context?.category ? 'text-current' : 'text-gray-500'),
  getBorderColor: (_product, context) => (context?.category as Category)?.color || '#6b7280',
  views: {
    card: {
      title: (product) => product.name,
      subtitle: (_product, context) => (context?.category as Category)?.name || 'Без категории',
      details: (product) => [
        {
          key: 'calories',
          icon: Flame,
          text: `${product.calories} ккал`,
          title: 'Калорийность на 100г',
        },
      ],
    },
    listItem: {
      title: (p) => p.name,
      details: (_p, context?: Record<string, unknown>) => [
        <div key="weight" className="flex items-center gap-1.5" title="Вес продукта">
          <Scale className="w-4 h-4" />
          <span className="font-medium">{(context?.dishProduct as DishProduct)?.weight} г</span>
        </div>,
      ],
      actions: (handlers) => [
        { label: 'Открыть продукт', icon: ExternalLink, onClick: handlers.onView },
        { label: 'Редактировать порцию', icon: Edit, onClick: handlers.onEditPortion },
        {
          label: 'Удалить продукт из блюда',
          icon: Trash2,
          onClick: handlers.onRemove,
          className: 'text-red-600 dark:text-red-400',
        },
      ],
    },
  },
  getActions: (handlers: ProductActions) => [
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

// --- Конфигурация для "Категории" (Category) ---
export const categoryEntityConfig: EntityConfig<Category> = {
  getIcon: () => Tag,
  getIconColor: () => 'text-gray-500',
  getBorderColor: (category) => category.color || '#6b7280',
  views: {
    card: {
      title: (category) => category.name,
      subtitle: (category, context) => {
        const productCount = (context?.productCount as number) || 0;
        return (
          <div className="flex items-center gap-1">
            <Component className="w-4 h-4" />
            <span>{productCount}</span>
          </div>
        );
      },
      details: (category, context) => [
        {
          key: 'products',
          icon: Component,
          text: (context?.productCount as number) || 0,
          title: 'Продукты',
        },
      ],
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

// --- Конфигурация для "Типа приёма пищи" (MealType) ---
export const mealTypeEntityConfig: EntityConfig<CustomMealType> = {
  getIcon: () => Utensils,
  getIconColor: () => 'text-gray-500',
  getBorderColor: () => '#6b7280',
  views: {
    card: {
      title: (mealType) => mealType.name,
      details: (mealType) => [
        {
          key: 'repeatable',
          icon: mealType.repeatable ? Copy : Tag,
          text: mealType.repeatable ? 'Повторяемый' : 'Один раз в день',
          title: 'Повторяемость',
        },
      ],
    },
    listItem: {
      title: (mealType) => mealType.name,
    },
  },
  getActions: (handlers: MealTypeActions) => [
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

// --- Конфигурация для "Блюда" (Dish) ---
export const dishEntityConfig: EntityConfig<Dish> = {
  getIcon: () => Soup,
  getIconColor: () => 'text-gray-500',
  getBorderColor: () => '#6b7280',
  views: {
    card: {
      title: (dish) => dish.name,
      subtitle: () => null,
      details: () => [],
    },
    listItem: {
      title: (d) => d.name,
    },
  },
  getActions: (handlers: DishActions) => [
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

// --- Конфигурация для "Снаряжения" (Equipment) ---
export const equipmentEntityConfig: EntityConfig<Equipment> = {
  getIcon: () => Backpack,
  getIconColor: (_equipment, context) => (context?.category ? 'text-current' : 'text-gray-500'),
  getBorderColor: (_equipment, context) => (context?.category as Category)?.color || '#6b7280',
  views: {
    card: {
      title: (equipment) => equipment.name,
      subtitle: (_equipment, context) => (context?.category as Category)?.name || 'Без категории',
      details: (equipment, context) => [
        { key: 'weight', icon: Scale, text: context?.formattedWeight as string, title: 'Вес' },
        {
          key: 'type',
          icon: equipment.type === 'personal' ? User : Users,
          text: equipment.type === 'personal' ? 'Личное' : 'Общее',
          title: 'Тип',
        },
        ...(context?.owner
          ? [
              {
                key: 'owner',
                icon: User,
                text: (context.owner as Participant).name,
                title: 'Владелец',
              },
            ]
          : []),
      ],
    },
    listItem: {
      title: (eq) => eq.name,
      details: (eq, context) => [
        <div key="weight" className="flex items-center gap-1.5" title="Вес">
          <Scale className="w-4 h-4" />
          <span className="font-medium">{context?.formattedWeight as string}</span>
        </div>,
      ],
      actions: (handlers) => [
        { label: 'Открыть снаряжение', icon: ExternalLink, onClick: handlers.onView },
      ],
    },
  },
  getActions: (handlers: EquipmentActions) => [
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

// --- Конфигурация для "Категории снаряжения" (EquipmentCategory) ---
export const equipmentCategoryEntityConfig: EntityConfig<EquipmentCategory> = {
  getIcon: () => Layers,
  getIconColor: () => 'text-gray-500',
  getBorderColor: (category) => category.color || '#6b7280',
  views: {
    card: {
      title: (category) => category.name,
      details: (category) => [
        {
          key: 'color',
          icon: Tag,
          text: category.color,
          title: 'Цвет',
        },
      ],
    },
    listItem: {
      title: (category) => category.name,
    },
  },
  getActions: (handlers: EquipmentCategoryActions) => [
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
