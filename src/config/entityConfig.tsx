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
type _TripActions = ActionHandler<Trip> & {
  onEdit?: (entity: Trip) => void;
  onClone?: (entity: Trip) => void;
  onExport?: (entity: Trip) => void;
  onDelete?: (entity: Trip) => void;
  onView?: (entity: Trip) => void;
  onRemove?: (entity: Trip) => void;
};

type _ParticipantActions = ActionHandler<Participant> & {
  onEdit?: (entity: Participant) => void;
  onAddToTrip?: (entity: Participant) => void;
  onClone?: (entity: Participant) => void;
  onExport?: (entity: Participant) => void;
  onDelete?: (entity: Participant) => void;
  onView?: (entity: Participant) => void;
  onRemove?: (entity: Participant) => void;
};

type _ProductActions = ActionHandler<Product> & {
  onEdit?: (entity: Product) => void;
  onClone?: (entity: Product) => void;
  onExport?: (entity: Product) => void;
  onDelete?: (entity: Product) => void;
  onView?: (entity: Product) => void;
  onEditPortion?: (entity: Product) => void;
  onRemove?: (entity: Product) => void;
};

type _DishActions = ActionHandler<Dish> & {
  onEdit?: (entity: Dish) => void;
  onClone?: (entity: Dish) => void;
  onExport?: (entity: Dish) => void;
  onDelete?: (entity: Dish) => void;
};

type _EquipmentActions = ActionHandler<Equipment> & {
  onEdit?: (entity: Equipment) => void;
  onClone?: (entity: Equipment) => void;
  onExport?: (entity: Equipment) => void;
  onDelete?: (entity: Equipment) => void;
  onView?: (entity: Equipment) => void;
};

type _CategoryActions = ActionHandler<Category> & {
  onEdit?: (entity: Category) => void;
  onClone?: (entity: Category) => void;
  onExport?: (entity: Category) => void;
  onDelete?: (entity: Category) => void;
};

type _EquipmentCategoryActions = ActionHandler<EquipmentCategory> & {
  onEdit?: (entity: EquipmentCategory) => void;
  onClone?: (entity: EquipmentCategory) => void;
  onExport?: (entity: EquipmentCategory) => void;
  onDelete?: (entity: EquipmentCategory) => void;
};

type _MealTypeActions = ActionHandler<MealType> & {
  onEdit?: (entity: MealType) => void;
  onClone?: (entity: MealType) => void;
  onExport?: (entity: MealType) => void;
  onDelete?: (entity: MealType) => void;
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
  subtitle?: (entity: T, context?: Record<string, unknown>) => string;
  details?: (entity: T, context?: Record<string, unknown>) => CardDetail[];
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
  onClick: (...args: Record<string, unknown>[]) => void;
  className?: string;
}

type ActionHandler<T = Record<string, unknown>> =
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
  getActions: <A extends ActionHandler<T>>(handlers: A) => MenuItem[];
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
      actions: (_handlers) => [
        { label: 'Открыть', icon: ExternalLink, onClick: () => console.log('Open trip') },
        {
          label: 'Убрать из списка',
          icon: Trash2,
          onClick: () => console.log('Remove trip from list'),
          className: 'text-danger',
        },
      ],
    },
  },
  getActions: (_handlers) => [
    { label: 'Редактировать', icon: Edit, onClick: () => console.log('Edit trip') },
    { label: 'Клонировать', icon: Copy, onClick: () => console.log('Clone trip') },
    { label: 'Экспорт', icon: Share, onClick: () => console.log('Export trip') },
    {
      label: 'Удалить',
      icon: Trash2,
      onClick: () => console.log('Delete trip'),
      className: 'text-danger',
    },
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
      details: (p, ctx) => [
        { key: 'trips', icon: MapPin, text: ctx?.tripCount as number, title: 'Походы' },
        {
          key: 'equipment',
          icon: Backpack,
          text: ctx?.equipmentCount as number,
          title: 'Снаряжение',
        },
      ],
    },
    listItem: {
      title: (p) => p.name,
      details: (p) => [EXPERIENCE_CONFIG[p.experienceLevel].label],
      actions: (_handlers) => [
        { label: 'Открыть', icon: ExternalLink, onClick: () => console.log('Open participant') },
        {
          label: 'Удалить',
          icon: Trash2,
          onClick: () => console.log('Delete participant'),
          className: 'text-danger',
        },
      ],
    },
  },
  getActions: (_handlers) => [
    { label: 'Редактировать', icon: Edit, onClick: () => console.log('Edit participant') },
    {
      label: 'Добавить в поход',
      icon: MapPinPlus,
      onClick: () => console.log('Add participant to trip'),
    },
    { label: 'Клонировать', icon: Copy, onClick: () => console.log('Clone participant') },
    { label: 'Экспорт', icon: Share, onClick: () => console.log('Export participant') },
    {
      label: 'Удалить',
      icon: Trash2,
      onClick: () => console.log('Delete participant'),
      className: 'text-danger',
    },
  ],
};

