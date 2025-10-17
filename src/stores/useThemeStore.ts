// src/stores/useThemeStore.ts

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'light';

interface ThemeState {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'light',
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set({ theme: 'light' }),
    }),
    {
      name: 'trek-meal-theme-storage',
    }
  )
);

export default useThemeStore;
