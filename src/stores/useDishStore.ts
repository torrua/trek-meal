// src/stores/useDishStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'react-hot-toast';
import type { Dish, DishData } from '../types';

// SubmitDishAction теперь в types.ts, так что этот экспорт не нужен

interface DishState {
  dishes: Dish[];
  addDish: (data: DishData) => Dish | undefined;
  updateDish: (id: number, data: DishData) => void;
  deleteDish: (id: number) => void;
  isProductInUse: (productId: number) => boolean;
}

const useDishStore = create<DishState>()(
  persist(
    (set, get) => ({
      dishes: [],

      addDish: (data) => {
        // ... (логика addDish без изменений)
        const newDish: Dish = { ...data, id: Date.now() };
        set(state => ({ dishes: [...state.dishes, newDish] }));
        toast.success(`Блюдо "${data.name}" сохранено!`);
        return newDish;
      },

      updateDish: (id, data) => {
        set(state => ({
          dishes: state.dishes.map(d => d.id === id ? { ...d, ...data } : d)
        }));
        toast.success(`Блюдо "${data.name}" обновлено.`);
      },

      // --- ИЗМЕНЕНИЕ: Возвращаем простую логику удаления ---
      deleteDish: (id) => {
        const dishToDelete = get().dishes.find(d => d.id === id);
        if (dishToDelete) {
          set(state => ({
            dishes: state.dishes.filter(d => d.id !== id)
          }));
          toast.error(`Блюдо "${dishToDelete.name}" удалено.`);
        }
      },

      isProductInUse: (productId: number) => {
        const { dishes } = get();
        return dishes.some(dish => 
          dish.products.some(product => product.productId === productId)
        );
      }
    }),
    { name: 'trek-meal-dishes' }
  )
);

export default useDishStore;