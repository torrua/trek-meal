// src/stores/useEquipmentCategoryStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'react-hot-toast';
import useEquipmentStore from './useEquipmentStore';
import type { EquipmentCategory, EquipmentCategoryData } from '../types';

interface EquipmentCategoryState {
  categories: EquipmentCategory[];
  addCategory: (data: EquipmentCategoryData) => EquipmentCategory;
  updateCategory: (id: number, data: EquipmentCategoryData) => void;
  deleteCategory: (id: number) => void;
}

const useEquipmentCategoryStore = create<EquipmentCategoryState>()(
  persist(
    (set, get) => ({
      categories: [
        { id: 1, name: 'Палатки и тенты', color: '#ef4444', emoji: '⛺' },
        { id: 2, name: 'Спальные системы', color: '#3b82f6', emoji: '🛌' },
        { id: 3, name: 'Кухонное оборудование', color: '#f59e0b', emoji: '🍳' },
        { id: 4, name: 'Одежда и обувь', color: '#22c55e', emoji: '👕' },
        { id: 5, name: 'Инструменты и навигация', color: '#8b5cf6', emoji: '🧭' },
        { id: 6, name: 'Безопасность и медицина', color: '#ec4899', emoji: '⛑️' },
      ],

      addCategory: (categoryData) => {
        const trimmedName = categoryData.name.trim();
        if (!trimmedName) {
          toast.error('Название категории не может быть пустым.');
          throw new Error('Empty category name');
        }

        const isDuplicate = get().categories.some(
          (c) => c.name.trim().toLowerCase() === trimmedName.toLowerCase()
        );

        if (isDuplicate) {
          toast.error(`Категория с названием "${trimmedName}" уже существует.`);
          throw new Error('Duplicate category name');
        }

        const newCategory = {
          ...categoryData,
          name: trimmedName,
          id: Date.now(),
        };
        set((state) => ({ categories: [...state.categories, newCategory] }));
        toast.success(`Категория снаряжения "${newCategory.name}" добавлена.`);
        return newCategory;
      },

      updateCategory: (id, updatedData) => {
        const trimmedName = updatedData.name.trim();
        if (!trimmedName) {
          toast.error('Название категории не может быть пустым.');
          return;
        }

        // Check for duplicates (excluding current category)
        const isDuplicate = get().categories.some(
          (c) => c.id !== id && c.name.trim().toLowerCase() === trimmedName.toLowerCase()
        );

        if (isDuplicate) {
          toast.error(`Категория с названием "${trimmedName}" уже существует.`);
          return;
        }

        set((state) => ({
          categories: state.categories.map((c) =>
            c.id === id ? { ...c, ...updatedData, name: trimmedName } : c
          ),
        }));
        toast.success(`Категория снаряжения "${trimmedName}" обновлена.`);
      },

      deleteCategory: (id) => {
        const categoryToDelete = get().categories.find((c) => c.id === id);
        if (!categoryToDelete) return;

        // Remove category from all equipment that use it
        useEquipmentStore.getState().removeCategoryFromEquipment(id);

        set((state) => ({
          categories: state.categories.filter((c) => c.id !== id),
        }));
        toast.error(`Категория снаряжения "${categoryToDelete.name}" удалена.`);
      },
    }),
    { name: 'trek-meal-equipment-categories' }
  )
);

export default useEquipmentCategoryStore;
