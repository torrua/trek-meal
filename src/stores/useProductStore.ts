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
  removeCategoryFromProducts: (categoryId: number) => void;
  removePortionFromProduct: (productId: number, portionName: string) => void;
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

      addMultipleProducts: (productsData) => {
        const newProducts: Product[] = productsData.map((data) => ({
          ...data,
          id: Date.now() + Math.random(), // Добавляем Math.random для уникальности при быстром добавлении
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
    }),
    { name: 'trek-meal-products' }
  )
);

export default useProductStore;
