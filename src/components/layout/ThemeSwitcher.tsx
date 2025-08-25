// src/components/layout/ThemeSwitcher.tsx

import React from 'react';
import useThemeStore, { Theme } from '../../stores/useThemeStore';
import cn from 'classnames';

const themes: { name: Theme; label: string; icon: string }[] = [
  { name: 'light', label: 'Светлая', icon: '☀️' },
  { name: 'dark', label: 'Темная', icon: '🌙' },
  { name: 'sepia', label: 'Сепия', icon: '📜' },
];

const ThemeSwitcher: React.FC = () => {
  const { theme, setTheme } = useThemeStore();

  const baseButtonClass = 'p-2 rounded-md transition-colors duration-200';
  const activeButtonClass = 'bg-blue-600 text-white shadow-sm';
  const inactiveButtonClass = 'hover:bg-secondary';

  return (
    <div className="flex items-center gap-1 p-1 bg-muted rounded-lg border border-primary">
      {themes.map((t) => (
        <button
          key={t.name}
          onClick={() => setTheme(t.name)}
          className={cn(baseButtonClass, {
            [activeButtonClass]: theme === t.name,
            [inactiveButtonClass]: theme !== t.name,
          })}
          title={t.label}
        >
          {t.icon}
        </button>
      ))}
    </div>
  );
};

export default ThemeSwitcher;
