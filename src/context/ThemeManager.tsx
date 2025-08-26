// src/context/ThemeManager.tsx

import { useEffect } from 'react';
import useThemeStore from '../stores/useThemeStore';

const ThemeManager = () => {
  const { theme } = useThemeStore();

  useEffect(() => {
    const root = window.document.documentElement;
    // Удаляем старый класс (если был)
    root.classList.remove('light', 'dark');
    // Устанавливаем data-атрибут
    root.setAttribute('data-theme', theme);
  }, [theme]);

  return null;
};

export default ThemeManager;
