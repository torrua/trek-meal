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
    { id: 'proteins', label: 'Белки', defaultVisible: true },
    { id: 'fats', label: 'Жиры', defaultVisible: true },
    { id: 'carbs', label: 'Углеводы', defaultVisible: true },
    { id: 'portions', label: 'Вариантов порций', defaultVisible: true },
  ],
  dishes: [
    { id: 'calories', label: 'Калории (ккал)', defaultVisible: true },
    { id: 'proteins', label: 'Белки', defaultVisible: true },
    { id: 'fats', label: 'Жиры', defaultVisible: true },
    { id: 'carbs', label: 'Углеводы', defaultVisible: true },
    { id: 'weight', label: 'Общий вес', defaultVisible: true },
  ],
  trips: [
    { id: 'dates', label: 'Даты', defaultVisible: true },
    { id: 'destination', label: 'Место назначения', defaultVisible: true },
    { id: 'participants', label: 'Количество участников', defaultVisible: true },
  ],
  equipment: [
    { id: 'weight', label: 'Вес', defaultVisible: true },
    { id: 'type', label: 'Тип (Личное/Общее)', defaultVisible: true },
  ],
  participants: [
    { id: 'trips', label: 'Походов', defaultVisible: true },
    { id: 'equipment', label: 'Снаряжения', defaultVisible: true },
  ],
  meals: [
    { id: 'items', label: 'Количество компонентов', defaultVisible: true },
    { id: 'calories', label: 'Калории', defaultVisible: true },
    { id: 'weight', label: 'Общий вес', defaultVisible: true },
  ],
};
