// src/stores/useDishStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'react-hot-toast';
import type { Dish, DishData } from '../types';
import useTripStore from './useTripStore';

interface DishState {
  dishes: Dish[];
  addDish: (data: DishData) => Dish | undefined;
  updateDish: (id: number, data: DishData) => void;
  deleteDish: (id: number) => void;
  removeProductFromDish: (dishId: number, productIndex: number) => void;
  updateProductInDish: (dishId: number, productIndex: number, newWeight: number) => void;
  isProductInUse: (productId: number) => boolean;
}

const useDishStore = create<DishState>()(
  persist(
    (set, get) => ({
      dishes: [],

      addDish: (data) => {
        const trimmedName = data.name.trim();
        if (!trimmedName) {
          toast.error('Название блюда не может быть пустым.');
          return;
        }

        const isDuplicate = get().dishes.some(
          (d) => d.name.trim().toLowerCase() === trimmedName.toLowerCase()
        );

        if (isDuplicate) {
          toast.error(`Блюдо с названием "${trimmedName}" уже существует.`);
          return; // --- ИСПРАВЛЕНИЕ: Прерываем выполнение
        }

        if (data.products.length === 0) {
          toast.error('Блюдо должно содержать хотя бы один продукт.');
          return;
        }

        const newDish: Dish = { ...data, name: trimmedName, id: Date.now() };
        set((state) => ({ dishes: [...state.dishes, newDish] }));
        toast.success(`Блюдо "${newDish.name}" сохранено!`);
        return newDish;
      },

      updateDish: (id, data) => {
        set((state) => ({
          dishes: state.dishes.map((d) => (d.id === id ? { ...d, ...data } : d)),
        }));
        toast.success(`Блюдо "${data.name}" обновлено.`);
      },

      deleteDish: (id) => {
        const isUsed = useTripStore.getState().isDishInUse(id);

        if (isUsed) {
          toast.error(
            'Невозможно удалить блюдо, так как оно используется в одном или нескольких походах. Сначала удалите его из раскладок.',
            { duration: 6000 }
          );
          return;
        }

        const dishToDelete = get().dishes.find((d) => d.id === id);
        if (dishToDelete) {
          set((state) => ({
            dishes: state.dishes.filter((d) => d.id !== id),
          }));
          toast.error(`Блюдо "${dishToDelete.name}" удалено.`);
        }
      },

      removeProductFromDish: (dishId, productIndex) => {
        const dish = get().dishes.find((d) => d.id === dishId);
        if (!dish) return;

        const updatedProducts = dish.products.filter((_, index) => index !== productIndex);

        if (updatedProducts.length === 0) {
          toast.error('Блюдо должно содержать хотя бы один продукт.');
          return;
        }

        set((state) => ({
          dishes: state.dishes.map((d) =>
            d.id === dishId ? { ...d, products: updatedProducts } : d
          ),
        }));
        toast.success('Продукт удален из блюда.');
      },

      updateProductInDish: (dishId, productIndex, newWeight) => {
        if (newWeight <= 0) {
          toast.error('Вес продукта должен быть больше нуля.');
          return;
        }

        set((state) => ({
          dishes: state.dishes.map((d) =>
            d.id === dishId
              ? {
                  ...d,
                  products: d.products.map((product, index) =>
                    index === productIndex ? { ...product, weight: newWeight } : product
                  ),
                }
              : d
          ),
        }));
        toast.success('Вес продукта обновлен.');
      },

      isProductInUse: (productId: number) => {
        const { dishes } = get();
        return dishes.some((dish) =>
          dish.products.some((product) => product.productId === productId)
        );
      },
    }),
    { name: 'trek-meal-dishes' }
  )
);

export default useDishStore;
