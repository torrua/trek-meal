// src/stores/useMealTypesStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'react-hot-toast';
import useTripStore from './useTripStore';
import type { MealType as BaseMealType } from '../types';

export interface MealType extends BaseMealType {
  // Keep the existing properties and add repeatable
  repeatable?: boolean;
}

interface MealTypesState {
  mealTypes: MealType[];
  addMealType: (name: string, repeatable?: boolean) => void;
  updateMealType: (id: number, name: string, repeatable?: boolean) => void;
  deleteMealType: (id: number) => void;
  cloneMealType: (id: number) => void;
  setMealTypes: (mealTypes: MealType[]) => void;
}

const useMealTypesStore = create<MealTypesState>()(
  persist(
    (set, get) => ({
      mealTypes: [
        {
          id: 1,
          name: 'Завтрак',
          repeatable: false,
          defaultValues: { name: 'Завтрак', items: [] },
        },
        {
          id: 2,
          name: 'Обед',
          repeatable: false,
          defaultValues: { name: 'Обед', items: [] },
        },
        {
          id: 3,
          name: 'Ужин',
          repeatable: false,
          defaultValues: { name: 'Ужин', items: [] },
        },
      ],

      addMealType: (name, repeatable = false) => {
        const trimmedName = name.trim();
        if (!trimmedName) {
          toast.error('Название не может быть пустым.');
          return;
        }
        if (get().mealTypes.some((mt) => mt.name.toLowerCase() === trimmedName.toLowerCase())) {
          toast.error('Такой прием пищи уже существует.');
          return;
        }
        const newMealType: MealType = {
          id: Date.now(),
          name: trimmedName,
          repeatable,
          defaultValues: { name: trimmedName, items: [] },
        };
        set((state) => ({ mealTypes: [...state.mealTypes, newMealType] }));
        toast.success(`"${trimmedName}" добавлен.`);
      },

      updateMealType: (id, name, repeatable = false) => {
        const trimmedName = name.trim();
        if (!trimmedName) {
          toast.error('Название не может быть пустым.');
          return;
        }
        set((state) => ({
          mealTypes: state.mealTypes.map((mt) =>
            mt.id === id ? { ...mt, name: trimmedName, repeatable } : mt
          ),
        }));
        toast.success('Название обновлено.');
      },

      deleteMealType: (id) => {
        const mealTypeToDelete = get().mealTypes.find((mt) => mt.id === id);
        if (mealTypeToDelete) {
          // Check if meal type is used in any trips before deleting
          const { trips } = useTripStore.getState();
          const isUsed = trips.some(
            (trip) =>
              trip.dayMeals &&
              Object.values(trip.dayMeals).some((mealInstances) =>
                mealInstances.some((instance) => instance.title === mealTypeToDelete.name)
              )
          );

          if (isUsed) {
            toast.error(`Невозможно удалить "${mealTypeToDelete.name}" - используется в походах.`);
            return;
          }

          set((state) => ({
            mealTypes: state.mealTypes.filter((mt) => mt.id !== id),
          }));
          toast.error(`Прием пищи "${mealTypeToDelete.name}" удален.`);
        }
      },

      cloneMealType: (id) => {
        const mealTypeToClone = get().mealTypes.find((mt) => mt.id === id);
        if (mealTypeToClone) {
          const clonedMealType: MealType = {
            ...mealTypeToClone,
            id: Date.now(),
            name: `${mealTypeToClone.name} (Копия)`,
          };
          set((state) => ({ mealTypes: [...state.mealTypes, clonedMealType] }));
          toast.success(`Прием пищи "${mealTypeToClone.name}" клонирован.`);
        }
      },

      setMealTypes: (mealTypes) => {
        set({ mealTypes });
      },
    }),
    { name: 'trek-meal-meal-types' }
  )
);

export default useMealTypesStore;
