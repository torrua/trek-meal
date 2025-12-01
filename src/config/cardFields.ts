// src/config/cardFields.ts
import { EntityType } from '../types';

export interface FieldDefinition {
  id: string;
  label: string;
  defaultVisible: boolean;
}

export const CARD_FIELDS: Record<EntityType, FieldDefinition[]> = {
  products: [
    { id: 'calories', label: 'Калории (ккал)', defaultVisible: true },
    { id: 'proteins', label: 'Белки (г)', defaultVisible: true },
    { id: 'fats', label: 'Жиры (г)', defaultVisible: true },
    { id: 'carbs', label: 'Углеводы (г)', defaultVisible: true },
    { id: 'portions', label: 'Варианты порций', defaultVisible: true },
  ],
  dishes: [
    { id: 'calories', label: 'Калории (ккал)', defaultVisible: true },
    { id: 'proteins', label: 'Белки (г)', defaultVisible: true },
    { id: 'fats', label: 'Жиры (г)', defaultVisible: true },
    { id: 'carbs', label: 'Углеводы (г)', defaultVisible: true },
    { id: 'weight', label: 'Общий вес (г)', defaultVisible: true },
    { id: 'items', label: 'Количество продуктов', defaultVisible: false },
  ],
  trips: [
    { id: 'dates', label: 'Даты похода', defaultVisible: true },
    { id: 'destination', label: 'Место назначения', defaultVisible: true },
    { id: 'participants', label: 'Участники', defaultVisible: true },
  ],
  equipment: [
    { id: 'weight', label: 'Вес (г)', defaultVisible: true },
    { id: 'type', label: 'Тип снаряжения', defaultVisible: true },
  ],
  participants: [
    { id: 'trips', label: 'Количество походов', defaultVisible: true },
    { id: 'equipment', label: 'Количество снаряжения', defaultVisible: true },
  ],
  meals: [
    { id: 'items', label: 'Количество компонентов', defaultVisible: true },
    { id: 'calories', label: 'Калории (ккал)', defaultVisible: true },
    { id: 'proteins', label: 'Белки (г)', defaultVisible: false },
    { id: 'fats', label: 'Жиры (г)', defaultVisible: false },
    { id: 'carbs', label: 'Углеводы (г)', defaultVisible: false },
    { id: 'weight', label: 'Общий вес (г)', defaultVisible: true },
  ],
};
