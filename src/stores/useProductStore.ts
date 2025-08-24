// src/stores/useProductStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'react-hot-toast';
import type { Product, ProductData } from '../types';
import useDishStore from './useDishStore'; // <-- Импортируем стор блюд для проверки

interface ProductState {
  products: Product[];
  addProduct: (data: ProductData) => void;
  updateProduct: (id: number, data: ProductData) => void;
  deleteProduct: (id: number) => void;
  removeCategoryFromProducts: (categoryId: number) => void;
}

const useProductStore = create<ProductState>()(
  persist(
    (set, get) => ({
      products: [],

      addProduct: (productData) => {
        const newProduct: Product = {
          ...productData,
          id: Date.now(),
          calories: Number(productData.calories) || 0,
          proteins: Number(productData.proteins) || 0,
          fats: Number(productData.fats) || 0,
          carbs: Number(productData.carbs) || 0,
          categoryId: productData.categoryId ? Number(productData.categoryId) : null,
          portions: productData.portions.map((p) => ({
            ...p,
            weight: Number(p.weight) || 0,
          })),
        };
        set((state) => ({ products: [...state.products, newProduct] }));
        toast.success(`Продукт "${newProduct.name}" добавлен.`);
      },

      updateProduct: (id, updatedData) => {
        set((state) => ({
          products: state.products.map((p) => (p.id === id ? { ...p, ...updatedData } : p)),
        }));
        toast.success(`Продукт "${updatedData.name}" обновлен.`);
      },

      // --- ШАГ 3: ОБНОВЛЕННАЯ ЛОГИКА УДАЛЕНИЯ ---
      deleteProduct: (id) => {
        // 1. Проверяем, используется ли продукт, через другой стор.
        const isUsed = useDishStore.getState().isProductInUse(id);

        if (isUsed) {
          // 2. Если используется - блокируем удаление и информируем пользователя.
          toast.error(
            'Невозможно удалить продукт, так как он используется в одном или нескольких блюдах. Сначала удалите его из блюд.',
            { duration: 5000 } // Увеличиваем длительность, чтобы пользователь успел прочитать
          );
          return; // Прерываем выполнение функции
        }

        // 3. Если не используется - безопасно удаляем.
        const productToDelete = get().products.find((p) => p.id === id);
        if (productToDelete) {
          set((state) => ({
            products: state.products.filter((p) => p.id !== id),
          }));
          toast.success(`Продукт "${productToDelete.name}" удален.`);
        }
      },

      removeCategoryFromProducts: (categoryId) => {
        set((state) => ({
          products: state.products.map((product) =>
            product.categoryId === categoryId ? { ...product, categoryId: null } : product
          ),
        }));
      },
    }),
    { name: 'trek-meal-products' }
  )
);

export default useProductStore;
