// src/stores/useMealTypesStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'react-hot-toast';

export interface MealType {
  id: number;
  name: string;
}

interface MealTypesState {
  mealTypes: MealType[];
  addMealType: (name: string) => void;
  updateMealType: (id: number, name: string) => void;
  deleteMealType: (id: number) => void;
  setMealTypes: (mealTypes: MealType[]) => void;
}

const useMealTypesStore = create<MealTypesState>()(
  persist(
    (set, get) => ({
      mealTypes: [
        { id: 1, name: 'Завтрак' },
        { id: 2, name: 'Обед' },
        { id: 3, name: 'Ужин' },
      ],

      addMealType: (name) => {
        const trimmedName = name.trim();
        if (!trimmedName) {
          toast.error('Название не может быть пустым.');
          return;
        }
        if (get().mealTypes.some((mt) => mt.name.toLowerCase() === trimmedName.toLowerCase())) {
          toast.error('Такой прием пищи уже существует.');
          return;
        }
        const newMealType = { id: Date.now(), name: trimmedName };
        set((state) => ({ mealTypes: [...state.mealTypes, newMealType] }));
        toast.success(`"${trimmedName}" добавлен.`);
      },

      updateMealType: (id, name) => {
        const trimmedName = name.trim();
        if (!trimmedName) {
          toast.error('Название не может быть пустым.');
          return;
        }
        set((state) => ({
          mealTypes: state.mealTypes.map((mt) =>
            mt.id === id ? { ...mt, name: trimmedName } : mt
          ),
        }));
        toast.success('Название обновлено.');
      },

      deleteMealType: (id) => {
        const mealTypeToDelete = get().mealTypes.find((mt) => mt.id === id);
        if (mealTypeToDelete) {
          // TODO: Add check for usage in trips
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
