import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'react-hot-toast';
import useProductStore from './useProductStore';
import type { Category, CategoryData } from '../types';

interface CategoryState {
  categories: Category[];
  addCategory: (data: CategoryData) => void;
  updateCategory: (id: number, data: CategoryData) => void;
  deleteCategory: (id: number) => void;
}

const useCategoryStore = create<CategoryState>()(
  persist(
    (set, get) => ({
      categories: [
        { id: 1, name: 'Крупы и макароны', color: '#f59e0b' },
        { id: 2, name: 'Мясо и сублиматы', color: '#ef4444' },
        { id: 3, name: 'Сладкое и снеки', color: '#a855f7' },
      ],

      addCategory: (categoryData) => {
        const newCategory = { ...categoryData, id: Date.now() };
        set((state) => ({ categories: [...state.categories, newCategory] }));
        toast.success(`Категория "${newCategory.name}" добавлена.`);
      },

      updateCategory: (id, updatedData) => {
        set((state) => ({
          categories: state.categories.map((c) => (c.id === id ? { ...c, ...updatedData } : c)),
        }));
        toast.success(`Категория "${updatedData.name}" обновлена.`);
      },

      deleteCategory: (id) => {
        const categoryToDelete = get().categories.find((c) => c.id === id);
        if (!categoryToDelete) return;

        useProductStore.getState().removeCategoryFromProducts(id);

        set((state) => ({
          categories: state.categories.filter((c) => c.id !== id),
        }));
        toast.error(`Категория "${categoryToDelete.name}" удалена.`);
      },
    }),
    { name: 'trek-meal-categories' }
  )
);

export default useCategoryStore;