// --- PRODUCT ---
export const productEntityConfig: EntityConfig<Product> = {
  getIcon: () => Component,
  getIconColor: (_p, _ctx) => 'text-[#0277BD]',
  getBorderColor: (_p, _ctx) => '#0ea5e9',
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
      actions: (_handlers) => [
        { label: 'Открыть', icon: ExternalLink, onClick: () => console.log('Open product') },
        { label: 'Изменить вес', icon: Edit, onClick: () => console.log('Edit product portion') },
        {
          label: 'Убрать',
          icon: Trash2,
          onClick: () => console.log('Remove product'),
          className: 'text-danger',
        },
      ],
    },
  },
  getActions: (_handlers) => [
    { label: 'Редактировать', icon: Edit, onClick: () => console.log('Edit product') },
    { label: 'Клонировать', icon: Copy, onClick: () => console.log('Clone product') },
    { label: 'Экспорт', icon: Share, onClick: () => console.log('Export product') },
    {
      label: 'Удалить',
      icon: Trash2,
      onClick: () => console.log('Delete product'),
      className: 'text-danger',
    },
  ],
};

// --- DISH ---
export const dishEntityConfig: EntityConfig<Dish> = {
  getIcon: () => Soup,
  getIconColor: () => 'text-[#EF6C00]',
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
  getActions: (_handlers) => [
    { label: 'Редактировать', icon: Edit, onClick: () => console.log('Edit dish') },
    { label: 'Клонировать', icon: Copy, onClick: () => console.log('Clone dish') },
    { label: 'Экспорт', icon: Share, onClick: () => console.log('Export dish') },
    {
      label: 'Удалить',
      icon: Trash2,
      onClick: () => console.log('Delete dish'),
      className: 'text-danger',
    },
  ],
};

// --- EQUIPMENT ---
export const equipmentEntityConfig: EntityConfig<Equipment> = {
  getIcon: () => Backpack,
  getIconColor: (_e, _ctx) => 'text-[#283593]',
  getBorderColor: (_e, _ctx) => '#6b7280',
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
      actions: (_handlers) => [
        { label: 'Просмотр', icon: ExternalLink, onClick: () => console.log('View equipment') },
        { label: 'Редактировать', icon: Edit, onClick: () => console.log('Edit equipment') },
        {
          label: 'Добавить в поход',
          icon: MapPinPlus,
          onClick: () => console.log('Add equipment to trip'),
        },
        { label: 'Клонировать', icon: Copy, onClick: () => console.log('Clone equipment') },
        { label: 'Экспорт', icon: Share, onClick: () => console.log('Export equipment') },
        {
          label: 'Удалить',
          icon: Trash2,
          onClick: () => console.log('Delete equipment'),
          className: 'text-danger',
        },
      ],
    },
  },
  getActions: (_handlers) => [
    { label: 'Редактировать', icon: Edit, onClick: () => console.log('Edit equipment') },
    { label: 'Клонировать', icon: Copy, onClick: () => console.log('Clone equipment') },
    { label: 'Экспорт', icon: Share, onClick: () => console.log('Export equipment') },
    {
      label: 'Удалить',
      icon: Trash2,
      onClick: () => console.log('Delete equipment'),
      className: 'text-danger',
    },
  ],
};

// --- CATEGORY ---
export const categoryEntityConfig: EntityConfig<Category> = {
  getIcon: () => Tag,
  getIconColor: () => 'text-[#F57F17]',
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
  getActions: (_handlers) => [
    { label: 'Редактировать', icon: Edit, onClick: () => console.log('Edit category') },
    { label: 'Клонировать', icon: Copy, onClick: () => console.log('Clone category') },
    { label: 'Экспорт', icon: Share, onClick: () => console.log('Export category') },
    {
      label: 'Удалить',
      icon: Trash2,
      onClick: () => console.log('Delete category'),
      className: 'text-danger',
    },
  ],
};

// --- MEAL TYPE ---
export const mealTypeEntityConfig: EntityConfig<MealType> = {
  getIcon: () => Tag,
  getIconColor: () => 'text-[#F57F17]',
  getBorderColor: () => '#6b7280',
  views: {
    card: {
      title: (mt) => mt.name,
      details: () => [],
    },
    listItem: { title: (mt) => mt.name },
  },
  getActions: (_handlers) => [
    { label: 'Редактировать', icon: Edit, onClick: () => console.log('Edit meal type') },
    { label: 'Клонировать', icon: Copy, onClick: () => console.log('Clone meal type') },
    { label: 'Экспорт', icon: Share, onClick: () => console.log('Export meal type') },
    {
      label: 'Удалить',
      icon: Trash2,
      onClick: () => console.log('Delete meal type'),
      className: 'text-danger',
    },
  ],
};

// --- EQUIP CATEGORY ---
export const equipmentCategoryEntityConfig: EntityConfig<EquipmentCategory> = {
  getIcon: () => Layers,
  getIconColor: () => 'text-[#F57F17]',
  getBorderColor: () => '#6b7280',
  views: {
    card: {
      title: (c) => c.name,
      details: () => [],
    },
    listItem: { title: (c) => c.name },
  },
  getActions: (_handlers) => [
    { label: 'Редактировать', icon: Edit, onClick: () => console.log('Edit equipment category') },
    { label: 'Клонировать', icon: Copy, onClick: () => console.log('Clone equipment category') },
    { label: 'Экспорт', icon: Share, onClick: () => console.log('Export equipment category') },
    {
      label: 'Удалить',
      icon: Trash2,
      onClick: () => console.log('Delete equipment category'),
      className: 'text-danger',
    },
  ],
};

// Экспортируем для использования в других компонентах
export { STATUS_CONFIG, getEffectiveStatus };
