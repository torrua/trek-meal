// src/stores/useThemeStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'light' | 'dark' | 'sepia';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'light', // Тема по умолчанию
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'trek-meal-theme-storage', // Ключ в localStorage
    }
  )
);

export default useThemeStore;
