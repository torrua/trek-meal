// src/context/ThemeManager.tsx

import React, { useEffect } from 'react';
import useThemeStore from '../stores/useThemeStore';

// Этот компонент не рендерит ничего видимого.
// Его единственная задача - следить за стором и менять класс на <html>.
const ThemeManager: React.FC = () => {
  const { theme } = useThemeStore();

  useEffect(() => {
    const root = window.document.documentElement;

    // Удаляем старые классы тем
    root.classList.remove('light', 'dark', 'sepia');

    // Добавляем текущий класс темы
    root.classList.add(theme);
  }, [theme]);

  return null; // Этот компонент невидим
};

export default ThemeManager;
