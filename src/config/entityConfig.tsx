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
  Weight as _Weight,
  User,
  Scale,
  ExternalLink,
  Tag,
  Layers,
} from 'lucide-react';

// ... (Types definition remains same)
type TripActions = {
  onEdit: (e: Trip) => void;
  onClone: (e: Trip) => void;
  onExport: (e: Trip) => void;
  onDelete: (e: Trip) => void;
  onView?: (e: Trip) => void;
  onRemove?: (e: Trip) => void;
};
type ParticipantActions = {
  onEdit: (e: Participant) => void;
  onAddToTrip: (e: Participant) => void;
  onClone: (e: Participant) => void;
  onExport: (e: Participant) => void;
  onDelete: (e: Participant) => void;
  onView?: (e: Participant) => void;
  onRemove?: (e: Participant) => void;
};
type ProductActions = {
  onEdit: (e: Product) => void;
  onClone: (e: Product) => void;
  onExport: (e: Product) => void;
  onDelete: (e: Product) => void;
  onView?: (e: Product) => void;
  onEditPortion?: (e: Product) => void;
  onRemove?: (e: Product) => void;
};
type DishActions = {
  onEdit: (e: Dish) => void;
  onClone: (e: Dish) => void;
  onExport: (e: Dish) => void;
  onDelete: (e: Dish) => void;
};
type EquipmentActions = {
  onEdit: (e: Equipment) => void;
  onClone: (e: Equipment) => void;
  onExport: (e: Equipment) => void;
  onDelete: (e: Equipment) => void;
  onView?: (e: Equipment) => void;
};
type CategoryActions = {
  onEdit: (e: Category) => void;
  onClone: (e: Category) => void;
  onExport: (e: Category) => void;
  onDelete: (e: Category) => void;
};
type EquipmentCategoryActions = {
  onEdit: (e: EquipmentCategory) => void;
  onClone: (e: EquipmentCategory) => void;
  onExport: (e: EquipmentCategory) => void;
  onDelete: (e: EquipmentCategory) => void;
};

type MealTypeActions = {
  onEdit: (e: MealType) => void;
  onClone: (e: MealType) => void;
  onExport: (e: MealType) => void;
  onDelete: (e: MealType) => void;
};

interface CardDetail {
  key: string;
  icon: React.ElementType;
  text: string | number;
  title?: string;
  className?: string;
}

interface CardViewConfig<T> {
  title: (entity: T) => string;
  details?: (entity: T) => CardDetail[];
  listItem?: { title: (entity: T) => string };
}

interface ListItemViewConfig<T> {
  title: (entity: T, context?: Record<string, unknown>) => string;
  details?: (entity: T, context?: Record<string, unknown>) => (string | React.ReactNode)[];
  actions?: (handlers: ActionHandler<T>) => MenuItem[];
}

interface MenuItem {
  label: string;
  icon: React.ElementType;
  onClick: (...args: any[]) => void;
  className?: string;
}

type ActionHandler<T> =
  | Record<string, (entity: T) => void>
  | {
      onEdit?: (entity: T) => void;
      onClone?: (entity: T) => void;
      onExport?: (entity: T) => void;
      onDelete?: (entity: T) => void;
      onAddToTrip?: (entity: T) => void;
    };

interface EntityConfig<T> {
  getIcon: (entity: T, context?: Record<string, unknown>) => React.ElementType;
  getIconColor?: (entity: T, context?: Record<string, unknown>) => string;
  getBorderColor: (entity: T, context?: Record<string, unknown>) => string;
  views: {
    card: CardViewConfig<T>;
    listItem: ListItemViewConfig<T>;
  };
  getActions: (handlers: ActionHandler<T>) => MenuItem[];
}

// --- TRIP ---
export const tripEntityConfig: EntityConfig<Trip> = {
  getIcon: (trip) => DIFFICULTY_CONFIG[trip.difficulty].icon,
  getIconColor: (trip) => DIFFICULTY_CONFIG[trip.difficulty].colorClassName,
  getBorderColor: (trip) => {
    const status = getEffectiveStatus(trip);
    return status === 'planning' ? '#f97316' : status === 'active' ? '#8b5cf6' : '#6b7280';
  },
  views: {
    card: {
      title: (trip) => trip.name,
      subtitle: (trip) => STATUS_CONFIG[getEffectiveStatus(trip)].label,
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
        <span key="date" className="flex items-center gap-1">
          <Calendar className="w-3 h-3" /> {formatDate(trip.startDate)}
        </span>,
        <span key="status">{STATUS_CONFIG[getEffectiveStatus(trip)].label}</span>,
      ],
      actions: (handlers) => [
        { label: 'Открыть', icon: ExternalLink, onClick: handlers.onView },
        {
          label: 'Убрать из списка',
          icon: Trash2,
          onClick: handlers.onRemove,
          className: 'text-danger',
        },
      ],
    },
  },
  getActions: (handlers: TripActions) => [
    { label: 'Редактировать', icon: Edit, onClick: handlers.onEdit },
    { label: 'Клонировать', icon: Copy, onClick: handlers.onClone },
    { label: 'Экспорт', icon: Share, onClick: handlers.onExport },
    { label: 'Удалить', icon: Trash2, onClick: handlers.onDelete, className: 'text-danger' },
  ],
};

