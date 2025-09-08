// src/stores/useMealTypesStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'react-hot-toast';
import useTripStore from './useTripStore';

export interface MealType {
  id: number;
  name: string;
  repeatable?: boolean;
}

interface MealTypesState {
  mealTypes: MealType[];
  addMealType: (name: string, repeatable?: boolean) => void;
  updateMealType: (id: number, name: string, repeatable?: boolean) => void;
  deleteMealType: (id: number) => void;
  setMealTypes: (mealTypes: MealType[]) => void;
}

const useMealTypesStore = create<MealTypesState>()(
  persist(
    (set, get) => ({
      mealTypes: [
        { id: 1, name: 'Завтрак', repeatable: false },
        { id: 2, name: 'Обед', repeatable: false },
        { id: 3, name: 'Ужин', repeatable: false },
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
        const newMealType = { id: Date.now(), name: trimmedName, repeatable };
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
              Object.values(trip.dayMeals).some((mealTypes) =>
                mealTypes.includes(mealTypeToDelete.id)
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

      setMealTypes: (mealTypes) => {
        set({ mealTypes });
      },
    }),
    { name: 'trek-meal-meal-types' }
  )
);

export default useMealTypesStore;
