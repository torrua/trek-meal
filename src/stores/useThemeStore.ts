// src/stores/useThemeStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'light' | 'dark'; // <-- Убираем 'sepia'

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void; // <-- Добавляем удобную функцию-переключатель
}

const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'light',
      setTheme: (theme) => set({ theme }),
      // --- НОВАЯ ФУНКЦИЯ ---
      // Переключает тему на противоположную
      toggleTheme: () => set((state) => ({ theme: state.theme === 'light' ? 'dark' : 'light' })),
    }),
    {
      name: 'trek-meal-theme-storage',
    }
  )
);

export default useThemeStore;