// --- PARTICIPANT ---
export const participantEntityConfig: EntityConfig<Participant> = {
  getIcon: (p) => EXPERIENCE_CONFIG[p.experienceLevel].icon,
  getIconColor: (p) => EXPERIENCE_CONFIG[p.experienceLevel].colorClassName,
  getBorderColor: (p) => GENDER_CONFIG[p.gender].color,
  views: {
    card: {
      title: (p) => p.name,
      subtitle: (p) => {
        const age = calculateAge(p.birthDate);
        return age ? `${age} лет` : p.age === 'child' ? 'Ребенок' : 'Взрослый';
      },
      details: (p, context) => [
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
      details: (p) => [EXPERIENCE_CONFIG[p.experienceLevel].label],
      actions: (handlers) => [
        { label: 'Открыть', icon: ExternalLink, onClick: handlers.onView },
        { label: 'Удалить', icon: Trash2, onClick: handlers.onRemove, className: 'text-danger' },
      ],
    },
  },
  getActions: (handlers: ParticipantActions) => [
    { label: 'Редактировать', icon: Edit, onClick: handlers.onEdit },
    { label: 'Добавить в поход', icon: MapPinPlus, onClick: handlers.onAddToTrip },
    { label: 'Клонировать', icon: Copy, onClick: handlers.onClone },
    { label: 'Экспорт', icon: Share, onClick: handlers.onExport },
    { label: 'Удалить', icon: Trash2, onClick: handlers.onDelete, className: 'text-danger' },
  ],
};

// --- PRODUCT ---
export const productEntityConfig: EntityConfig<Product> = {
  getIcon: () => Component,
  getIconColor: (_p, _ctx) => /*category ? 'text-current' : */ 'text-navy-500',
  getBorderColor: (_p, ctx) => '#0ea5e9',
  views: {
    card: {
      title: (product) => product.name,
      subtitle: (_p, ctx) => (ctx?.category as Category)?.name || 'Без категории',
      details: (product) => [
        { key: 'calories', icon: Flame, text: `${product.calories} ккал`, title: 'Ккал на 100г' },
      ],
    },
    listItem: {
      title: (p) => p.name,
      details: (_p, ctx) => [
        <span key="w" className="flex items-center gap-1">
          <Scale className="w-3 h-3" /> {(ctx?.dishProduct as DishProduct)?.weight} г
        </span>,
      ],
      actions: (handlers) => [
        { label: 'Открыть', icon: ExternalLink, onClick: handlers.onView },
        { label: 'Изменить вес', icon: Edit, onClick: handlers.onEditPortion },
        { label: 'Убрать', icon: Trash2, onClick: handlers.onRemove, className: 'text-danger' },
      ],
    },
  },
  getActions: (handlers: ProductActions) => [
    { label: 'Редактировать', icon: Edit, onClick: handlers.onEdit },
    { label: 'Клонировать', icon: Copy, onClick: handlers.onClone },
    { label: 'Экспорт', icon: Share, onClick: handlers.onExport },
    { label: 'Удалить', icon: Trash2, onClick: handlers.onDelete, className: 'text-danger' },
  ],
};

// --- DISH ---
export const dishEntityConfig: EntityConfig<Dish> = {
  getIcon: () => Soup,
  getIconColor: () => 'text-autumn-leaf-500',
  getBorderColor: () => 'oklch(69.78% 0.197 45.40)',
  views: {
    card: {
      title: (dish) => dish.name,
      details: (_dish) => [],
    },
    listItem: {
      title: (d) => d.name,
    },
  },
  getActions: (handlers: DishActions) => [
    { label: 'Редактировать', icon: Edit, onClick: handlers.onEdit },
    { label: 'Клонировать', icon: Copy, onClick: handlers.onClone },
    { label: 'Экспорт', icon: Share, onClick: handlers.onExport },
    { label: 'Удалить', icon: Trash2, onClick: handlers.onDelete, className: 'text-danger' },
  ],
};

// --- EQUIPMENT ---
export const equipmentEntityConfig: EntityConfig<Equipment> = {
  getIcon: () => Backpack,
  getIconColor: (_e, _ctx) => /*category ? 'text-current' : */ 'text-gray-500',
  getBorderColor: (_e, ctx) => '#6b7280',
  views: {
    card: {
      title: (e) => e.name,
      subtitle: (_e, ctx) => (ctx?.category as Category)?.name || 'Без категории',
      details: (e, ctx) => [
        { key: 'weight', icon: Scale, text: ctx?.formattedWeight as string, title: 'Вес' },
        {
          key: 'type',
          icon: e.type === 'personal' ? User : Users,
          text: e.type === 'personal' ? 'Личное' : 'Общее',
          title: 'Тип',
        },
        ...(ctx?.owner
          ? [{ key: 'owner', icon: User, text: (ctx.owner as Participant).name, title: 'Владелец' }]
          : []),
      ],
    },
    listItem: {
      title: (e) => e.name,
      details: (e, ctx) => [ctx?.formattedWeight as string],
      actions: (handlers) => [{ label: 'Открыть', icon: ExternalLink, onClick: handlers.onView }],
    },
  },
  getActions: (handlers: EquipmentActions) => [
    { label: 'Редактировать', icon: Edit, onClick: handlers.onEdit },
    { label: 'Клонировать', icon: Copy, onClick: handlers.onClone },
    { label: 'Экспорт', icon: Share, onClick: handlers.onExport },
    { label: 'Удалить', icon: Trash2, onClick: handlers.onDelete, className: 'text-danger' },
  ],
};

// --- CATEGORY ---
export const categoryEntityConfig: EntityConfig<Category> = {
  getIcon: () => Tag,
  getIconColor: () => 'text-gray-500',
  getBorderColor: () => '#6b7280',
  views: {
    card: {
      title: (c) => c.name,
      subtitle: (_c, ctx) => `${ctx?.productCount || 0} продуктов`,
      details: (c, ctx) => [
        { key: 'products', icon: Component, text: ctx?.productCount as number, title: 'Продукты' },
      ],
    },
    listItem: { title: (c) => c.name },
  },
  getActions: (handlers: CategoryActions) => [
    { label: 'Редактировать', icon: Edit, onClick: handlers.onEdit },
    { label: 'Клонировать', icon: Copy, onClick: handlers.onClone },
    { label: 'Экспорт', icon: Share, onClick: handlers.onExport },
    { label: 'Удалить', icon: Trash2, onClick: handlers.onDelete, className: 'text-danger' },
  ],
};

// --- MEAL TYPE ---
export const mealTypeEntityConfig: EntityConfig<MealType> = {
  getIcon: () => Tag,
  getIconColor: () => 'text-gray-500',
  getBorderColor: () => '#6b7280',
  views: {
    card: {
      title: (mt) => mt.name,
      details: () => [],
    },
    listItem: { title: (mt) => mt.name },
  },
  getActions: (handlers: MealTypeActions) => [
    { label: 'Редактировать', icon: Edit, onClick: handlers.onEdit },
    { label: 'Клонировать', icon: Copy, onClick: handlers.onClone },
    { label: 'Экспорт', icon: Share, onClick: handlers.onExport },
    { label: 'Удалить', icon: Trash2, onClick: handlers.onDelete, className: 'text-danger' },
  ],
};

// --- EQUIP CATEGORY ---
export const equipmentCategoryEntityConfig: EntityConfig<EquipmentCategory> = {
  getIcon: () => Layers,
  getIconColor: () => 'text-gray-500',
  getBorderColor: () => '#6b7280',
  views: {
    card: {
      title: (c) => c.name,
      details: () => [],
    },
    listItem: { title: (c) => c.name },
  },
  getActions: (handlers: EquipmentCategoryActions) => [
    { label: 'Редактировать', icon: Edit, onClick: handlers.onEdit },
    { label: 'Клонировать', icon: Copy, onClick: handlers.onClone },
    { label: 'Экспорт', icon: Share, onClick: handlers.onExport },
    { label: 'Удалить', icon: Trash2, onClick: handlers.onDelete, className: 'text-danger' },
  ],
};

// Экспортируем для использования в других компонентах
export { STATUS_CONFIG, getEffectiveStatus };
