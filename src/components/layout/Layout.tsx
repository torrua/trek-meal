// src/components/layout/Layout.tsx

import React, { useEffect } from 'react';
import { NavLink, useLocation, Outlet } from 'react-router-dom';
import cn from 'classnames';
import { Toaster } from 'react-hot-toast';
import useSearchStore from '../../stores/useSearchStore'; // <-- Импортируем новый стор

const navLinkBaseClasses =
  'px-4 py-2 rounded-md cursor-pointer transition-colors duration-200 text-sm font-medium border';
const navLinkInactiveClasses =
  'bg-white text-gray-700 border-gray-200 hover:bg-gray-100 hover:border-blue-500';
const navLinkActiveClasses = 'bg-blue-600 text-white border-blue-600 shadow-sm';

const Layout: React.FC = () => {
  const location = useLocation();
  const isPlanningPage = /^\/trips\/\d+$/.test(location.pathname);

  // --- НОВЫЙ КОД: Подключаемся к search стору ---
  const { searchTerm, setSearchTerm, clearSearchTerm } = useSearchStore();

  // --- НОВЫЙ КОД: Сбрасываем поиск при смене страницы ---
  useEffect(() => {
    clearSearchTerm();
  }, [location.pathname, clearSearchTerm]);

  // --- НОВЫЙ КОД: Логика для динамического плейсхолдера ---
  const getPlaceholder = () => {
    if (isPlanningPage || location.pathname === '/') return 'Поиск недоступен здесь';
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

  // --- НОВЫЙ КОД: Определяем, активен ли поиск на текущей странице ---
  const isSearchDisabled =
    isPlanningPage || location.pathname === '/' || location.pathname === '/categories';

  return (
    <div className="max-w-7xl mx-auto p-4 font-sans bg-gray-50 min-h-screen">
      <Toaster position="bottom-right" />

      <header className="text-center mb-6 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
        <h1 className="text-3xl font-bold text-gray-800">Trek Meal</h1>
        <p className="mt-1 text-sm text-gray-500">Планирование питания для походов</p>
      </header>

      {/* --- НОВЫЙ КОД: Глобальная навигация с поиском --- */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <nav className="flex justify-center gap-2 flex-wrap">
          {/* ... (ссылки NavLink остаются без изменений) ... */}
          <NavLink
            to="/"
            className={({ isActive }) =>
              cn(navLinkBaseClasses, {
                [navLinkActiveClasses]: isActive,
                [navLinkInactiveClasses]: !isActive,
              })
            }
          >
            Главная
          </NavLink>
          <NavLink
            to="/products"
            className={({ isActive }) =>
              cn(navLinkBaseClasses, {
                [navLinkActiveClasses]: isActive,
                [navLinkInactiveClasses]: !isActive,
              })
            }
          >
            Продукты
          </NavLink>
          <NavLink
            to="/dishes"
            className={({ isActive }) =>
              cn(navLinkBaseClasses, {
                [navLinkActiveClasses]: isActive,
                [navLinkInactiveClasses]: !isActive,
              })
            }
          >
            Блюда
          </NavLink>
          <NavLink
            to="/categories"
            className={({ isActive }) =>
              cn(navLinkBaseClasses, {
                [navLinkActiveClasses]: isActive,
                [navLinkInactiveClasses]: !isActive,
              })
            }
          >
            Категории
          </NavLink>
          <NavLink
            to="/participants"
            className={({ isActive }) =>
              cn(navLinkBaseClasses, {
                [navLinkActiveClasses]: isActive,
                [navLinkInactiveClasses]: !isActive,
              })
            }
          >
            Участники
          </NavLink>
          <NavLink
            to="/trips"
            className={({ isActive }) =>
              cn(navLinkBaseClasses, {
                [navLinkActiveClasses]: isActive && !isPlanningPage,
                [navLinkInactiveClasses]: !isActive || isPlanningPage,
              })
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
        </nav>

        <div className="w-full md:w-auto">
          <input
            type="text"
            placeholder={getPlaceholder()}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            disabled={isSearchDisabled}
            className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
        </div>
      </div>

      <main className="bg-white border border-gray-200 rounded-lg shadow-sm min-h-[600px]">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
