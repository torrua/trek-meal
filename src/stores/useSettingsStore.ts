// src/stores/useSettingsStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { CARD_FIELDS } from '../config/cardFields';
import type { EntityType, FieldConfig } from '../types';

interface SettingsState {
  // Хранит порядок и видимость полей для каждой сущности
  cardViews: Record<EntityType, FieldConfig[]>;

  // Действия
  toggleFieldVisibility: (entity: EntityType, fieldId: string) => void;
  reorderFields: (entity: EntityType, newOrder: FieldConfig[]) => void;
  resetToDefaults: (entity: EntityType) => void;

  // Селектор: возвращает только ID видимых полей в нужном порядке
  getVisibleFields: (entity: EntityType) => string[];
}

// Инициализация дефолтных значений из конфига
const getInitialState = () => {
  const initialState: Partial<Record<EntityType, FieldConfig[]>> = {};

  (Object.keys(CARD_FIELDS) as EntityType[]).forEach((entity) => {
    initialState[entity] = CARD_FIELDS[entity].map((f) => ({
      id: f.id,
      visible: f.defaultVisible,
    }));
  });

  return initialState as Record<EntityType, FieldConfig[]>;
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set, get) => ({
      cardViews: getInitialState(),

      toggleFieldVisibility: (entity, fieldId) =>
        set((state) => {
          const currentFields = state.cardViews[entity] || [];
          const updatedFields = currentFields.map((f) =>
            f.id === fieldId ? { ...f, visible: !f.visible } : f
          );
          return { cardViews: { ...state.cardViews, [entity]: updatedFields } };
        }),

      reorderFields: (entity, newOrder) =>
        set((state) => ({
          cardViews: { ...state.cardViews, [entity]: newOrder },
        })),

      resetToDefaults: (entity) =>
        set((state) => ({
          cardViews: {
            ...state.cardViews,
            [entity]: CARD_FIELDS[entity].map((f) => ({
              id: f.id,
              visible: f.defaultVisible,
            })),
          },
        })),

      getVisibleFields: (entity) => {
        const config = get().cardViews[entity];
        // Если конфига в сторе нет (например, старая версия), берем дефолт
        if (!config) {
          return CARD_FIELDS[entity].filter((f) => f.defaultVisible).map((f) => f.id);
        }
        return config.filter((f) => f.visible).map((f) => f.id);
      },
    }),
    {
      name: 'camp-queen-view-settings', // Уникальное имя для localStorage
    }
  )
);
