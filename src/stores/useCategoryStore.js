import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { toast } from 'react-hot-toast';
import useProductStore from './useProductStore'; // Импортируем для взаимодействия

const useCategoryStore = create(
  persist(
    (set, get) => ({
      // Пример категорий по умолчанию
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
          categories: state.categories.map((c) =>
            c.id === id ? { ...c, ...updatedData } : c
          ),
        }));
        toast.success(`Категория "${updatedData.name}" обновлена.`);
      },

      deleteCategory: (id) => {
        const categoryToDelete = get().categories.find(c => c.id === id);
        if (!categoryToDelete) return;
        
        // ВЗАИМОДЕЙСТВИЕ: Перед удалением категории, "отвязываем" ее от всех продуктов
        useProductStore.getState().removeCategoryFromProducts(id);

        set((state) => ({
          categories: state.categories.filter((c) => c.id !== id),
        }));
        toast.error(`Категория "${categoryToDelete.name}" удалена.`);
      },
    }),
    {
      name: 'trek-meal-categories',
    }
  )
);

export default useCategoryStore;