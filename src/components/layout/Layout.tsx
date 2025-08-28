// src/components/layout/Layout.tsx

import React, { useEffect } from 'react';
import { NavLink, useLocation, Outlet } from 'react-router-dom';
import cn from 'classnames';
import { Toaster } from 'react-hot-toast';
import useSearchStore from '../../stores/useSearchStore';
import ThemeSwitcher from './ThemeSwitcher';

const navLinkBaseClasses =
  'px-4 py-2 rounded-md cursor-pointer transition-colors duration-200 text-sm font-medium border';
// ИСПРАВЛЕНИЕ: Добавляем цвет 'border-border' для неактивных кнопок
const navLinkInactiveClasses = 'bg-card text-card-foreground border-border hover:bg-muted';
const navLinkActiveClasses = 'bg-primary text-primary-foreground border-primary';

const Layout: React.FC = () => {
  const location = useLocation();
  const isPlanningPage = /^\/trips\/\d+$/.test(location.pathname);
  const { searchTerm, setSearchTerm, clearSearchTerm } = useSearchStore();

  useEffect(() => {
    clearSearchTerm();
  }, [location.pathname, clearSearchTerm]);

  const getPlaceholder = () => {
    if (['/', '/settings'].includes(location.pathname) || isPlanningPage) return 'Поиск недоступен';
    switch (location.pathname) {
      case '/products':
        return 'Поиск по продуктам...';
      case '/dishes':
        return 'Поиск по блюдам...';
      case '/categories':
        return 'Поиск по категориям...';
      case '/participants':
        return 'Поиск по участникам...';
      case '/trips':
        return 'Поиск по походам...';
      default:
        return 'Поиск...';
    }
  };

  const isSearchDisabled = ['/', '/settings'].includes(location.pathname) || isPlanningPage;

  return (
    <div className="max-w-7xl mx-auto p-4 font-sans">
      <Toaster position="bottom-right" />

      {/* ИСПРАВЛЕНИЕ: Добавляем цвет 'border-border' */}
      <header className="text-center mb-6 p-4 bg-card border border-border rounded-lg shadow-sm">
        <h1 className="text-3xl font-bold text-foreground">Trek Meal</h1>
        <p className="mt-1 text-sm text-muted-foreground">Планирование питания для походов</p>
      </header>

      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <nav className="flex justify-center gap-2 flex-wrap">
          <NavLink
            to="/"
            className={({ isActive }) =>
              cn(navLinkBaseClasses, isActive ? navLinkActiveClasses : navLinkInactiveClasses)
            }
          >
            Главная
          </NavLink>
          <NavLink
            to="/products"
            className={({ isActive }) =>
              cn(navLinkBaseClasses, isActive ? navLinkActiveClasses : navLinkInactiveClasses)
            }
          >
            Продукты
          </NavLink>
          <NavLink
            to="/dishes"
            className={({ isActive }) =>
              cn(navLinkBaseClasses, isActive ? navLinkActiveClasses : navLinkInactiveClasses)
            }
          >
            Блюда
          </NavLink>
          <NavLink
            to="/categories"
            className={({ isActive }) =>
              cn(navLinkBaseClasses, isActive ? navLinkActiveClasses : navLinkInactiveClasses)
            }
          >
            Категории
          </NavLink>
          <NavLink
            to="/participants"
            className={({ isActive }) =>
              cn(navLinkBaseClasses, isActive ? navLinkActiveClasses : navLinkInactiveClasses)
            }
          >
            Участники
          </NavLink>
          <NavLink
            to="/trips"
            className={({ isActive }) =>
              cn(
                navLinkBaseClasses,
                isActive && !isPlanningPage ? navLinkActiveClasses : navLinkInactiveClasses
              )
            }
          >
            Походы
          </NavLink>
          {isPlanningPage && (
            <NavLink
              to={location.pathname}
              className={cn(navLinkBaseClasses, navLinkActiveClasses)}
            >
              Планирование
            </NavLink>
          )}
          <NavLink
            to="/settings"
            className={({ isActive }) =>
              cn(navLinkBaseClasses, isActive ? navLinkActiveClasses : navLinkInactiveClasses)
            }
          >
            Настройки
          </NavLink>
        </nav>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <input
            type="text"
            placeholder={getPlaceholder()}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={isSearchDisabled}
          />
          <ThemeSwitcher />
        </div>
      </div>

      {/* ИСПРАВЛЕНИЕ: Добавляем цвет 'border-border' */}
      <main className="bg-card border border-border rounded-lg shadow-sm min-h-[600px]">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
