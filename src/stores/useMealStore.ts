// src/stores/useMealStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { Meal, MealData } from '../types';
import { toast } from 'react-hot-toast';

interface MealStore {
  meals: Meal[];
  nextId: number;
  addMeal: (mealData: MealData) => Meal;
  updateMeal: (id: number, mealData: Partial<MealData>) => void;
  removeMeal: (id: number) => void;
  getMealById: (id: number) => Meal | undefined;
}

export const useMealStore = create<MealStore>()(
  persist(
    (set, get) => ({
      meals: [],
      nextId: 1,
      addMeal: (mealData) => {
        const newMeal: Meal = {
          id: get().nextId,
          ...mealData,
        };
        set((state) => ({
          meals: [...state.meals, newMeal],
          nextId: state.nextId + 1,
        }));
        toast.success(`Приём пищи "${newMeal.name}" создан`);
        return newMeal;
      },
      updateMeal: (id, mealData) => {
        set((state) => ({
          meals: state.meals.map((meal) => (meal.id === id ? { ...meal, ...mealData } : meal)),
        }));
        toast.success('Приём пищи обновлен');
      },
      removeMeal: (id) => {
        const mealToRemove = get().meals.find((m) => m.id === id);
        if (!mealToRemove) return;

        // Здесь в будущем можно добавить проверку, используется ли этот приём пищи в каких-либо походах

        set((state) => ({
          meals: state.meals.filter((meal) => meal.id !== id),
        }));
        toast.success(`Приём пищи "${mealToRemove.name}" удален`);
      },
      getMealById: (id) => {
        return get().meals.find((m) => m.id === id);
      },
    }),
    {
      name: 'meal-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
