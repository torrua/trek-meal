// src/stores/useCategoryStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'react-hot-toast';
import type { Category, CategoryData, Product } from '../types';
import useProductStore from './useProductStore';

interface CategoryState {
  categories: Category[];
  addCategory: (data: CategoryData) => Category;
  updateCategory: (id: number, data: CategoryData) => void;
  deleteCategory: (id: number) => void;
}

const useCategoryStore = create<CategoryState>()(
  persist(
    (set, get) => ({
      categories: [
        { id: 1, name: 'Крупы и макароны', color: '#f59e0b', emoji: '🌾' },
        { id: 2, name: 'Консервы', color: '#84cc16', emoji: '🥫' },
        { id: 3, name: 'Мясо и сублиматы', color: '#ef4444', emoji: '🥩' },
        { id: 4, name: 'Сладкое и снеки', color: '#d946ef', emoji: '🍪' },
        { id: 5, name: 'Напитки', color: '#3b82f6', emoji: '☕' },
        { id: 6, name: 'Молочные продукты', color: '#6366f1', emoji: '🥛' },
        { id: 7, name: 'Овощи и фрукты', color: '#22c55e', emoji: '🥕' },
        { id: 8, name: 'Специи и соусы', color: '#a855f7', emoji: '🧂' },
        { id: 9, name: 'Хлеб и выпечка', color: '#eab308', emoji: '🥖' },
      ],
      addCategory: (data: CategoryData) => {
        const newCategory = { id: Date.now(), ...data };
        set((state) => ({ categories: [...state.categories, newCategory] }));
        toast.success(`Категория "${data.name}" добавлена.`);
        return newCategory;
      },
      updateCategory: (id: number, data: CategoryData) => {
        set((state) => ({
          categories: state.categories.map((c) => (c.id === id ? { ...c, ...data } : c)),
        }));
        toast.success(`Категория "${data.name}" обновлена.`);
      },
      deleteCategory: (id: number) => {
        const categoryToDelete = get().categories.find((c) => c.id === id);
        if (!categoryToDelete) return;

        // "Отвязываем" продукты от удаляемой категории
        const productsToUpdate = useProductStore
          .getState()
          .products.filter((p: Product) => p.categoryId === id);
        productsToUpdate.forEach((p: Product) => {
          useProductStore.getState().updateProduct(p.id, { ...p, categoryId: null });
        });

        set((state) => ({
          categories: state.categories.filter((c) => c.id !== id),
        }));
        toast.success(`Категория "${categoryToDelete.name}" удалена.`);
      },
    }),
    {
      name: 'category-storage',
    }
  )
);

export default useCategoryStore;
