// src/stores/useProductStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'react-hot-toast';
import type { Product, ProductData } from '../types';
import useDishStore from './useDishStore';

interface ProductState {
  products: Product[];
  addProduct: (data: ProductData) => void;
  addMultipleProducts: (data: ProductData[]) => void; // --- НОВАЯ ФУНКЦИЯ ---
  updateProduct: (id: number, data: ProductData) => void;
  deleteProduct: (id: number) => void;
  cloneProduct: (id: number) => void;
  removeCategoryFromProducts: (categoryId: number) => void;
  removePortionFromProduct: (productId: number, portionName: string) => void;
}

const useProductStore = create<ProductState>()(
  persist(
    (set, get) => ({
      products: [
        {
          id: 1,
          name: 'Овсяная каша быстрого приготовления',
          description: 'Классическая овсянка с натуральными добавками',
          calories: 342,
          proteins: 12.3,
          fats: 6.2,
          carbs: 56.8,
          isPerishable: false,
          packaging: 'Пакет 500г',
          categoryId: 1,
          portions: [
            { name: 'Порция', weight: 50 },
            { name: 'Двойная порция', weight: 100 },
          ],
        },
        {
          id: 2,
          name: 'Тушенка говяжья',
          description: 'Консервированное мясо высшего сорта',
          calories: 220,
          proteins: 25.0,
          fats: 13.0,
          carbs: 0.0,
          isPerishable: false,
          packaging: 'Банка 350г',
          categoryId: 2,
          portions: [
            { name: 'Половина банки', weight: 175 },
            { name: 'Полная банка', weight: 350 },
          ],
        },
        {
          id: 3,
          name: 'Шоколад темный',
          description: 'Горький шоколад 70% какао',
          calories: 546,
          proteins: 6.2,
          fats: 35.4,
          carbs: 48.2,
          isPerishable: false,
          packaging: 'Плитка 100г',
          categoryId: 3,
          portions: [
            { name: 'Долька', weight: 25 },
            { name: 'Половина плитки', weight: 50 },
            { name: 'Целая плитка', weight: 100 },
          ],
        },
      ],

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

      addMultipleProducts: (productsData) => {
        const newProducts: Product[] = productsData.map((data, index) => ({
          ...data,
          id: Date.now() + index, // Use index instead of Math.random to ensure integer IDs
          calories: Number(data.calories) || 0,
          proteins: Number(data.proteins) || 0,
          fats: Number(data.fats) || 0,
          carbs: Number(data.carbs) || 0,
          categoryId: data.categoryId ? Number(data.categoryId) : null,
          portions: data.portions.map((p) => ({
            ...p,
            weight: Number(p.weight) || 0,
          })),
        }));
        set((state) => ({ products: [...state.products, ...newProducts] }));
        toast.success(`${newProducts.length} продуктов успешно импортировано!`);
      },

      updateProduct: (id, updatedData) => {
        set((state) => ({
          products: state.products.map((p) => (p.id === id ? { ...p, ...updatedData } : p)),
        }));
        toast.success(`Продукт "${updatedData.name}" обновлен.`);
      },

      deleteProduct: (id) => {
        const isUsed = useDishStore.getState().isProductInUse(id);

        if (isUsed) {
          toast.error(
            'Невозможно удалить продукт, так как он используется в одном или нескольких блюдах. Сначала удалите его из блюд.',
            { duration: 5000 }
          );
          return;
        }

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

      removePortionFromProduct: (productId, portionName) => {
        set((state) => ({
          products: state.products.map((product) => {
            if (product.id === productId) {
              const newPortions = product.portions.filter((p) => p.name !== portionName);
              if (newPortions.length === 0) {
                toast.error('Нельзя удалить последнюю порцию у продукта.');
                return product;
              }
              toast.success(`Порция "${portionName}" удалена.`);
              return { ...product, portions: newPortions };
            }
            return product;
          }),
        }));
      },

      cloneProduct: (id) => {
        const productToClone = get().products.find((p) => p.id === id);
        if (productToClone) {
          const clonedProduct: Product = {
            ...productToClone,
            id: Date.now(),
            name: `${productToClone.name} (копия)`,
          };
          set((state) => ({ products: [...state.products, clonedProduct] }));
          toast.success(`Продукт "${productToClone.name}" клонирован.`);
        }
      },
    }),
    { name: 'trek-meal-products' }
  )
);

export default useProductStore;
