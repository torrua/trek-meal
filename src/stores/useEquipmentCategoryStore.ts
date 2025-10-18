// src/stores/useEquipmentCategoryStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'react-hot-toast';

export interface EquipmentCategory {
  id: number;
  name: string;
  color: string;
}

export interface EquipmentCategoryData {
  name: string;
  color: string;
}

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
        { id: 1, name: 'Палатки и тенты', color: '#22c55e' },
        { id: 2, name: 'Рюкзаки и сумки', color: '#3b82f6' },
        { id: 3, name: 'Спальники и коврики', color: '#8b5cf6' },
        { id: 4, name: 'Кухня', color: '#f97316' },
        { id: 5, name: 'Одежда и обувь', color: '#ec4899' },
        { id: 6, name: 'Навигация', color: '#06b6d4' },
        { id: 7, name: 'Инструменты', color: '#ef4444' },
        { id: 8, name: 'Личное', color: '#eab308' },
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
