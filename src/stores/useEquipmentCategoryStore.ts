// src/stores/useEquipmentCategoryStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'react-hot-toast';
import type { EquipmentCategory, EquipmentCategoryData } from '../types';

interface EquipmentCategoryState {
  categories: EquipmentCategory[];
  addCategory: (data: EquipmentCategoryData) => void;
  updateCategory: (id: number, data: EquipmentCategoryData) => void;
  deleteCategory: (id: number) => void;
}

const useEquipmentCategoryStore = create<EquipmentCategoryState>()(
  persist(
    (set, get) => ({
      categories: [
        { id: 1, name: 'Палатки и тенты' },
        { id: 2, name: 'Рюкзаки и сумки' },
        { id: 3, name: 'Спальники и коврики' },
        { id: 4, name: 'Кухня' },
        { id: 5, name: 'Одежда и обувь' },
        { id: 6, name: 'Навигация' },
        { id: 7, name: 'Инструменты' },
        { id: 8, name: 'Личное' },
      ],
      addCategory: (data: EquipmentCategoryData) => {
        const newCategory = { id: Date.now(), ...data };
        set((state) => ({ categories: [...state.categories, newCategory] }));
        toast.success(`Категория "${data.name}" добавлена.`);
      },
      updateCategory: (id: number, data: EquipmentCategoryData) => {
        set((state) => ({
          categories: state.categories.map((c) => (c.id === id ? { ...c, ...data } : c)),
        }));
        toast.success(`Категория "${data.name}" обновлена.`);
      },
      deleteCategory: (id: number) => {
        const categoryName = get().categories.find((c) => c.id === id)?.name;
        set((state) => ({
          categories: state.categories.filter((c) => c.id !== id),
        }));
        if (categoryName) {
          toast.success(`Категория "${categoryName}" удалена.`);
        }
      },
    }),
    {
      name: 'equipment-category-storage',
    }
  )
);

export default useEquipmentCategoryStore;
